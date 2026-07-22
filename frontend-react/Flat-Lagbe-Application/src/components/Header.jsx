import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

  return (
    <header className="header-container">
      <nav className="custom-navbar">
        {/* Brand Logo / Title */}
        <Link className="navbar-brand-custom" to="/">
          <span className="brand-accent">Flat</span> Lagbe
        </Link>
        
        {/* Navigation Action Buttons */}
        <div className="navbar-buttons-custom">
          {isAuthenticated ? (
            <>
              <Link className="nav-btn btn-add-post" to="/posts">
                <span className="btn-icon">+</span> Add Post
              </Link>
              <Link className="nav-btn btn-dashboard" to="/dashboard">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="nav-btn btn-login" to="/login">
                Login
              </Link>
              <Link className="nav-btn btn-register" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header