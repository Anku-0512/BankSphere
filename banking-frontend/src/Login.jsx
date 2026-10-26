
import { useState } from 'react'
import './Login.css'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!email.trim() || !password) {
      setMessage('Please enter email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message || 'Login failed. Please check your details.'
        )
        return
      }

      setMessage(data.message || 'Login successful!')

      if (onLoginSuccess) {
        onLoginSuccess(data)
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage(
        'Cannot connect to server. Please check if the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Banking Management System</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {message && (
            <p
              className={
                message.toLowerCase().includes('successful')
                  ? 'success-message'
                  : 'error-message'
              }
              role="alert"
            >
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-footer">
          Secure Banking Management System
        </p>
      </div>
    </div>
  )
}

export default Login
