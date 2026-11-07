import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, LayoutDashboard, User, FileText, Users, LogOut, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tipoPerfil = usuario?.tipo || 'idoso';

    return (
        <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <HeartPulse size={32} strokeWidth={2.5} />
                <span>AtivIdade</span>
            </div>

            <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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

                {tipoPerfil === 'profissional' && (
                    <NavLink to="/dashboard-profissional" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <LayoutDashboard size={20} /> Gestão de Turmas
                    </NavLink>
                )}

                {tipoPerfil === 'gestor' && (
                    <>
                        <NavLink to="/dashboard-gestor" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <BarChart3 size={20} /> Visão Geral
                        </NavLink>
                        <NavLink to="/equipa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Users size={20} /> Profissionais
                        </NavLink>
                    </>
                )}

                <NavLink to="/perfil" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <User size={20} /> Meu Perfil
                </NavLink>
            </nav>

            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                <LogOut size={20} /> Sair
            </button>
        </header>
    );
}