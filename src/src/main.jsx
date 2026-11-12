// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { rotas } from './routes/routes';
import { AuthProvider } from './contexts/authStore.jsx';
import { AlertProvider } from './components/AlertContext/AlertContext.jsx'; // <-- IMPORTAÇÃO AQUI
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AlertProvider> {/* <-- ENVOLVE A APLICAÇÃO AQUI */}
        <RouterProvider router={rotas} />
      </AlertProvider>
    </AuthProvider>
  </StrictMode>,
);