import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title">Login</div>
        <div className="auth-text">Use your username and password.</div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await login(username, password)
              navigate('/')
            } catch (err) {
              setError(err?.response?.data?.message || 'Login failed')
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
            />
          </div>

          {error ? <div className="form-alert-error">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t pt-6 text-sm text-slate-700">
          <Link className="link-button w-full" to="/register">
            Create an account
          </Link>
          <Link className="btn-secondary w-full" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}


