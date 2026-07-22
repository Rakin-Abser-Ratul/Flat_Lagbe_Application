import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Register.css'
import axios from 'axios'

const Register = () => {
  const navigate = useNavigate() 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false) // Added loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    
    // Clear field-specific error dynamically as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {   
    e.preventDefault()
    setMessage('')
    setErrors({})

    // Client-side Validation
    if (formData.password.length < 4) {
      setErrors({ password: ['Password must be at least 4 characters long.'] })
      return
    }

    setLoading(true) // Start loading state

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData)
      
      setMessage('Registration successful! Redirecting to login page...')
      setFormData({ username: '', email: '', password: '' })

      setTimeout(() => {
        navigate('/login')
      }, 2500)

    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data)
      } else {
        setErrors({ general: err.message || "Could not connect to the server." })
      }
    } finally {
      setLoading(false) // Stop loading state regardless of outcome
    }
  }

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>
        <p className="register-subtitle">Join Flat Lagbe to explore or post available flats</p>
        
        {message && <div className="register-alert register-alert-success">{message}</div>}
        {errors.general && <div className="register-alert register-alert-danger">{errors.general}</div>}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Username Field */}
          <div className="register-form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="e.g. john_doe"
              className={`register-control ${errors.username ? 'is-invalid' : ''}`} 
              value={formData.username} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.username && (
              <span className="register-field-error">
                {Array.isArray(errors.username) ? errors.username.join(', ') : errors.username}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="register-form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="name@example.com"
              className={`register-control ${errors.email ? 'is-invalid' : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.email && (
              <span className="register-field-error">
                {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="register-form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              minLength={4} 
              className={`register-control ${errors.password ? 'is-invalid' : ''}`} 
              value={formData.password} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.password && (
              <span className="register-field-error">
                {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
              </span>
            )}
          </div>

          {/* Submit Button with Loading State */}
          <button 
            type="submit" 
            className="register-btn-submit"
            disabled={loading}
            style={loading ? styles.btnDisabled : {}}
          >
            {loading ? (
              <span style={styles.spinnerContainer}>
                <span style={styles.spinner}></span>
                Creating Account...
              </span>
            ) : (
              'Register'
            )}
          </button>

          {/* Redirect to Login link */}
          <p className="register-auth-redirect">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

// Inline styles for loading button state & spinner alignment
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

export default Register