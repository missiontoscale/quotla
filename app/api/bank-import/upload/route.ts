import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseStatement, detectFileType } from '@/lib/bank-import/parsers'
import { categorizeTransactions, extractVendorName } from '@/lib/bank-import/categorizer'
import {
  findMatchingInvoice,
  markInvoiceAsPaid,
  createInvoiceFromTransaction,
} from '@/lib/bank-import/invoice-matcher'
import { ImportResult, CategorizedTransaction } from '@/types/bank-import'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bankHint = formData.get('bank') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const fileType = detectFileType(file)
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload CSV, Excel, or PDF.' },
        { status: 400 }
      )
    }

    // Get user's default currency
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_currency')
      .eq('id', user.id)
      .single()

    const currency = profile?.default_currency || 'NGN'

    // Create import batch record
    const { data: importBatch, error: batchError } = await supabase
      .from('bank_statement_imports')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        bank_name: bankHint || null,
        status: 'processing',
      })
      .select('id')
      .single()

    if (batchError || !importBatch) {
      console.error('Failed to create import batch:', batchError)
      return NextResponse.json(
        { error: 'Failed to create import record' },
        { status: 500 }
      )
    }

    const batchId = importBatch.id

    try {
      // Parse the file
      const parseResult = await parseStatement(file, bankHint || undefined)

      if (!parseResult.success || parseResult.transactions.length === 0) {
        await updateImportStatus(supabase, batchId, 'failed', parseResult.error || 'No transactions found')
        return NextResponse.json(
          { error: parseResult.error || 'No transactions found in file' },
          { status: 400 }
        )
      }

      // Update batch with bank info
      await supabase
        .from('bank_statement_imports')
        .update({
          bank_name: parseResult.bankName || bankHint,
          account_number: parseResult.accountNumber,
          statement_period_start: parseResult.periodStart?.toISOString().split('T')[0],
          statement_period_end: parseResult.periodEnd?.toISOString().split('T')[0],
          total_transactions: parseResult.transactions.length,
        })
        .eq('id', batchId)

      // Categorize transactions
      const categorized = categorizeTransactions(parseResult.transactions)

      // Get existing expenses to check for duplicates
      const { data: existingExpenses } = await supabase
        .from('expenses')
        .select('expense_date, amount, bank_transaction_id')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(500)

      // Process transactions
      const results: CategorizedTransaction[] = []
      let importedExpenses = 0
      let importedIncome = 0
      let skippedTransactions = 0
      let newInvoicesCreated = 0
      let invoicesMarkedPaid = 0

      for (const tx of categorized) {
        // Skip transfers
        if (tx.type === 'transfer') {
          skippedTransactions++
          results.push({ ...tx, imported: false, error: 'Skipped: Internal transfer' })
          continue
        }

        // Skip unknown/zero amounts
        if (tx.type === 'unknown' || tx.amount === 0) {
          skippedTransactions++
          results.push({ ...tx, imported: false, error: 'Skipped: Unknown or zero amount' })
          continue
        }

        // Check for duplicates
        const isDuplicate = existingExpenses?.some((exp) => {
          if (tx.reference && exp.bank_transaction_id === tx.reference) {
            return true
          }
          const expDate = new Date(exp.expense_date).toISOString().split('T')[0]
          const txDate = tx.date.toISOString().split('T')[0]
          return expDate === txDate && Math.abs(exp.amount - Math.abs(tx.amount)) < 0.01
        })

        if (isDuplicate) {
          skippedTransactions++
          results.push({ ...tx, imported: false, error: 'Skipped: Duplicate transaction' })
          continue
        }

        // Process based on type
        if (tx.type === 'expense') {
          // Create expense record
          const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
              user_id: user.id,
              description: tx.description,
              amount: Math.abs(tx.amount),
              currency,
              category: tx.category || 'Miscellaneous',
              expense_date: tx.date.toISOString().split('T')[0],
              vendor_name: extractVendorName(tx.description),
              status: 'approved',
              import_batch_id: batchId,
              bank_transaction_id: tx.reference || null,
              bank_description: tx.description,
              is_tax_deductible: false,
              is_recurring: false,
            })
            .select('id')
            .single()

          if (expenseError) {
            results.push({ ...tx, imported: false, error: expenseError.message })
          } else {
            importedExpenses++
            results.push({
              ...tx,
              imported: true,
              importedRecordId: expense?.id,
            })
          }
        } else if (tx.type === 'income') {
          // Try to match with existing invoice
          const match = await findMatchingInvoice(tx, user.id)

          if (match && match.confidence >= 0.6) {
            // Mark invoice as paid
            const markResult = await markInvoiceAsPaid(match.invoiceId, user.id)

            if (markResult.success) {
              invoicesMarkedPaid++
              results.push({
                ...tx,
                imported: true,
                matchedInvoiceId: match.invoiceId,
                importedRecordId: match.invoiceId,
              })
              importedIncome++
            } else {
              results.push({ ...tx, imported: false, error: markResult.error })
            }
          } else {
            // Create new invoice for unmatched income
            const createResult = await createInvoiceFromTransaction(tx, user.id, currency)

            if (createResult.success) {
              newInvoicesCreated++
              results.push({
                ...tx,
                imported: true,
                importedRecordId: createResult.invoiceId,
              })
              importedIncome++
            } else {
              results.push({ ...tx, imported: false, error: createResult.error })
            }
          }
        }
      }

      // Update import batch with final stats
      await supabase
        .from('bank_statement_imports')
        .update({
          imported_expenses: importedExpenses,
          imported_income: importedIncome,
          skipped_transactions: skippedTransactions,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', batchId)

      const response: ImportResult = {
        success: true,
        batchId,
        summary: {
          totalTransactions: parseResult.transactions.length,
          importedExpenses,
          importedIncome,
          skippedTransactions,
          newInvoicesCreated,
          invoicesMarkedPaid,
        },
        transactions: results,
      }

      return NextResponse.json(response)
    } catch (processError) {
      console.error('Error processing bank statement:', processError)
      await updateImportStatus(
        supabase,
        batchId,
        'failed',
        processError instanceof Error ? processError.message : 'Processing failed'
      )
      throw processError
    }
  } catch (error) {
    console.error('Bank import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}

async function updateImportStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  batchId: string,
  status: string,
  errorMessage?: string
) {
  await supabase
    .from('bank_statement_imports')
    .update({
      status,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', batchId)
}
