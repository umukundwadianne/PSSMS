import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../auth/api'

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title">Forgot Password</div>
        <div className="auth-text">Request password recovery for your username.</div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setMessage(null)
            setLoading(true)

            try {
              await api.post('/api/auth/forgot-password', { username })
              setMessage('Recovery request sent. Continue to reset password when ready.')
            } catch (err) {
              setError(err?.response?.data?.message || 'Request failed')
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

          {error ? <div className="form-alert-error">{error}</div> : null}

          {message ? <div className="form-alert-info">{message}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Requesting...' : 'Request recovery'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t pt-6 text-sm">
          <Link className="link-button w-full" to="/reset-password">
            Reset password
          </Link>
          <Link className="btn-secondary w-full" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
