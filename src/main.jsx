import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/noto-sans-kr/600.css'
import '@fontsource/noto-sans-kr/800.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
