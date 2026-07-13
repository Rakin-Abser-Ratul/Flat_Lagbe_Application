import { useState } from 'react'

import './App.css'
import './assets/css/style.css' 
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
function App() {
 

  return (
    
    <div className="app-container"> 
   
     <BrowserRouter>
       <Header />
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Main />} />
      </Routes>
      <Footer />
     </BrowserRouter>
     
    
     </div>
    
  )
}

export default App
