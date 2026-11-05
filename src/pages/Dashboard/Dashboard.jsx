// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { Activity, Clock, ThumbsUp, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [enviandoSOS, setEnviandoSOS] = useState(false);

    const [novoTreino, setNovoTreino] = useState({
        titulo: 'Caminhada',
        duracao: 15,
        feedback: 'bom'
    });

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
        } else {
            buscarHistorico();
        }
    }, [usuario, navigate]);

    const buscarHistorico = async () => {
        try {
            const resposta = await fetch(`http://localhost:3001/api/atividades/${usuario.id}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setHistorico(dados);
            }
        } catch (erro) {
            console.error("Erro ao buscar histórico:", erro);
        }
    };

    const registarTreino = async (e) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3001/api/atividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    titulo: novoTreino.titulo,
                    duracaoSegundos: novoTreino.duracao * 60,
                    feedback: novoTreino.feedback
                })
            });

            if (resposta.ok) {
                alert('Exercício registado com sucesso!');
                buscarHistorico(); 
                setNovoTreino({ titulo: 'Caminhada', duracao: 15, feedback: 'bom' }); 
            } else {
                alert('Erro ao registar o treino.');
            }
        } catch (erro) {
            console.error("Erro ao registar:", erro);
            alert('Falha na comunicação com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    // Nova função para enviar Alerta SOS
    const enviarSOS = async () => {
        if (!window.confirm('Tem a certeza que precisa de ajuda de emergência?')) return;
        
        setEnviandoSOS(true);
        try {
            const resposta = await fetch('http://localhost:3001/api/alertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    tipo: 'sos',
                    mensagem: 'O utente acionou o botão de emergência!'
                })
            });

            if (resposta.ok) {
                alert('🚨 Alerta enviado! Um profissional ou familiar será avisado.');
            } else {
                alert('Erro ao enviar alerta.');
            }
        } catch (erro) {
            console.error("Erro ao enviar SOS:", erro);
            alert('Falha na comunicação com o servidor.');
        } finally {
            setEnviandoSOS(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#166534' }}>Olá, {usuario.nome}!</h1>
                    <p style={{ margin: 0, color: '#15803d' }}>O seu painel de atividades</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    <LogOut size={20} /> Sair
                </button>
            </div>

            {/* BOTÃO SOS */}
            <button 
                onClick={enviarSOS}
                disabled={enviandoSOS}
                style={{ width: '100%', padding: '1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}
            >
                <AlertTriangle size={32} /> 
                {enviandoSOS ? 'A ENVIAR ALERTA...' : 'PRECISO DE AJUDA (SOS)'}
            </button>

            {/* ZONA DE REGISTO DE NOVO TREINO */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <Activity size={24} color="#059669" /> Registar Novo Exercício
                </h2>
                
                <form onSubmit={registarTreino} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>O que fez hoje?</label>
                        <select 
                            value={novoTreino.titulo} 
                            onChange={(e) => setNovoTreino({...novoTreino, titulo: e.target.value})}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        >
                            <option value="Caminhada">Caminhada</option>
                            <option value="Alongamentos">Alongamentos</option>
                            <option value="Bicicleta Ergométrica">Bicicleta Ergométrica</option>
                            <option value="Exercícios de Força">Exercícios de Força</option>
                            <option value="Hidroginástica">Hidroginástica</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Tempo (em minutos)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="#64748b" />
                            <input 
                                type="number" 
                                min="1"
                                value={novoTreino.duracao}
                                onChange={(e) => setNovoTreino({...novoTreino, duracao: Number(e.target.value)})}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', width: '100px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Como se sentiu?</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={() => setNovoTreino({...novoTreino, feedback: 'facil'})} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: novoTreino.feedback === 'facil' ? '2px solid #22c55e' : '1px solid #cbd5e1', backgroundColor: novoTreino.feedback === 'facil' ? '#dcfce7' : '#f8fafc', cursor: 'pointer', fontWeight: 'bold' }}>
                                😊 Fácil
                            </button>
                            <button type="button" onClick={() => setNovoTreino({...novoTreino, feedback: 'bom'})} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: novoTreino.feedback === 'bom' ? '2px solid #eab308' : '1px solid #cbd5e1', backgroundColor: novoTreino.feedback === 'bom' ? '#fef9c3' : '#f8fafc', cursor: 'pointer', fontWeight: 'bold' }}>
                                😌 Bom
                            </button>
                            <button type="button" onClick={() => setNovoTreino({...novoTreino, feedback: 'dificil'})} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: novoTreino.feedback === 'dificil' ? '2px solid #ef4444' : '1px solid #cbd5e1', backgroundColor: novoTreino.feedback === 'dificil' ? '#fee2e2' : '#f8fafc', cursor: 'pointer', fontWeight: 'bold' }}>
                                🥵 Difícil
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={carregando}
                        style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {carregando ? 'A guardar...' : <><CheckCircle size={24} /> Guardar Treino</>}
                    </button>
                </form>
            </div>

            {/* HISTÓRICO DE TREINOS */}
            <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <ThumbsUp size={24} color="#0284c7" /> O Meu Histórico
                </h2>
                
                {historico.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        Ainda não fez nenhum treino. Registe o seu primeiro exercício acima!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {historico.map((treino) => (
                            <div key={treino.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{treino.titulo}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                        {new Date(treino.dataCriacao).toLocaleDateString('pt-PT')} às {new Date(treino.dataCriacao).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#334155' }}>
                                        {treino.duracaoSegundos / 60} min
                                    </p>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '4px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        backgroundColor: treino.feedback === 'facil' ? '#dcfce7' : treino.feedback === 'bom' ? '#fef9c3' : '#fee2e2',
                                        color: treino.feedback === 'facil' ? '#166534' : treino.feedback === 'bom' ? '#854d0e' : '#991b1b'
                                    }}>
                                        {treino.feedback.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}