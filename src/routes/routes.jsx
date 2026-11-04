// src/routes/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import Formulario from '../pages/Formulario/Formulario';
import Acompanhamento from '../pages/Acompanhamento/Acompanhamento';

// Importa as tuas novas Fases do Cliente!
import Fase1 from '../pages/Fases/Fase1/Fase1';
import Fase2 from '../pages/Fases/Fase2/Fase2';
import Fase3 from '../pages/Fases/Fase3/Fase3';

export const rotas = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/formulario" replace />
            },
            {
                path: 'formulario',
                element: <Formulario />
            },
            {
                path: 'acompanhamento',
                element: <Acompanhamento />
            },
            {
                path: 'fase1',
                element: <Fase1 />
            },
            {
                path: 'fase2',
                element: <Fase2 />
            },
            {
                path: 'fase3',
                element: <Fase3 />
            }
        ]
    }
]);