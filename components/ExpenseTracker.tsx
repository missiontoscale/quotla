'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Expense, ExpenseCategory, CreateExpenseInput, DEFAULT_EXPENSE_CATEGORIES } from '@/types/expenses'
import { formatCurrency } from '@/lib/utils/validation'
import { getUserCurrency, setUserCurrency, CURRENCIES } from '@/lib/utils/currency'
import { format } from 'date-fns'

export default function ExpenseTracker() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [userCurrency, setUserCurrencyState] = useState<string>('USD')

  // Initialize user's preferred currency
  useEffect(() => {
    const savedCurrency = getUserCurrency()
    setUserCurrencyState(savedCurrency)
  }, [])

  // Form state
  const [newExpense, setNewExpense] = useState<CreateExpenseInput>({
    description: '',
    amount: 0,
    currency: userCurrency,
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    is_tax_deductible: false,
    is_recurring: false,
  })

  // Update form currency when user currency changes
  useEffect(() => {
    setNewExpense(prev => ({ ...prev, currency: userCurrency }))
  }, [userCurrency])

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setUserCurrencyState(newCurrency)
    setUserCurrency(newCurrency)
    setNewExpense(prev => ({ ...prev, currency: newCurrency }))
  }

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, selectedMonth])

  const loadData = async () => {
    if (!user) return

    setLoading(true)

    // Load categories
    const { data: categoriesData } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (categoriesData && categoriesData.length === 0) {
      // Create default categories
      await createDefaultCategories()
    } else if (categoriesData) {
      setCategories(categoriesData)
    }

    // Load expenses for selected month
    const startDate = `${selectedMonth}-01`
    const endDate = new Date(selectedMonth + '-01')
    endDate.setMonth(endDate.getMonth() + 1)
    const endDateStr = endDate.toISOString().split('T')[0]

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('expense_date', startDate)
      .lt('expense_date', endDateStr)
      .order('expense_date', { ascending: false })

    if (expensesData) {
      setExpenses(expensesData)
    }

    setLoading(false)
  }

  const createDefaultCategories = async () => {
    if (!user) return

    const defaultCats = DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      user_id: user.id,
      name: cat.name,
      color: cat.color,
    }))

    const { data } = await supabase
      .from('expense_categories')
      .insert(defaultCats)
      .select()

    if (data) {
      setCategories(data)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...newExpense, user_id: user.id }])
      .select()

    if (error) {
      alert('Error adding expense: ' + error.message)
      return
    }

    if (data) {
      setExpenses([...data, ...expenses])
      setNewExpense({
        description: '',
        amount: 0,
        currency: 'USD',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        is_tax_deductible: false,
        is_recurring: false,
      })
      setIsAddingExpense(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting expense: ' + error.message)
      return
    }

    setExpenses(expenses.filter(e => e.id !== id))
  }

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const taxDeductible = expenses.filter(e => e.is_tax_deductible).reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-quotla-orange border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-quotla-dark">Expense Tracker</h2>
          <p className="text-quotla-dark/60 text-sm">Track business expenses and calculate profit/loss</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={userCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-3 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange text-sm"
          >
            {CURRENCIES.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddingExpense(true)}
            className="px-4 py-2 bg-quotla-orange text-white rounded-xl font-semibold hover:bg-secondary-600 transition-all shadow-lg hover:shadow-xl"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-4">
        <label className="text-quotla-dark font-semibold">Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-quotla-dark/10 shadow-sm">
          <div className="text-quotla-dark/60 text-sm font-semibold mb-2">Total Expenses</div>
          <div className="font-heading text-3xl font-bold text-quotla-dark">
            {formatCurrency(totalExpenses, userCurrency)}
          </div>
          <div className="text-quotla-dark/60 text-xs mt-1">{expenses.length} transactions</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-quotla-dark/10 shadow-sm">
          <div className="text-quotla-dark/60 text-sm font-semibold mb-2">Tax Deductible</div>
          <div className="font-heading text-3xl font-bold text-quotla-green">
            {formatCurrency(taxDeductible, userCurrency)}
          </div>
          <div className="text-quotla-dark/60 text-xs mt-1">
            {expenses.filter(e => e.is_tax_deductible).length} deductible
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-quotla-dark/10 shadow-sm">
          <div className="text-quotla-dark/60 text-sm font-semibold mb-2">Top Category</div>
          <div className="font-heading text-2xl font-bold text-quotla-orange">
            {Object.keys(byCategory).length > 0
              ? Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'}
          </div>
          <div className="text-quotla-dark/60 text-xs mt-1">
            {Object.keys(byCategory).length > 0
              ? formatCurrency(Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][1], userCurrency)
              : ''}
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {isAddingExpense && (
        <div className="bg-white rounded-2xl p-6 border-2 border-quotla-orange shadow-lg">
          <h3 className="font-heading text-lg font-bold text-quotla-dark mb-4">Add New Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Description *</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                  placeholder="e.g., Office supplies"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Amount *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Category *</label>
                <select
                  required
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Payment Method</label>
                <select
                  value={newExpense.payment_method || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-quotla-dark mb-2">Vendor Name</label>
                <input
                  type="text"
                  value={newExpense.vendor_name || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor_name: e.target.value })}
                  className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                  placeholder="e.g., Amazon"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpense.is_tax_deductible}
                  onChange={(e) => setNewExpense({ ...newExpense, is_tax_deductible: e.target.checked })}
                  className="w-5 h-5 text-quotla-orange focus:ring-quotla-orange border-quotla-dark/20 rounded"
                />
                <span className="text-sm font-semibold text-quotla-dark">Tax Deductible</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpense.is_recurring}
                  onChange={(e) => setNewExpense({ ...newExpense, is_recurring: e.target.checked })}
                  className="w-5 h-5 text-quotla-orange focus:ring-quotla-orange border-quotla-dark/20 rounded"
                />
                <span className="text-sm font-semibold text-quotla-dark">Recurring</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-quotla-dark mb-2">Notes</label>
              <textarea
                value={newExpense.notes || ''}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="w-full px-4 py-2 border border-quotla-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-quotla-orange"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingExpense(false)}
                className="px-6 py-2 border border-quotla-dark/20 rounded-xl font-semibold text-quotla-dark hover:bg-quotla-dark/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-quotla-orange text-white rounded-xl font-semibold hover:bg-secondary-600 transition-all shadow-lg"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-quotla-dark/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-quotla-dark/10">
          <h3 className="font-heading text-lg font-bold text-quotla-dark">Recent Expenses</h3>
        </div>

        {expenses.length > 0 ? (
          <div className="divide-y divide-quotla-dark/10">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-quotla-light/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-quotla-dark">{expense.description}</h4>
                      <span className="px-2 py-1 bg-quotla-dark/10 text-quotla-dark text-xs font-semibold rounded-full">
                        {expense.category}
                      </span>
                      {expense.is_tax_deductible && (
                        <span className="px-2 py-1 bg-quotla-green/10 text-quotla-green text-xs font-semibold rounded-full">
                          Tax Deductible
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-quotla-dark/60">
                      <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                      {expense.vendor_name && <span>• {expense.vendor_name}</span>}
                      {expense.payment_method && <span>• {expense.payment_method}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-heading text-xl font-bold text-quotla-dark">
                      {formatCurrency(expense.amount, expense.currency)}
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete expense"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {expense.notes && (
                  <div className="mt-3 text-sm text-quotla-dark/60 italic">
                    {expense.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-quotla-dark/5 mb-4">
              <svg className="w-8 h-8 text-quotla-dark/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-bold text-quotla-dark mb-2">No expenses yet</h3>
            <p className="text-quotla-dark/60 mb-4">Start tracking your business expenses</p>
            <button
              onClick={() => setIsAddingExpense(true)}
              className="px-6 py-2 bg-quotla-orange text-white rounded-xl font-semibold hover:bg-secondary-600 transition-all shadow-lg"
            >
              Add Your First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
