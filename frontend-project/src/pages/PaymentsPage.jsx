import { useEffect, useMemo, useState } from 'react'
import { api } from '../auth/api'

function toLocalDateTimeInputValue(d) {
  const date = new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function previewAmountRwf(entryTime, exitTime) {
  const entry = new Date(entryTime)
  const exit = new Date(exitTime)
  const diffMs = exit.getTime() - entry.getTime()
  if (!Number.isFinite(diffMs) || diffMs < 0) return null
  const hours = diffMs / (1000 * 60 * 60)
  const billHours = Math.max(1, Math.ceil(hours))
  return billHours * 500
}

export default function PaymentsPage() {
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => toLocalDateTimeInputValue(new Date()))
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function load() {
    const [r, p] = await Promise.all([api.get('/api/parking-records'), api.get('/api/payments')])
    setRecords(r.data)
    setPayments(p.data)
  }

  function clearForm() {
    setEditingId(null)
    setSelectedRecordId('')
    setPaymentDate(toLocalDateTimeInputValue(new Date()))
    setError(null)
    setMessage(null)
  }

  function validateForm() {
    if (!selectedRecordId) return 'Parking record is required.'
    if (!paymentDate) return 'Payment date is required.'
    return null
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const closedRecords = records.filter((r) => r.exitTime)
  const selected = useMemo(() => records.find((x) => x._id === selectedRecordId) || null, [records, selectedRecordId])
  const preview = useMemo(() => {
    if (!selected || !selected.exitTime) return null
    return previewAmountRwf(selected.entryTime, selected.exitTime)
  }, [selected])

  function recordLabel(recordId) {
    const record = records.find((r) => r._id === String(recordId))
    return record ? `Slot ${record.slotNumber} - ${record.plateNumber}` : 'Unknown record'
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Create, update, and delete payments for closed parking records.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Payments</div>
          <div className="metric-value">{payments.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Closed Records</div>
          <div className="metric-value">{closedRecords.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Preview Amount</div>
          <div className="metric-value">{preview === null ? '0' : preview}</div>
          <div className="mt-1 text-xs text-slate-500">Rwf</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">{editingId ? 'Update payment' : 'Create payment'}</div>
        </div>
        <form
          className="panel-body form-grid"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setMessage(null)

            const validationError = validateForm()
            if (validationError) {
              setError(validationError)
              return
            }

            try {
              const payload = { parkingRecordId: selectedRecordId, paymentDate }
              if (editingId) {
                await api.put(`/api/payments/${editingId}`, payload)
                clearForm()
                setMessage('Payment updated')
              } else {
                await api.post('/api/payments', payload)
                clearForm()
                setMessage('Payment created')
              }
              await load()
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to save payment')
            }
          }}
        >
          <div className="md:col-span-2">
            <label className="field-label">Parking Record</label>
            <select className="field-input" value={selectedRecordId} onChange={(e) => setSelectedRecordId(e.target.value)} required>
              <option value="">Select closed record</option>
              {closedRecords.map((r) => (
                <option key={r._id} value={r._id}>
                  Slot {r.slotNumber} - {r.plateNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Payment Date</label>
            <input className="field-input" type="datetime-local" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
          </div>

          <div>
            <label className="field-label">Amount Preview</label>
            <div className="mt-1 flex min-h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
              {preview === null ? <span className="font-normal text-slate-500">Select a closed record</span> : `${preview} Rwf`}
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error ? <div className="form-alert-error">{error}</div> : message ? <div className="form-alert-info">{message}</div> : <div className="text-sm text-slate-500">Parking record and payment date are required.</div>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={clearForm}>
                Clear
              </button>
              <button className="btn-primary w-full sm:w-auto">{editingId ? 'Update Payment' : 'Create Payment'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Payment list</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="font-semibold text-slate-950">{recordLabel(payment.parkingRecordId)}</td>
                  <td>{payment.amountPaid} Rwf</td>
                  <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-small"
                        onClick={() => {
                          setEditingId(payment._id)
                          setSelectedRecordId(String(payment.parkingRecordId))
                          setPaymentDate(toLocalDateTimeInputValue(payment.paymentDate))
                          setError(null)
                          setMessage(null)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={async () => {
                          if (!window.confirm('Delete this payment?')) return
                          setError(null)
                          setMessage(null)
                          try {
                            await api.delete(`/api/payments/${payment._id}`)
                            if (editingId === payment._id) clearForm()
                            setMessage('Payment deleted')
                            await load()
                          } catch (err) {
                            setError(err?.response?.data?.message || 'Failed to delete payment')
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={4}>
                    No payments yet.
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
