import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../auth/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title">Register</div>
        <div className="auth-text">Create a new admin user.</div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)

            try {
              await api.post('/api/auth/register', { username, password })
              navigate('/login')
            } catch (err) {
              setError(err?.response?.data?.message || 'Register failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div>
            <label className="field-label">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              required
              minLength={6}
            />
          </div>

          {error ? <div className="form-alert-error">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-sm">
          <Link className="btn-secondary w-full" to="/login">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}
