import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { rotas } from './routes/routes' // Importa as rotas que criaste
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Substituímos o <App /> pelo RouterProvider */}
    <RouterProvider router={rotas} />
  </StrictMode>,
)