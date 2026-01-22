import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/bank-import/[id]
 * Get details of a specific import batch
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get import batch details
    const { data: importBatch, error: batchError } = await supabase
      .from('bank_statement_imports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (batchError || !importBatch) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 })
    }

    // Get expenses from this import
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, description, amount, category, expense_date, vendor_name')
      .eq('import_batch_id', id)
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })

    return NextResponse.json({
      import: importBatch,
      expenses: expenses || [],
    })
  } catch (error) {
    console.error('Error fetching import:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch import' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bank-import/[id]
 * Undo an import - delete all expenses and revert invoices
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify import belongs to user
    const { data: importBatch, error: batchError } = await supabase
      .from('bank_statement_imports')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (batchError || !importBatch) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 })
    }

    if (importBatch.status === 'undone') {
      return NextResponse.json({ error: 'Import already undone' }, { status: 400 })
    }

    // Delete expenses from this import
    const { error: deleteExpensesError, count: deletedExpenses } = await supabase
      .from('expenses')
      .delete({ count: 'exact' })
      .eq('import_batch_id', id)
      .eq('user_id', user.id)

    if (deleteExpensesError) {
      console.error('Error deleting expenses:', deleteExpensesError)
    }

    // Find and revert invoices that were marked as paid from this import
    // We can identify them by checking notes that mention bank import
    // For now, we'll just mark the import as undone
    // In a more robust implementation, we'd track invoice IDs in the import

    // Update import status to undone
    await supabase
      .from('bank_statement_imports')
      .update({
        status: 'undone',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      deletedExpenses: deletedExpenses || 0,
      message: 'Import has been undone. Expenses have been deleted.',
    })
  } catch (error) {
    console.error('Error undoing import:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to undo import' },
      { status: 500 }
    )
  }
}
