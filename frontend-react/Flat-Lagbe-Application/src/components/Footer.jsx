import React from 'react'
import './Footer.css' // Make sure this line is imported!

const Footer = () => {
  return (
    <footer className="footer_class text-center py-3 my-3">
      <hr />
      <p>&copy; {new Date().getFullYear()} Flat Lagbe. All rights reserved.</p>
    </footer>
  )
}

export default Footer