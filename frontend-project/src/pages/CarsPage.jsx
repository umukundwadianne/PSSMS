import { useEffect, useState } from 'react'
import { api } from '../auth/api'

export default function CarsPage() {
  const [cars, setCars] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [plateNumber, setPlateNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function load() {
    const res = await api.get('/api/cars')
    setCars(res.data)
  }

  function clearForm() {
    setEditingId(null)
    setPlateNumber('')
    setDriverName('')
    setPhoneNumber('')
    setError(null)
    setMessage(null)
  }

  function validateForm() {
    if (!plateNumber.trim() || !driverName.trim() || !phoneNumber.trim()) {
      return 'Plate number, driver name, and phone number are required.'
    }

    const normalizedPhone = phoneNumber.replace(/\s+/g, '')

    if (plateNumber.trim().length < 3) return 'Plate number must be at least 3 characters.'
    if (plateNumber.trim().length > 10) return 'Plate number is too long.'

    // Rwanda plate validation (typical): 3 letters + 3-4 digits (e.g., RAA1234, RAB123)
    // Case-insensitive.
    if (!/^[A-Z]{3}\d{3,4}$/i.test(plateNumber.trim())) {
      return 'Plate number must be in the form AAA123 or AAA1234 (Rwanda format).'
    }

    if (driverName.trim().length < 2) return 'Driver name must be at least 2 characters.'


    // Must be exactly 10 digits and start with 078, 079, 072, or 073
    if (!/^(078|079|072|073)\d{7}$/.test(normalizedPhone)) {
      return 'Phone number must be 10 digits starting with 078, 079, 072, or 073.'
    }

    return null
  }


  useEffect(() => {
    load().catch(() => {})
  }, [])

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cars</h1>
          <p className="page-subtitle">Register, update, and remove vehicles used in parking operations.</p>
        </div>
        <div className="metric-card w-full sm:w-48">
          <div className="metric-label">Total Cars</div>
          <div className="metric-value">{cars.length}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">{editingId ? 'Update car' : 'Add car'}</div>
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
              const payload = { plateNumber, driverName, phoneNumber }
              if (editingId) {
                await api.put(`/api/cars/${editingId}`, payload)
                clearForm()
                setMessage('Car updated')
              } else {
                await api.post('/api/cars', payload)
                clearForm()
                setMessage('Car added')
              }
              await load()
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to save car')
            }
          }}
        >
          <div>
            <label className="field-label">Plate Number</label>
            <input className="field-input" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required minLength={3} />
          </div>
          <div>
            <label className="field-label">Driver Name</label>
            <input className="field-input" value={driverName} onChange={(e) => setDriverName(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="field-label">Phone Number</label>
            <input className="field-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error ? <div className="form-alert-error">{error}</div> : message ? <div className="form-alert-info">{message}</div> : <div className="text-sm text-slate-500">All fields are required.</div>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={clearForm}>
                Clear
              </button>
              <button className="btn-primary w-full sm:w-auto">{editingId ? 'Update Car' : 'Add Car'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Car list</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Driver</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c._id}>
                  <td className="font-semibold text-slate-950">{c.plateNumber}</td>
                  <td>{c.driverName}</td>
                  <td>{c.phoneNumber}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-small"
                        onClick={() => {
                          setEditingId(c._id)
                          setPlateNumber(c.plateNumber)
                          setDriverName(c.driverName)
                          setPhoneNumber(c.phoneNumber)
                          setError(null)
                          setMessage(null)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={async () => {
                          if (!window.confirm('Delete this car?')) return
                          setError(null)
                          setMessage(null)
                          try {
                            await api.delete(`/api/cars/${c._id}`)
                            if (editingId === c._id) clearForm()
                            setMessage('Car deleted')
                            await load()
                          } catch (err) {
                            setError(err?.response?.data?.message || 'Failed to delete car')
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cars.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={4}>
                    No cars yet.
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
