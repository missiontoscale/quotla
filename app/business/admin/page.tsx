'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, Scale, TrendingUp, BarChart3 } from 'lucide-react'
import { FilterSelect } from '@/components/filters'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserCurrency } from '@/hooks/useUserCurrency'
import {
  dashboardColors as colors,
  dashboardComponents as components,
  cn
} from '@/hooks/use-dashboard-theme'

type AccountTypeFilter = 'all' | 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'

export default function AdminPage() {
  const { user } = useAuth()
  const { currency } = useUserCurrency()
  const [accountsData, setAccountsData] = useState<any[]>([])
  const [journalEntriesData, setJournalEntriesData] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountTypeFilter>('all')

  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    netIncome: 0
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual data fetch from Supabase
      // Accounts data
      setAccountsData([])
      setJournalEntriesData([])
      // Audit logs
      setAuditLogs([])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (accountTypeFilter === 'all') return accountsData
    return accountsData.filter(account => account.type === accountTypeFilter)
  }, [accountsData, accountTypeFilter])

  // Account type filter options
  const accountTypeOptions = [
    { value: 'Asset', label: 'Asset', color: 'emerald' as const },
    { value: 'Liability', label: 'Liability', color: 'rose' as const },
    { value: 'Equity', label: 'Equity', color: 'cyan' as const },
    { value: 'Revenue', label: 'Revenue', color: 'blue' as const },
    { value: 'Expense', label: 'Expense', color: 'amber' as const },
  ]

  const accountColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Account Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeColors: Record<string, string> = {
          Asset: 'bg-emerald-500/20 text-emerald-400',
          Liability: 'bg-rose-500/20 text-rose-400',
          Equity: 'bg-violet-500/20 text-violet-400',
          Revenue: 'bg-cyan-500/20 text-cyan-400',
          Expense: 'bg-amber-500/20 text-amber-400',
        }
        return <Badge className={typeColors[value] || typeColors.Asset}>{value}</Badge>
      },
    },
    { key: 'category', label: 'Category' },
    {
      key: 'balance',
      label: 'Balance',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
    },
  ]

  const journalColumns = [
    { key: 'date', label: 'Date' },
    { key: 'reference', label: 'Reference' },
    { key: 'description', label: 'Description' },
    { key: 'debit', label: 'Debit Account' },
    { key: 'credit', label: 'Credit Account' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00'
    },
  ]

  const auditColumns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource' },
    { key: 'details', label: 'Details' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl text-primary-50">Admin</h1>
        <p className="text-primary-400 mt-1 text-sm md:text-base">Manage accounts, journal entries, and audit logs</p>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-quotla-dark/90 border border-primary-600 w-full md:w-auto">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-quotla-green/20 data-[state=active]:text-quotla-green flex-1 md:flex-none">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-quotla-green/20 data-[state=active]:text-quotla-green flex-1 md:flex-none">
            Journal
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-quotla-green/20 data-[state=active]:text-quotla-green flex-1 md:flex-none">
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6 space-y-6">
          {/* Stats Cards - Clean 2-column design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assets & Liabilities Card */}
            <Card className="bg-quotla-dark/90 border-primary-600 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-quotla-green/15 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-primary-400 uppercase tracking-wider">Total Assets</p>
                  <p className="text-2xl font-bold text-primary-50">{formatCurrency(stats.totalAssets, currency)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-primary-600">
                <div>
                  <p className="text-xs text-primary-400">Liabilities</p>
                  <p className="text-sm font-semibold text-rose-400">{formatCurrency(stats.totalLiabilities, currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-400">Net Position</p>
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(stats.totalAssets - stats.totalLiabilities, currency)}</p>
                </div>
              </div>
            </Card>

            {/* Equity & Income Card */}
            <Card className="bg-quotla-dark/90 border-primary-600 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-quotla-orange/10 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-quotla-orange" />
                </div>
                <div>
                  <p className="text-xs text-primary-400 uppercase tracking-wider">Total Equity</p>
                  <p className="text-2xl font-bold text-primary-50">{formatCurrency(stats.totalEquity, currency)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-primary-600">
                <div>
                  <p className="text-xs text-primary-400">Net Income</p>
                  <p className={`text-sm font-semibold ${stats.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(stats.netIncome, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-400">Status</p>
                  <p className="text-sm font-medium text-quotla-orange">Active</p>
                </div>
              </div>
            </Card>
          </div>
          <DataTable
            columns={accountColumns}
            data={filteredAccounts}
            searchPlaceholder="Search accounts..."
            onView={(row) => console.log('View', row)}
            onEdit={(row) => console.log('Edit', row)}
            filters={
              <FilterSelect
                options={accountTypeOptions}
                value={accountTypeFilter}
                onChange={(v) => setAccountTypeFilter(v as AccountTypeFilter)}
                placeholder="Type"
                allLabel="All Types"
              />
            }
          />
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <DataTable
            columns={journalColumns}
            data={journalEntriesData}
            searchPlaceholder="Search journal entries..."
            onView={(row) => console.log('View', row)}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <DataTable
            columns={auditColumns}
            data={auditLogs}
            searchPlaceholder="Search audit logs..."
            onView={(row) => console.log('View', row)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
