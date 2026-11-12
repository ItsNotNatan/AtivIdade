// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Phone, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { formatarTelefone } from '../../utils/formatadores';
import './Login.css';

export default function Login() {
    const [celular, setCelular] = useState('');
    const [pin, setPin] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleTelefoneChange = (e) => {
        setCelular(formatarTelefone(e.target.value));
    };

    const handlePinChange = (e) => {
        const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(apenasNumeros);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const sucesso = await login(celular, pin);
            if (sucesso) {
                const tipo = JSON.parse(localStorage.getItem('usuario')).tipo;
                if (tipo === 'profissional') navigate('/dashboard-profissional');
                else if (tipo === 'gestor') navigate('/dashboard-gestor');
                else navigate('/dashboard'); 
            } else {
                setErro('Credenciais inválidas. Verifique os dados digitados.');
            }
        } catch (error) {
            setErro('Erro ao conectar com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card fade-in">
                <div className="login-header">
                    <div className="logo-container">
                        <HeartPulse size={56} strokeWidth={2.5} />
                    </div>
                    <h1 className="login-title">AtivIdade</h1>
                    <p className="login-subtitle">Acesso rápido com seu celular e PIN.</p>
                </div>

                {erro && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                        <AlertCircle size={20} />
                        <span>{erro}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Seu Celular</label>
                        <div className="input-with-icon">
                            <Phone size={22} className="input-icon" />
                            <input 
                                type="tel" 
                                inputMode="numeric"
                                value={celular} 
                                onChange={handleTelefoneChange} 
                                placeholder="(00) 00000-0000" 
                                required 
                                className="input-control" 
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>PIN (4 Números)</label>
                        <div className="input-with-icon">
                            <Lock size={22} className="input-icon" />
                            <input 
                                type="password" 
                                inputMode="numeric"
                                maxLength="4" 
                                value={pin} 
                                onChange={handlePinChange} 
                                placeholder="****" 
                                required 
                                className="input-control" 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-block" disabled={carregando}>
                        {carregando ? 'Acessando...' : <><LogIn size={22} /> Entrar</>}
                    </button>
                </form>

                <div className="toggle-mode">
                    <p>Ainda não tem conta criada?</p>
                    <button type="button" onClick={() => navigate('/cadastro')} className="btn-toggle">Criar a minha conta</button>
                </div>
            </div>
        </div>
    );
}