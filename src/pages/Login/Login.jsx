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

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        const sucesso = login(telemovel, pin);

        if (sucesso) {
            navigate('/dashboard');
        } else {
            setErro('PIN inválido. Verifique os números digitados.');
            setCarregando(false);
        }
    };

    // Atalhos para testar rapidamente os 3 perfis durante a apresentação
    const preencherPerfil = (telDemo, pinDemo) => {
        setTelemovel(telDemo);
        setPin(pinDemo);
        setErro('');
    };

    return (
        <div className="login-container">
            <div className="login-card fade-in">
                <div className="login-header">
                    <div className="logo-container justify-center">
                        <HeartPulse className="text-primary" size={48} strokeWidth={2.5} />
                    </div>
                    <h1 className="login-title">
                        Ativ <span className="text-primary">Idade</span>
                    </h1>
                    <p className="login-subtitle">Acesso rápido com o seu telemóvel e PIN.</p>
                </div>

                {erro && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
                        padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem'
                    }}>
                        <AlertCircle size={20} />
                        <span>{erro}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>O seu Telemóvel</label>
                        <div className="input-with-icon">
                            <Phone size={22} className="input-icon" />
                            <input
                                type="tel"
                                value={telemovel}
                                onChange={(e) => setTelemovel(e.target.value)}
                                placeholder="(00) 00000-0000"
                                required
                                className="input-control"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>PIN de 4 Números</label>
                        <div className="input-with-icon">
                            <Lock size={22} className="input-icon" />
                            <input
                                type="password"
                                maxLength="4"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="****"
                                required
                                className="input-control"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={carregando}
                    >
                        {carregando ? 'A aceder...' : (
                            <>
                                <LogIn size={22} /> Entrar
                            </>
                        )}
                    </button>
                </form>

                {/* Caixa auxiliar para alternar perfis no protótipo */}
                <div style={{
                    marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc',
                    border: '1px dashed #cbd5e1', borderRadius: '0.75rem', textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                        Testar perfis de acesso:
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => preencherPerfil('11999991111', '1111')}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white' }}
                        >
                            👵 Idoso (1111)
                        </button>
                        <button
                            type="button"
                            onClick={() => preencherPerfil('11999992222', '2222')}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white' }}
                        >
                            🩺 Fisioterapeuta (2222)
                        </button>
                        <button
                            type="button"
                            onClick={() => preencherPerfil('11999993333', '3333')}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white' }}
                        >
                            📊 Gestor (3333)
                        </button>
                    </div>
                </div>

                <div className="toggle-mode">
                    <p>Ainda não tem conta criada?</p>
                    <button type="button" onClick={() => navigate('/cadastro')} className="btn-toggle">
                        Criar a minha conta
                    </button>
                </div>
            </div>
        </div>
    );
}