// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { PlayCircle, AlertTriangle, ClipboardList, CalendarDays, RefreshCw } from 'lucide-react';
import { traduzirMusculo } from '../../components/MapaMuscular/MapaMuscular';
import './Dashboard.css';

export default function Dashboard() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert();
    
    const [historico, setHistorico] = useState([]);
    const [prescricoes, setPrescricoes] = useState([]);
    const [enviandoSOS, setEnviandoSOS] = useState(false);
    const [carregando, setCarregando] = useState(true);

    const diasDaSemanaOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diaAtualCurto = diasDaSemanaOpcoes[new Date().getDay()];
    const [diaSelecionado, setDiaSelecionado] = useState(diaAtualCurto);

    useEffect(() => {
        if (!usuario) navigate('/login');
        else carregarTudo();
    }, [usuario, navigate]);

    const carregarTudo = async () => {
        setCarregando(true);
        try {
            const [resHist, resPresc] = await Promise.all([
                fetch(`http://localhost:3001/api/atividades/${usuario.id}`),
                fetch(`http://localhost:3001/api/prescricoes/${usuario.id}`)
            ]);
            if (resHist.ok) setHistorico(await resHist.json());
            if (resPresc.ok) setPrescricoes(await resPresc.json());
        } catch (erro) { console.error(erro); } 
        finally { setCarregando(false); }
    };

    const enviarSOS = async () => {
        if (!await showConfirm('Tem certeza que precisa de ajuda de emergência?')) return;
        setEnviandoSOS(true);
        try {
            await fetch('http://localhost:3001/api/alertas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: usuario.id, tipo: 'sos', mensagem: 'O paciente acionou o botão de emergência!' }) });
            showAlert('Alerta enviado com sucesso! Aguarde o contato.', 'sucesso');
        } catch (erro) { showAlert('Erro ao enviar alerta.', 'erro'); } finally { setEnviandoSOS(false); }
    };

    const formatarDetalhes = (treino) => {
        switch(treino.tipo) {
            case 'tempo': return `${treino.duracaoMinutos} Minutos Contínuos`;
            case 'repeticao': return `${treino.series} séries de ${treino.repeticoes} repetições`;
            case 'isometria': return `${treino.series} séries sustentando por ${treino.duracaoMinutos} seg`;
            case 'carga': return `${treino.series}x${treino.repeticoes} usando ${treino.carga}`;
            case 'meta': return `Objetivo: ${treino.meta}`;
            default: return '';
        }
    };

    const renderBadgeTipo = (tipo) => {
        const badges = {
            tempo: { texto: '⏱️ Contínuo', corBg: '#dbeafe', corTexto: '#1e40af', border: '#bfdbfe' },
            repeticao: { texto: '🔄 Repetições', corBg: '#f3e8ff', corTexto: '#6b21a8', border: '#e9d5ff' },
            isometria: { texto: '🧘 Isometria', corBg: '#ffedd5', corTexto: '#c2410c', border: '#fed7aa' },
            carga: { texto: '🏋️ Com Carga', corBg: '#fee2e2', corTexto: '#b91c1c', border: '#fecaca' },
            meta: { texto: '🎯 Tarefa', corBg: '#dcfce7', corTexto: '#15803d', border: '#bbf7d0' }
        };
        const b = badges[tipo] || { texto: '📌 Outro', corBg: '#f3f4f6', corTexto: '#374151', border: '#e5e7eb' };
        return <span style={{ backgroundColor: b.corBg, color: b.corTexto, border: `1px solid ${b.border}`, padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.5rem' }}>{b.texto}</span>;
    };

    const todosOsGrupos = prescricoes.reduce((grupos, treino) => {
        const nomeGrupo = treino.grupo || 'Treino Geral';
        if (!grupos[nomeGrupo]) grupos[nomeGrupo] = { dias: treino.diasDaSemana || '', cor: treino.cor || '#059669', exercicios: [] };
        grupos[nomeGrupo].exercicios.push(treino);
        return grupos;
    }, {});

    const gruposDesteDia = Object.entries(todosOsGrupos).filter(([_, dados]) => dados.dias.includes(diaSelecionado) || dados.dias === '');
    
    // Identifica todos os dias que possuem exercícios para colocar a bolinha verde
    const diasComTreino = Object.values(todosOsGrupos).flatMap(g => g.dias.split(',').map(d => d.trim()));

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ marginBottom: '2rem', backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h1 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '2.2rem', lineHeight: '1.2' }}>Olá, {usuario.nome}!</h1><p style={{ margin: 0, color: '#15803d', fontSize: '1.1rem' }}>O seu painel de atividades</p></div>
                <button onClick={carregarTudo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><RefreshCw size={20} className={carregando ? "girar" : ""} /> Atualizar</button>
            </div>

            <button onClick={enviarSOS} disabled={enviandoSOS} style={{ width: '100%', padding: '1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}><AlertTriangle size={32} /> {enviandoSOS ? 'ENVIANDO ALERTA...' : 'PRECISO DE AJUDA (SOS)'}</button>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1rem' }}><CalendarDays size={24} color="#059669" /> Minha Rotina da Semana</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {diasDaSemanaOpcoes.map(dia => {
                    const ativo = dia === diaSelecionado;
                    const temTreino = diasComTreino.includes(dia) || diasComTreino.includes(''); // '' = Todos os dias
                    
                    return (
                        <button key={dia} onClick={() => setDiaSelecionado(dia)} style={{ flex: 1, minWidth: '60px', padding: '0.75rem 0.5rem', border: 'none', borderRadius: '8px', backgroundColor: ativo ? '#059669' : 'transparent', color: ativo ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                            {dia}
                            {/* Bolinha indicadora de treino */}
                            {temTreino && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ativo ? 'white' : '#10b981' }} />}
                        </button>
                    );
                })}
            </div>
            
            {gruposDesteDia.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '2.5rem 1.5rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: '#64748b', fontSize: '1.15rem', margin: '0 0 1rem 0' }}>
                        Parabéns! Você não tem exercícios agendados para <strong>{diaSelecionado === diaAtualCurto ? 'hoje' : 'este dia'}</strong>.
                    </p>
                    {diasComTreino.filter(d => d !== '').length > 0 && (
                        <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            💡 Clique nas bolinhas verdes acima! Você tem treinos em: {Array.from(new Set(diasComTreino.filter(d => d !== ''))).join(', ')}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {gruposDesteDia.map(([nomeGrupo, dadosGrupo]) => (
                        <div key={nomeGrupo} style={{ backgroundColor: dadosGrupo.cor, borderRadius: '12px', overflow: 'hidden', boxShadow: `0 10px 15px -3px ${dadosGrupo.cor}40` }}>
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: 'white', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ margin: 0, fontSize: '1.5rem' }}>{nomeGrupo}</h2><ClipboardList size={24} /></div>
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {dadosGrupo.exercicios.map(p => (
                                    <div key={p.id} style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: '#1e293b' }}>
                                            {renderBadgeTipo(p.tipo)}
                                            {p.focoMuscular && <span style={{ marginLeft: '0.5rem', backgroundColor: '#e2e8f0', color: '#334155', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>🎯 {traduzirMusculo(p.focoMuscular)}</span>}
                                            <h3 style={{ margin: '0.25rem 0 0.25rem 0', fontSize: '1.2rem' }}>{p.titulo}</h3>
                                            <p style={{ margin: 0, opacity: 0.9 }}>{formatarDetalhes(p)}</p>
                                        </div>
                                        <button onClick={() => navigate('/exercicio', { state: { treino: p } })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: dadosGrupo.cor, color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}><PlayCircle size={20} /> Começar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}