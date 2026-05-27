import { useEffect, useState } from 'react'
import { api } from '../auth/api'

export default function ParkingSlotsPage() {
  const [slots, setSlots] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [slotNumber, setSlotNumber] = useState('')
  const [slotStatus, setSlotStatus] = useState('available')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function load() {
    const res = await api.get('/api/parking-slots')
    setSlots(res.data)
  }

  function clearForm() {
    setEditingId(null)
    setSlotNumber('')
    setSlotStatus('available')
    setError(null)
    setMessage(null)
  }

  function validateForm() {
    const parsed = Number(slotNumber)
    if (!slotNumber) return 'Slot number is required.'
    if (!Number.isInteger(parsed) || parsed <= 0) return 'Slot number must be a positive whole number.'
    if (!slotStatus) return 'Slot status is required.'
    return null
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const availableCount = slots.filter((slot) => (slot.slotStatus || 'available') === 'available').length
  const occupiedCount = slots.filter((slot) => slot.slotStatus === 'occupied').length
  const disabledCount = slots.filter((slot) => slot.slotStatus === 'disabled').length

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parking Slots</h1>
          <p className="page-subtitle">Create, update, and remove parking spaces.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total Slots</div>
          <div className="metric-value">{slots.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Available</div>
          <div className="metric-value text-emerald-700">{availableCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Occupied</div>
          <div className="metric-value text-amber-700">{occupiedCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Disabled</div>
          <div className="metric-value">{disabledCount}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">{editingId ? 'Update parking slot' : 'Add parking slot'}</div>
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
              const payload = { slotNumber: Number(slotNumber), slotStatus }
              if (editingId) {
                await api.put(`/api/parking-slots/${editingId}`, payload)
                clearForm()
                setMessage('Slot updated')
              } else {
                await api.post('/api/parking-slots', payload)
                clearForm()
                setMessage('Slot added')
              }
              await load()
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to save slot')
            }
          }}
        >
          <div>
            <label className="field-label">Slot Number</label>
            <input className="field-input" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} required type="number" min="1" step="1" />
          </div>

          <div>
            <label className="field-label">Slot Status</label>
            <select className="field-input" value={slotStatus} onChange={(e) => setSlotStatus(e.target.value)} required>
              <option value="available">available</option>
              <option value="occupied">occupied</option>
              <option value="disabled">disabled</option>
            </select>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error ? <div className="form-alert-error">{error}</div> : message ? <div className="form-alert-info">{message}</div> : <div className="text-sm text-slate-500">Slot number and status are required.</div>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={clearForm}>
                Clear
              </button>
              <button className="btn-primary w-full sm:w-auto">{editingId ? 'Update Slot' : 'Add Slot'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Slot list</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => {
                const status = s.slotStatus || 'available'
                return (
                  <tr key={s._id}>
                    <td className="font-semibold text-slate-950">Slot {s.slotNumber}</td>
                    <td>
                      <span className={`status-pill ${status === 'available' ? 'status-available' : status === 'occupied' ? 'status-occupied' : 'status-closed'}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-small"
                          onClick={() => {
                            setEditingId(s._id)
                            setSlotNumber(String(s.slotNumber))
                            setSlotStatus(status)
                            setError(null)
                            setMessage(null)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={async () => {
                            if (!window.confirm('Delete this parking slot?')) return
                            setError(null)
                            setMessage(null)
                            try {
                              await api.delete(`/api/parking-slots/${s._id}`)
                              if (editingId === s._id) clearForm()
                              setMessage('Slot deleted')
                              await load()
                            } catch (err) {
                              setError(err?.response?.data?.message || 'Failed to delete slot')
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {slots.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={3}>
                    No slots yet.
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
