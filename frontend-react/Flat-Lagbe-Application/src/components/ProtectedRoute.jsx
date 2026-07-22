import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext)

  // Redirect to /login if unauthenticated, otherwise allow access to nested routes
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute