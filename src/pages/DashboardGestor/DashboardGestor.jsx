// src/pages/DashboardGestor/DashboardGestor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { BarChart3, Users, Activity, AlertTriangle, LogOut } from 'lucide-react';
import { API_URL } from '../../config';

export default function DashboardGestor() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    const [estatisticas, setEstatisticas] = useState({ idosos: 0, treinos: 0, alertas: 0 });

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'gestor') {
            navigate('/login');
        } else {
            carregarEstatisticas();
        }
    }, [usuario, navigate]);

    const carregarEstatisticas = async () => {
        try {
            const resposta = await fetch(`${API_URL}/api/estatisticas`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setEstatisticas(dados);
            }
        } catch (erro) {
            console.error("Erro ao carregar estatísticas:", erro);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#4c1d95' }}>Diretor {usuario.nome}</h1>
                    <p style={{ margin: 0, color: '#6d28d9' }}>Painel de Gestão da Instituição</p>
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <LogOut size={20} /> Sair
                </button>
            </div>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <BarChart3 size={28} color="#7c3aed" /> Visão Geral do Sistema
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* Cartão de Utentes Registados */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Users size={48} color="#3b82f6" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#64748b' }}>Utentes Ativos</h3>
                    <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.idosos}</p>
                </div>

                {/* Cartão de Treinos Realizados */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Activity size={48} color="#10b981" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#64748b' }}>Exercícios Concluídos</h3>
                    <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.treinos}</p>
                </div>

                {/* Cartão de Alertas Totais */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#64748b' }}>Histórico de SOS</h3>
                    <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.alertas}</p>
                </div>
            </div>
        </div>
    );
}