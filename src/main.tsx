import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from '@/lib/theme'
import { LanguageProvider } from '@/lib/language'
import { AuthProvider } from '@/lib/auth'
import { SmoothScrollProvider } from '@/lib/smoothScroll'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AuthProvider>
              <SmoothScrollProvider>
                <App />
              </SmoothScrollProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
