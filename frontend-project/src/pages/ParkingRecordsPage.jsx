import { useEffect, useMemo, useState } from 'react'
import { api } from '../auth/api'

function toLocalDateTimeInputValue(d) {
  const date = new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function ParkingRecordsPage() {
  const [records, setRecords] = useState([])
  const [cars, setCars] = useState([])
  const [slots, setSlots] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [slotNumber, setSlotNumber] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [entryTime, setEntryTime] = useState(() => toLocalDateTimeInputValue(new Date()))
  const [exitTime, setExitTime] = useState('')

  const [exitTimeById, setExitTimeById] = useState({})
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function loadAll() {
    const [r, c, s] = await Promise.all([
      api.get('/api/parking-records'),
      api.get('/api/cars'),
      api.get('/api/parking-slots'),
    ])
    setRecords(r.data)
    setCars(c.data)
    setSlots(s.data)
  }

  function clearForm() {
    setEditingId(null)
    setSlotNumber('')
    setPlateNumber('')
    setEntryTime(toLocalDateTimeInputValue(new Date()))
    setExitTime('')
    setError(null)
    setMessage(null)
  }

  function validateForm() {
    if (!slotNumber) return 'Slot is required.'
    if (!plateNumber) return 'Car plate is required.'
    if (!entryTime) return 'Entry time is required.'
    if (exitTime && new Date(exitTime) < new Date(entryTime)) return 'Exit time cannot be before entry time.'
    return null
  }

  useEffect(() => {
    loadAll().catch(() => {})
  }, [])

  const openRecordCount = useMemo(() => records.filter((x) => !x.exitTime).length, [records])
  const closedRecordCount = records.length - openRecordCount

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parking Records</h1>
          <p className="page-subtitle">Create, update, close, and delete parking sessions.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total Records</div>
          <div className="metric-value">{records.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open</div>
          <div className="metric-value text-blue-700">{openRecordCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Closed</div>
          <div className="metric-value">{closedRecordCount}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">{editingId ? 'Update parking record' : 'Create parking entry'}</div>
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
              const payload = {
                slotNumber: Number(slotNumber),
                plateNumber,
                entryTime,
                exitTime: exitTime || null,
              }
              if (editingId) {
                await api.put(`/api/parking-records/${editingId}`, payload)
                clearForm()
                setMessage('Parking record updated')
              } else {
                await api.post('/api/parking-records', payload)
                clearForm()
                setMessage('Parking record created')
              }
              await loadAll()
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to save record')
            }
          }}
        >
          <div>
            <label className="field-label">Slot</label>
            <select className="field-input" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} required>
              <option value="">Select slot</option>
              {slots.map((s) => (
                <option key={s._id} value={String(s.slotNumber)}>
                  Slot {s.slotNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Car Plate</label>
            <select className="field-input" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required>
              <option value="">Select car</option>
              {cars.map((c) => (
                <option key={c._id} value={c.plateNumber}>
                  {c.plateNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Entry Time</label>
            <input className="field-input" type="datetime-local" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} required />
          </div>

          <div>
            <label className="field-label">Exit Time</label>
            <input className="field-input" type="datetime-local" value={exitTime} onChange={(e) => setExitTime(e.target.value)} />
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error ? <div className="form-alert-error">{error}</div> : message ? <div className="form-alert-info">{message}</div> : <div className="text-sm text-slate-500">Slot, car plate, and entry time are required.</div>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={clearForm}>
                Clear
              </button>
              <button className="btn-primary w-full sm:w-auto">{editingId ? 'Update Record' : 'Create Record'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Record list</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Plate</th>
                <th>Status</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const exitVal = exitTimeById[r._id] || ''
                return (
                  <tr key={r._id} className="align-top">
                    <td className="font-semibold text-slate-950">Slot {r.slotNumber}</td>
                    <td className="font-semibold text-slate-950">{r.plateNumber}</td>
                    <td>
                      <span className={`status-pill ${r.exitTime ? 'status-closed' : 'status-open'}`}>
                        {r.exitTime ? 'closed' : 'open'}
                      </span>
                    </td>
                    <td>{new Date(r.entryTime).toLocaleString()}</td>
                    <td>
                      {r.exitTime ? new Date(r.exitTime).toLocaleString() : <span className="text-slate-500">Not set</span>}
                      {!r.exitTime ? (
                        <div className="mt-2">
                          <input
                            className="field-input min-w-56"
                            type="datetime-local"
                            value={exitVal}
                            onChange={(e) => setExitTimeById((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          />
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-small"
                          onClick={() => {
                            setEditingId(r._id)
                            setSlotNumber(String(r.slotNumber))
                            setPlateNumber(r.plateNumber)
                            setEntryTime(toLocalDateTimeInputValue(r.entryTime))
                            setExitTime(r.exitTime ? toLocalDateTimeInputValue(r.exitTime) : '')
                            setError(null)
                            setMessage(null)
                          }}
                        >
                          Edit
                        </button>
                        {!r.exitTime ? (
                          <button
                            className="btn-small"
                            onClick={async () => {
                              setError(null)
                              setMessage(null)
                              try {
                                if (!exitVal) throw new Error('Exit time is required.')
                                await api.patch(`/api/parking-records/${r._id}/exit`, { exitTime: exitVal })
                                setExitTimeById((prev) => ({ ...prev, [r._id]: '' }))
                                setMessage('Exit time updated')
                                await loadAll()
                              } catch (err) {
                                setError(err?.response?.data?.message || err.message || 'Failed to update exit time')
                              }
                            }}
                          >
                            Set Exit
                          </button>
                        ) : null}
                        <button
                          className="btn-danger"
                          onClick={async () => {
                            if (!window.confirm('Delete this parking record?')) return
                            setError(null)
                            setMessage(null)
                            try {
                              await api.delete(`/api/parking-records/${r._id}`)
                              if (editingId === r._id) clearForm()
                              setMessage('Record deleted')
                              await loadAll()
                            } catch (err) {
                              setError(err?.response?.data?.message || 'Failed to delete record')
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
              {records.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>
                    No records yet.
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
