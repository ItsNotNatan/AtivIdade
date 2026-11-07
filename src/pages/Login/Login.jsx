// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Phone, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Login.css';

export default function Login() {
    const [telemovel, setTelemovel] = useState('');
    const [pin, setPin] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telemovel, pin })
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                await login(telemovel, pin);

                if (dados.usuario.tipo === 'profissional') {
                    navigate('/dashboard-profissional');
                } else if (dados.usuario.tipo === 'gestor') {
                    navigate('/dashboard-gestor');
                } else {
                    navigate('/dashboard'); 
                }
            } else {
                setErro('Credenciais inválidas. Verifique os números digitados.');
            }
        } catch (error) {
            setErro('Erro ao ligar ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    const loginSocial = (provedor) => {
        alert(`Integração com ${provedor} em desenvolvimento!`);
    };

    return (
        <div className="login-container">
            <div className="login-card fade-in">
                <div className="login-header">
                    <div className="logo-container">
                        <HeartPulse size={56} strokeWidth={2.5} />
                    </div>
                    <h1 className="login-title">AtivIdade</h1>
                    <p className="login-subtitle">Acesso rápido com o seu celular e PIN.</p>
                </div>

                {erro && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                        <AlertCircle size={20} />
                        <span>{erro}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>O seu Celular</label>
                        <div className="input-with-icon">
                            <Phone size={22} className="input-icon" />
                            <input type="tel" value={telemovel} onChange={(e) => setTelemovel(e.target.value)} placeholder="(00) 00000-0000" required className="input-control" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>PIN de 4 Números</label>
                        <div className="input-with-icon">
                            <Lock size={22} className="input-icon" />
                            <input type="password" maxLength="4" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" required className="input-control" />
                        </div>
                    </div>

                    <button type="submit" className="btn-block" disabled={carregando}>
                        {carregando ? 'Acessando...' : <><LogIn size={22} /> Entrar</>}
                    </button>
                </form>

                {/* Divisor Visual */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <span style={{ padding: '0 1rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>ou entre com</span>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e7eb' }} />
                </div>

                {/* Botões de Login Social na Horizontal */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                    <button 
                        type="button" 
                        onClick={() => loginSocial('Google')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button>

                    <button 
                        type="button" 
                        onClick={() => loginSocial('Facebook')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                        Facebook
                    </button>
                </div>

                <div className="toggle-mode">
                    <p>Ainda não tem conta criada?</p>
                    <button type="button" onClick={() => navigate('/cadastro')} className="btn-toggle">Criar a minha conta</button>
                </div>
            </div>
        </div>
    );
}