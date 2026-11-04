// src/components/NavBar/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, User, FileText, Users, LogOut, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore'; // <-- Importação do perfil
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fallback de segurança para 'idoso' caso algo falhe
    const tipoPerfil = usuario?.tipo || 'idoso';

    return (
        <header className="app-header">
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <HeartPulse size={32} strokeWidth={2.5} />
                <span>AtivIdade</span>
            </div>

            <nav className="nav-links">
                {/* MENU DO IDOSO */}
                {tipoPerfil === 'idoso' && (
                    <>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <LayoutDashboard size={20} /> Início
                        </NavLink>
                        <NavLink to="/relatorios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <FileText size={20} /> Meus Relatórios
                        </NavLink>
                    </>
                )}

                {/* MENU DO PROFISSIONAL (FISIOTERAPEUTA) */}
                {tipoPerfil === 'profissional' && (
                    <>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <LayoutDashboard size={20} /> Início
                        </NavLink>
                        <NavLink to="/turma" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Users size={20} /> Minha Turma
                        </NavLink>
                    </>
                )}

                {/* MENU DO GESTOR */}
                {tipoPerfil === 'gestor' && (
                    <>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <BarChart3 size={20} /> Visão Geral
                        </NavLink>
                        <NavLink to="/equipa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Users size={20} /> Profissionais
                        </NavLink>
                    </>
                )}

                {/* MENU COMUM A TODOS */}
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