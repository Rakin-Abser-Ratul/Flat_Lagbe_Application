import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'
import axios from 'axios'
import { AuthContext } from '../AuthProvider'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false) // Added loading state
  const { setIsAuthenticated } = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrors({})
    setLoading(true) // Start loading state

    const payload = {
      username: formData.email,
      email: formData.email,
      password: formData.password
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', payload)

      setMessage('Login successful! Redirecting...')

      if (response.data) {
        if (response.data.access) localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) localStorage.setItem('refresh_token', response.data.refresh);
      }
      setIsAuthenticated(true)

      setFormData({ email: '', password: '' })

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = { ...err.response.data }

        if (backendErrors.detail || backendErrors.non_field_errors) {
          setErrors({ general: "Invalid credentials" })
        } else if (backendErrors.username || backendErrors.email) {
          if (backendErrors.username) {
            backendErrors.email = backendErrors.username
            delete backendErrors.username
          }
          setErrors(backendErrors)
        } else {
          setErrors(backendErrors)
        }
      } else {
        setErrors({ general: err.message || "Could not connect to the server." })
      }
    } finally {
      setLoading(false) // Stop loading state regardless of outcome
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to manage your listings and account</p>

        {message && <div className="login-alert login-alert-success">{message}</div>}
        {errors.general && <div className="login-alert login-alert-danger">{errors.general}</div>}

        {errors.detail && (
          <div className="login-alert login-alert-danger">
            {Array.isArray(errors.detail) ? errors.detail.join(', ') : errors.detail}
          </div>
        )}
        {errors.non_field_errors && (
          <div className="login-alert login-alert-danger">
            {Array.isArray(errors.non_field_errors) ? errors.non_field_errors.join(', ') : errors.non_field_errors}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email Field */}
          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              className={`login-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.email && (
              <span className="login-field-error">
                {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className={`login-control ${errors.password ? 'is-invalid' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.password && (
              <span className="login-field-error">
                {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
              </span>
            )}
          </div>

          {/* Submit Button with Loading State */}
          <button 
            type="submit" 
            className="login-btn-submit" 
            disabled={loading}
            style={loading ? styles.btnDisabled : {}}
          >
            {loading ? (
              <span style={styles.spinnerContainer}>
                <span style={styles.spinner}></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="login-auth-redirect">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

// Inline styles for quick button loading effects & CSS keyframe support
const styles = {
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnDisabled: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  }
}

export default Login