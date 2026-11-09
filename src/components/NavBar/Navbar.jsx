// src/components/NavBar/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, Menu, X, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Navbar.css';

export default function Navbar() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    const [menuAberto, setMenuAberto] = useState(false);

    if (!usuario) return null;

    const handleSair = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <HeartPulse size={28} color="#059669" strokeWidth={2.5} />
                <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: '800' }}>AtivIdade</h1>
            </div>

            {/* Menu Mobile Toggle */}
            <button className="menu-mobile-btn" onClick={() => setMenuAberto(!menuAberto)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                {menuAberto ? <X size={28} color="#0f172a" /> : <Menu size={28} color="#0f172a" />}
            </button>

            <nav className={`nav-links ${menuAberto ? 'aberto' : ''}`} style={{ flex: 1, justifyContent: 'flex-end' }}>
                <NavLink to={usuario.tipo === 'profissional' ? "/dashboard-profissional" : "/dashboard"} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
                    <LayoutDashboard size={18} /> Painel Principal
                </NavLink>

                <NavLink to="/perfil" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
                    <Settings size={18} /> Minha Conta
                </NavLink>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        {usuario.fotoPerfil ? (
                            <img src={usuario.fotoPerfil} alt={usuario.nome} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }} />
                        ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {usuario.nome.replace(/^(Dr\.|Dra\.)\s+/i, '').charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* AQUI ESTAVA O ERRO: Removi o .split(' ')[0] para mostrar o nome inteiro */}
                        <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>
                            {usuario.nome}
                        </span>
                    </div>

                    <button onClick={handleSair} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.75rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, borderRadius: '6px' }}>
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </nav>
        </header>
    );
}