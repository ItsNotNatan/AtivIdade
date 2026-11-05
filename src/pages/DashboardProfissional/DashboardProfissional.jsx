// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { Users, AlertTriangle, Activity, LogOut, CheckCircle } from 'lucide-react';

export default function DashboardProfissional() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();

    const [utentes, setUtentes] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [utenteSelecionado, setUtenteSelecionado] = useState(null);
    const [historicoUtente, setHistoricoUtente] = useState([]);

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'profissional') {
            navigate('/login');
        } else {
            carregarDados();
        }
    }, [usuario, navigate]);

    const carregarDados = async () => {
        try {
            const [resUtentes, resAlertas] = await Promise.all([
                fetch('http://localhost:3001/api/utentes'),
                fetch('http://localhost:3001/api/alertas/pendentes')
            ]);
            
            if (resUtentes.ok) setUtentes(await resUtentes.json());
            if (resAlertas.ok) setAlertas(await resAlertas.json());
        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
        }
    };

    const verHistorico = async (utente) => {
        setUtenteSelecionado(utente);
        try {
            const res = await fetch(`http://localhost:3001/api/atividades/${utente.id}`);
            if (res.ok) setHistoricoUtente(await res.json());
        } catch (erro) {
            console.error("Erro ao buscar histórico do utente:", erro);
        }
    };

    const resolverAlerta = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/alertas/${id}/resolver`, { method: 'PUT' });
            if (res.ok) {
                carregarDados(); // Recarrega a lista para remover o alerta resolvido
            }
        } catch (erro) {
            console.error("Erro ao resolver alerta:", erro);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1e3a8a' }}>Dr(a). {usuario.nome}</h1>
                    <p style={{ margin: 0, color: '#1d4ed8' }}>Painel do Fisioterapeuta</p>
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <LogOut size={20} /> Sair
                </button>
            </div>

            {/* ALERTAS SOS PENDENTES */}
            {alertas.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h2 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={24} /> Pedidos de SOS ({alertas.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {alertas.map(alerta => (
                            <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#b91c1c' }}>{alerta.utenteNome}</h3>
                                    <p style={{ margin: 0, color: '#64748b' }}>Tel: {alerta.utenteTel} | Registado às {new Date(alerta.dataCriacao).toLocaleTimeString('pt-PT')}</p>
                                    <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{alerta.mensagem}</p>
                                </div>
                                <button onClick={() => resolverAlerta(alerta.id)} style={{ padding: '0.75rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={20} /> Resolvido
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* LISTA DE UTENTES */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                        <Users size={24} color="#3b82f6" /> Meus Utentes
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {utentes.map(utente => (
                            <div 
                                key={utente.id} 
                                onClick={() => verHistorico(utente)}
                                style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: utenteSelecionado?.id === utente.id ? '#eff6ff' : 'white', borderColor: utenteSelecionado?.id === utente.id ? '#3b82f6' : '#cbd5e1' }}
                            >
                                <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{utente.nome} ({utente.idade || '?'} anos)</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Condições: {utente.condicoes || 'Nenhuma'} | Mobilidade: {utente.mobilidade || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HISTÓRICO DO UTENTE SELECIONADO */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                        <Activity size={24} color="#10b981" /> Histórico de Treinos
                    </h2>
                    
                    {!utenteSelecionado ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>
                            Clique num utente ao lado para ver os seus exercícios.
                        </p>
                    ) : historicoUtente.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Este utente ainda não registou atividades.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#334155' }}>Exercícios de {utenteSelecionado.nome}:</h3>
                            {historicoUtente.map(treino => (
                                <div key={treino.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#1e293b' }}>{treino.titulo}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{new Date(treino.dataCriacao).toLocaleDateString('pt-PT')}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#334155' }}>{treino.duracaoSegundos / 60} min</p>
                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: treino.feedback === 'facil' ? '#dcfce7' : treino.feedback === 'bom' ? '#fef9c3' : '#fee2e2', color: treino.feedback === 'facil' ? '#166534' : treino.feedback === 'bom' ? '#854d0e' : '#991b1b' }}>
                                            {treino.feedback.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}