// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/authStore';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardProfissional from './pages/DashboardProfissional/DashboardProfissional';
import DashboardGestor from './pages/DashboardGestor/DashboardGestor'; // Tem de estar aqui!

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard-profissional" element={<DashboardProfissional />} />
                    
                    {/* Esta é a rota que estava a faltar ou não foi guardada: */}
                    <Route path="/dashboard-gestor" element={<DashboardGestor />} />
                    
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}