import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../auth/api'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Register
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [registerError, setRegisterError] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  // Forgot
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotError, setForgotError] = useState(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState(null)


  const [error, setError] = useState(null)

  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <div className="text-2xl font-bold">Login</div>
        <div className="mt-1 text-sm text-gray-600">Use your username and password.</div>

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
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-3 py-2 text-white font-medium disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6">
          <div className="text-lg font-semibold">Register</div>
          <div className="mt-1 text-sm text-gray-600">Create a new admin user.</div>

          <form
            className="mt-4 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setRegisterError(null)
              setForgotMessage(null)

              setRegisterLoading(true)
              try {
                await api.post('/api/auth/register', { username: regUsername, password: regPassword })
                setRegUsername('')
                setRegPassword('')
                // move user back to login
              } catch (err) {
                setRegisterError(err?.response?.data?.message || 'Register failed')
              } finally {
                setRegisterLoading(false)
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                required
                minLength={6}
              />
            </div>

            {registerError ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{registerError}</div>
            ) : null}

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded bg-gray-900 px-3 py-2 text-white font-medium disabled:opacity-60"
            >
              {registerLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="text-lg font-semibold">Forgot password</div>
          <div className="mt-1 text-sm text-gray-600">Request a password recovery.</div>


          <form
            className="mt-4 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setForgotError(null)
              setForgotMessage(null)
              setForgotLoading(true)
              

              try {
                await api.post('/api/auth/forgot-password', { username: forgotUsername })
                setForgotMessage('Requested')
              } catch (err) {
                setForgotError(err?.response?.data?.message || 'Request failed')
              } finally {
                setForgotLoading(false)
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                required
              />
            </div>

            {forgotError ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{forgotError}</div>
            ) : null}

            {forgotMessage ? (
              <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{forgotMessage}</div>
            ) : null}



            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="w-full rounded bg-black px-3 py-2 text-white font-medium"
            >
              Go to reset page
            </button>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full rounded bg-gray-900 px-3 py-2 text-white font-medium disabled:opacity-60"
            >
              {forgotLoading ? 'Requesting...' : 'Request reset token'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


