import { useEffect, useState } from 'react'
import { api } from '../auth/api'

function todayYYYYMMDD() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function ReportsPage() {
  const [date, setDate] = useState(todayYYYYMMDD())
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadReport() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/reports/daily-payments?date=${encodeURIComponent(date)}`)
      setData(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  function clearReport() {
    setDate(todayYYYYMMDD())
    setData(null)
    setError(null)
  }

  useEffect(() => {
    loadReport().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = Array.isArray(data?.rows) ? data.rows : []
  const totalAmount = rows.reduce((total, row) => total + Number(row?.amountPaid || 0), 0)

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Review daily payment activity and parking details.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Payments</div>
          <div className="metric-value">{data?.paymentsCount ?? rows.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Amount</div>
          <div className="metric-value">{totalAmount}</div>
          <div className="mt-1 text-xs text-slate-500">Rwf</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <button type="button" className="btn-secondary w-full md:w-auto" onClick={clearReport}>
                Clear
              </button>
              <button
                className="btn-primary w-full md:w-auto"
                disabled={loading}
                onClick={() => loadReport()}
              >
                {loading ? 'Loading...' : 'Fetch Report'}
              </button>
            </div>
          </div>

          {error ? <div className="form-alert-error mt-4">{error}</div> : null}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            {data
              ? `${data.paymentsCount ?? rows.length} payment(s) for ${data.date ?? date}`
              : 'Results'}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (Rwf)</th>
                <th>Slot</th>
                <th>Plate</th>
                <th>Driver</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.paymentId ?? row._id}>
                  <td>{row.paymentDate ? new Date(row.paymentDate).toLocaleString() : '-'}</td>
                  <td className="font-semibold text-slate-950">{row.amountPaid ?? '-'}</td>
                  <td>{row.slotNumber ?? '-'}</td>
                  <td className="font-semibold text-slate-950">{row.plateNumber ?? '-'}</td>
                  <td>{row.driverName ?? '-'}</td>
                  <td>{row.phoneNumber ?? '-'}</td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>
                    No payments found for this date.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
