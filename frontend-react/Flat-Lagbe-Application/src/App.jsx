import { useState } from 'react'

import './App.css'
import './assets/css/style.css' 
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import AuthProvider from './AuthProvider'
import Dashboard from './components/Dashboard'
import Add_FlatPost from './components/Add_FlatPost'
import FlatDetails from './components/FlatDetails'
import Listing from './components/Listing'
import Edit_Flat from './components/Edit_Flat'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="app-container"> 
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* PUBLIC ROUTES - Only login and register */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED ROUTES - Everything else requires authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Main />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/posts" element={<Add_FlatPost />} />
              <Route path="/flat-details/:id" element={<FlatDetails />} />
              <Route path="/my-listings" element={<Listing />} />
              <Route path="/edit-flat/:id" element={<Edit_Flat />} />
            </Route>

            {/* CATCH-ALL - Send any unknown or typed URLs straight to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App