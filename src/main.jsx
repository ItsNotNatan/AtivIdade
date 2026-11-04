// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { rotas } from './routes/routes';
import { AuthProvider } from './contexts/authStore'; // <-- Importação do provedor
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={rotas} />
    </AuthProvider>
  </StrictMode>,
);