import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <nav className="custom-navbar">
      {/* Title/Brand on the Left */}
      <a className="navbar-brand-custom" href="#">Flat Lagbe</a>
      
      {/* Buttons on the Right */}
      <div className="navbar-buttons-custom">
        <Link className="btn-login" to="/login">Login</Link>
        <Link className="btn-register" to="/register">Registration</Link >
      </div>
    </nav>
  )
}

export default Header