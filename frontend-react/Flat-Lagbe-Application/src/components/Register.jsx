import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import './Register.css'
import axios from 'axios'

const Register = () => {
  const navigate = useNavigate() 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  
  // 1. Change error state to an object to store field-specific errors
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    
    // Clear the error for this specific field as the user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {   
    e.preventDefault()
    setMessage('')
    setErrors({}) // Reset all errors on new submit

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData)
      
      setMessage('Registration successful! Redirecting to login page...')
      setFormData({ username: '', email: '', password: '' })

      setTimeout(() => {
        navigate('/login')
      }, 2500)

    } catch (err) {
      if (err.response && err.response.data) {
        // 2. Pass Django's error dictionary directly to the state object
        // Django sends: { username: ["error"], email: ["error"] }
        setErrors(err.response.data)
      } else {
        // Fallback for general connection errors (non-field errors)
        setErrors({ general: err.message || "Could not connect to the server." })
      }
    }
  }

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create an Account</h2>
        
        {message && <div className="alert alert-success">{message}</div>}
        {errors.general && <div className="alert alert-danger">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
            {errors.username && (
              <span className="field-error">{errors.username.join(', ')}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            {errors.email && (
              <span className="field-error">{errors.email.join(', ')}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            {errors.password && (
              <span className="field-error">{errors.password.join(', ')}</span>
            )}
          </div>

          <button type="submit" className="btn-submit">Register</button>
        </form>
      </div>
    </div>
  )
}

export default Register