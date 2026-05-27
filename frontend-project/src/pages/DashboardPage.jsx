// DashboardPage.jsx
import { useEffect, useState } from 'react'
import { api } from '../auth/api'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [carsCount, setCarsCount] = useState(0)
  const [slotsCount, setSlotsCount] = useState(0)
  const [recordsCount, setRecordsCount] = useState(0)
  const [paymentsCount, setPaymentsCount] = useState(0)

  async function loadCounts() {
    setLoading(true)
    setError(null)
    try {
      const [carsRes, slotsRes, recordsRes, paymentsRes] = await Promise.all([
        api.get('/api/cars'),
        api.get('/api/parking-slots'),
        api.get('/api/parking-records'),
        api.get('/api/payments'),
      ])

      setCarsCount(Array.isArray(carsRes.data) ? carsRes.data.length : 0)
      setSlotsCount(Array.isArray(slotsRes.data) ? slotsRes.data.length : 0)
      setRecordsCount(Array.isArray(recordsRes.data) ? recordsRes.data.length : 0)
      setPaymentsCount(Array.isArray(paymentsRes.data) ? paymentsRes.data.length : 0)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCounts().catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  })

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">dashboard</h1>
          <p className="page-subtitle">System overview of Parking Space Sales Management (PSSMS).</p>
        </div>

        <div className="metric-card w-full sm:w-72">
          <div className="metric-label">Today</div>
          <div className="metric-value">{today}</div>
          <div className="mt-2 text-xs text-slate-500">Use the left menu to manage records.</div>
        </div>
      </div>

      {error ? (
        <div className="form-alert-error">{error}</div>
      ) : null}

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Cars</div>
          <div className="metric-value">{loading ? '...' : carsCount}</div>
          <div className="mt-2 text-sm text-slate-600">Vehicle details</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Parking Slots</div>
          <div className="metric-value">{loading ? '...' : slotsCount}</div>
          <div className="mt-2 text-sm text-slate-600">Availability control</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Parking Records</div>
          <div className="metric-value">{loading ? '...' : recordsCount}</div>
          <div className="mt-2 text-sm text-slate-600">Entries and exits</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Payments</div>
          <div className="metric-value">{loading ? '...' : paymentsCount}</div>
          <div className="mt-2 text-sm text-slate-600">Billing and settlement</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">System Modules</div>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">🚗</span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">Cars</div>
                  <div className="text-xs text-slate-500">Add, update, and remove cars.</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">🅿️</span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">Parking Slots</div>
                  <div className="text-xs text-slate-500">Manage slot status (available/occupied/disabled).</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">📒</span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">Parking Records</div>
                  <div className="text-xs text-slate-500">Create entries and close sessions.</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">💳</span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">Payments</div>
                  <div className="text-xs text-slate-500">Record payment dates for closed records.</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">📊</span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">Reports</div>
                  <div className="text-xs text-slate-500">Use the Reports page to view daily summaries.</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="status-pill bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">Daily totals</span>
                    <span className="status-pill bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">Record details</span>
                    <span className="status-pill bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">Export-ready UI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">How to use</div>
        </div>
        <div className="panel-body">
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900/5 border border-slate-200">1</span>
              <div>
                Start with <span className="font-semibold">Cars</span> and <span className="font-semibold">Parking Slots</span>.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900/5 border border-slate-200">2</span>
              <div>
                Create <span className="font-semibold">Parking Records</span> when vehicles enter, then set exit time to close.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900/5 border border-slate-200">3</span>
              <div>
                Register <span className="font-semibold">Payments</span> and check your daily totals in <span className="font-semibold">Reports</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

