import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './styles/app.css'
import App from './App.tsx'

// Add dark class to root element
document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
