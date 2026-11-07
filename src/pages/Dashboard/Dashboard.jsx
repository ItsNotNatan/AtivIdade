// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { PlayCircle, ThumbsUp, LogOut, AlertTriangle, ClipboardList } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [historico, setHistorico] = useState([]);
    const [prescricoes, setPrescricoes] = useState([]);
    const [enviandoSOS, setEnviandoSOS] = useState(false);

    useEffect(() => {
        if (!usuario) navigate('/login');
        else carregarTudo();
    }, [usuario, navigate]);

    const carregarTudo = async () => {
        try {
            const [resHist, resPresc] = await Promise.all([
                fetch(`http://localhost:3001/api/atividades/${usuario.id}`),
                fetch(`http://localhost:3001/api/prescricoes/${usuario.id}`)
            ]);
            if (resHist.ok) setHistorico(await resHist.json());
            if (resPresc.ok) setPrescricoes(await resPresc.json());
        } catch (erro) { console.error(erro); }
    };

    const enviarSOS = async () => {
        if (!window.confirm('Tem certeza que precisa de ajuda de emergência?')) return;
        setEnviandoSOS(true);
        try {
            const resposta = await fetch('http://localhost:3001/api/alertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuario.id, tipo: 'sos', mensagem: 'O paciente acionou o botão de emergência!' })
            });
            if (resposta.ok) alert('🚨 Alerta enviado!');
        } catch (erro) { console.error(erro); } 
        finally { setEnviandoSOS(false); }
    };

    const iniciarTreino = (prescricao) => {
        navigate('/exercicio', { state: { treino: prescricao } });
    };

    const formatarDetalhes = (treino) => {
        switch(treino.tipo) {
            case 'tempo': return `${treino.duracaoMinutos} Minutos Contínuos`;
            case 'repeticao': return `${treino.series} séries de ${treino.repeticoes} repetições`;
            case 'isometria': return `${treino.series} séries sustentando por ${treino.duracaoMinutos} seg`;
            case 'carga': return `${treino.series} séries de ${treino.repeticoes} usando ${treino.carga}`;
            case 'meta': return `Objetivo: ${treino.meta}`;
            default: return '';
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };
    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#166534' }}>Olá, {usuario.nome}!</h1>
                    <p style={{ margin: 0, color: '#15803d' }}>O seu painel de atividades</p>
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <LogOut size={20} /> Sair
                </button>
            </div>

            <button onClick={enviarSOS} disabled={enviandoSOS} style={{ width: '100%', padding: '1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}>
                <AlertTriangle size={32} /> {enviandoSOS ? 'ENVIANDO ALERTA...' : 'PRECISO DE AJUDA (SOS)'}
            </button>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1rem' }}>
                <ClipboardList size={24} color="#059669" /> O Que Tenho de Fazer Hoje?
            </h2>
            
            {prescricoes.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Você não tem novos exercícios agendados pelo seu fisioterapeuta. Descanse!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                    {prescricoes.map(p => (
                        <div key={p.id} className="daily-highlight" style={{ backgroundColor: '#059669', padding: '2rem', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)' }}>
                            <div>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'inline-block' }}>Recomendação Médica</span>
                                <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>{p.titulo}</h2>
                                <p style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0', opacity: 0.9 }}>{formatarDetalhes(p)}</p>
                                <button onClick={() => iniciarTreino(p)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#059669', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <PlayCircle size={22} /> Começar Treino
                                </button>
                            </div>
                            <div style={{ fontSize: '4rem', opacity: 0.8 }}>📋</div>
                        </div>
                    ))}
                </div>
            )}

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <ThumbsUp size={24} color="#0284c7" /> O Meu Histórico
            </h2>
            {historico.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>Sem treinos no histórico.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {historico.map(treino => (
                        <div key={treino.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{treino.titulo}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{new Date(treino.dataCriacao).toLocaleDateString('pt-BR')} - {formatarDetalhes(treino)}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: treino.feedback === 'facil' ? '#dcfce7' : treino.feedback === 'bom' ? '#fef9c3' : '#fee2e2', color: treino.feedback === 'facil' ? '#166534' : treino.feedback === 'bom' ? '#854d0e' : '#991b1b' }}>{treino.feedback.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}