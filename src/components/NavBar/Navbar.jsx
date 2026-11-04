// src/components/NavBar/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, User, FileText, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <HeartPulse size={32} strokeWidth={2.5} />
                <span>AtivIdade</span>
            </div>

            <nav className="nav-links">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} /> Início
                </NavLink>

                <NavLink to="/relatorios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <FileText size={20} /> Relatórios
                </NavLink>

                <NavLink to="/perfil" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <User size={20} /> Meu Perfil
                </NavLink>
            </nav>

            <div className="user-profile">
                <button onClick={handleLogout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                    <LogOut size={20} /> Sair
                </button>
            </div>
        </header>
    );
}