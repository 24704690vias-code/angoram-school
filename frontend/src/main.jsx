import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './app/App.jsx'

// Inject animated background orbs (from design system)
const blur = document.createElement('div')
blur.className = 'background-blur'
blur.innerHTML = `
  <div class="orb one"></div>
  <div class="orb two"></div>
  <div class="orb three"></div>
`
document.body.prepend(blur)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
