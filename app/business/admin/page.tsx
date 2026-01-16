'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { user } = useAuth()
  const [accountsData, setAccountsData] = useState([])
  const [journalEntriesData, setJournalEntriesData] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
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
        <h1 className="text-2xl md:text-3xl text-slate-100">Admin</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Manage accounts, journal entries, and audit logs</p>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 w-full md:w-auto">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-slate-800 flex-1 md:flex-none">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-slate-800 flex-1 md:flex-none">
            Journal
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-slate-800 flex-1 md:flex-none">
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="bg-slate-900 border-slate-800 p-4 md:p-6">
              <p className="text-slate-400 text-xs md:text-sm">Total Assets</p>
              <h3 className="text-lg md:text-2xl text-slate-100 mt-1 md:mt-2">${stats.totalAssets.toFixed(2)}</h3>
            </Card>
            <Card className="bg-slate-900 border-slate-800 p-4 md:p-6">
              <p className="text-slate-400 text-xs md:text-sm">Total Liabilities</p>
              <h3 className="text-lg md:text-2xl text-slate-100 mt-1 md:mt-2">${stats.totalLiabilities.toFixed(2)}</h3>
            </Card>
            <Card className="bg-slate-900 border-slate-800 p-4 md:p-6">
              <p className="text-slate-400 text-xs md:text-sm">Total Equity</p>
              <h3 className="text-lg md:text-2xl text-slate-100 mt-1 md:mt-2">${stats.totalEquity.toFixed(2)}</h3>
            </Card>
            <Card className="bg-slate-900 border-slate-800 p-4 md:p-6">
              <p className="text-slate-400 text-xs md:text-sm">Net Income</p>
              <h3 className="text-lg md:text-2xl text-slate-100 mt-1 md:mt-2">${stats.netIncome.toFixed(2)}</h3>
            </Card>
          </div>
          <DataTable
            columns={accountColumns}
            data={accountsData}
            searchPlaceholder="Search accounts..."
            onView={(row) => console.log('View', row)}
            onEdit={(row) => console.log('Edit', row)}
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
