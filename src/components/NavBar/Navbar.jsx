// src/components/NavBar/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, FileText, LayoutDashboard, LogOut, FileSearch, CalendarCheck, Factory } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    return (
        <header className="app-header">
            {/* Logotipo / Nome do App */}
            <div className="logo-container">
                <Truck className="text-primary" size={28} />
                <span>Nexus<span className="text-primary">Log</span></span>
                <span className="badge-role">Cliente</span>
            </div>

            {/* Links de Navegação */}
            <nav className="nav-links">
                <NavLink to="/acompanhamento" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={18} /> Acompanhamento
                </NavLink>

                <NavLink to="/formulario" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <FileText size={18} /> Nova Solicitação
                </NavLink>

                {/* Novos links para as Fases do Processo */}
                <NavLink to="/fase1" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <FileSearch size={18} /> Fase 1
                </NavLink>

                <NavLink to="/fase2" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <CalendarCheck size={18} /> Fase 2
                </NavLink>

                <NavLink to="/fase3" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <Factory size={18} /> Fase 3
                </NavLink>
            </nav>

            {/* Perfil do Utilizador */}
            <div className="user-profile">
                <div className="user-info">
                    <span>Programador (SCL)</span>
                    <button className="btn-logout">
                        <LogOut size={16} /> Sair
                    </button>
                </div>
                <div className="avatar">P</div>
            </div>
        </header>
    );
}