import { useState } from 'react'
import { api } from '../auth/api'
import { Link, useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title">Reset Password</div>
        <div className="auth-text">Enter your username and choose a new password.</div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await api.post('/api/auth/reset-password', { username, newPassword })
              navigate('/login')
            } catch (err) {
              setError(err?.response?.data?.message || 'Reset failed')
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
            <label className="field-label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field-input"
              required
              minLength={6}
            />
          </div>

          {error ? (
            <div className="form-alert-error">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-sm">
          <Link className="btn-secondary w-full" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

