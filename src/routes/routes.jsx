// src/routes/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import Login from '../pages/Login/Login';
import Cadastro from '../pages/Cadastro/Cadastro';
import Dashboard from '../pages/Dashboard/Dashboard';
import Perfil from '../pages/Perfil/Perfil';
import Exercicio from '../pages/Exercicio/Exercicio';
import Relatorios from '../pages/Relatorios/Relatorios';
import Turma from '../pages/Turma/Turma';
import Equipa from '../pages/Equipa/Equipa'; // <-- Importação

export const rotas = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/cadastro',
        element: <Cadastro />
    },
    {
        path: '/exercicio',
        element: <Exercicio />
    },
    {
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'perfil',
                element: <Perfil />
            },
            {
                path: 'relatorios',
                element: <Relatorios />
            },
            {
                path: 'turma',
                element: <Turma />
            },
            {
                path: 'equipa', // <-- Rota de profissionais do gestor
                element: <Equipa />
            }
        ]
    }
]);