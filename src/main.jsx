import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'; // 1. Importamos o provedor de rotas

import { rotas } from './routes/routes.jsx'; // 2. Importamos o mapa de rotas que criaste
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Trocamos o antigo <App /> pelo RouterProvider */}
    <RouterProvider router={rotas} />
  </StrictMode>,
);