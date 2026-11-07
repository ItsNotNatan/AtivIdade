// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { Users, AlertTriangle, Activity, CheckCircle, PlusCircle, Trash2, ClipboardList } from 'lucide-react';

export default function DashboardProfissional() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();

    const [pacientes, setPacientes] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [historicoPaciente, setHistoricoPaciente] = useState([]);
    const [prescricoesPaciente, setPrescricoesPaciente] = useState([]);
    
    const [novaPrescricao, setNovaPrescricao] = useState({ 
        titulo: '', tipo: 'tempo', duracaoMinutos: 10, series: 3, repeticoes: 10, carga: '', meta: '' 
    });
    const [prescrevendo, setPrescrevendo] = useState(false);

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'profissional') navigate('/login');
        else carregarDados();
    }, [usuario, navigate]);

    const carregarDados = async () => {
        try {
            const [resPacientes, resAlertas] = await Promise.all([
                fetch('http://localhost:3001/api/utentes'), 
                fetch('http://localhost:3001/api/alertas/pendentes')
            ]);
            if (resPacientes.ok) setPacientes(await resPacientes.json());
            if (resAlertas.ok) setAlertas(await resAlertas.json());
        } catch (erro) { console.error(erro); }
    };

    const verPaciente = async (paciente) => {
        setPacienteSelecionado(paciente);
        try {
            const [resHist, resPresc] = await Promise.all([
                fetch(`http://localhost:3001/api/atividades/${paciente.id}`),
                fetch(`http://localhost:3001/api/prescricoes/${paciente.id}`)
            ]);
            if (resHist.ok) setHistoricoPaciente(await resHist.json());
            if (resPresc.ok) setPrescricoesPaciente(await resPresc.json());
        } catch (erro) { console.error(erro); }
    };

    const resolverAlerta = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/alertas/${id}/resolver`, { method: 'PUT' });
            if (res.ok) carregarDados(); 
        } catch (erro) { console.error(erro); }
    };

    const prescreverTreino = async (e) => {
        e.preventDefault();
        setPrescrevendo(true);
        try {
            const resposta = await fetch('http://localhost:3001/api/prescricoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: pacienteSelecionado.id, // O ID do paciente logado
                    ...novaPrescricao
                })
            });
            if (resposta.ok) {
                // Ao invés de fazer um novo fetch completo, nós podemos simplesmente
                // adicionar o novo treino no topo da lista local na tela!
                const nova = {
                    id: Date.now().toString(), // Um ID temporário só para a tela
                    titulo: novaPrescricao.titulo,
                    tipo: novaPrescricao.tipo,
                    duracaoMinutos: novaPrescricao.duracaoMinutos,
                    series: novaPrescricao.series,
                    repeticoes: novaPrescricao.repeticoes,
                    carga: novaPrescricao.carga,
                    meta: novaPrescricao.meta
                };
                
                setPrescricoesPaciente(prev => [nova, ...prev]);
                
                // Limpa o formulário após enviar
                setNovaPrescricao({ titulo: '', tipo: 'tempo', duracaoMinutos: 10, series: 3, repeticoes: 10, carga: '', meta: '' });
                alert('Treino prescrito e enviado!');
            }
        } catch (erro) {
            console.error(erro);
            alert('Erro ao prescrever treino.');
        } finally {
            setPrescrevendo(false);
        }
    };

    const deletarPrescricao = async (id) => {
        if (!window.confirm('Tem certeza que deseja apagar este exercício?')) return;
        try {
            const resposta = await fetch(`http://localhost:3001/api/prescricoes/${id}`, { method: 'DELETE' });
            if (resposta.ok) setPrescricoesPaciente(prev => prev.filter(p => p.id !== id));
        } catch (erro) { console.error(erro); }
    };

    const formatarDetalhes = (treino) => {
        switch(treino.tipo) {
            case 'tempo': return `${treino.duracaoMinutos} min`;
            case 'repeticao': return `${treino.series} séries de ${treino.repeticoes} repetições`;
            case 'isometria': return `${treino.series} séries sustentando por ${treino.duracaoMinutos} seg`;
            case 'carga': return `${treino.series}x${treino.repeticoes} com ${treino.carga}`;
            case 'meta': return `Meta: ${treino.meta}`;
            default: return '';
        }
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            <div style={{ marginBottom: '2rem', backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '12px' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '2rem', lineHeight: '1.2' }}>Olá, {usuario.nome}</h1>
                <p style={{ margin: 0, color: '#1d4ed8', fontSize: '1.1rem' }}>Painel do Fisioterapeuta</p>
            </div>

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
                                    <p style={{ margin: 0, color: '#64748b' }}>Celular: {alerta.utenteTel} | {new Date(alerta.dataCriacao).toLocaleTimeString('pt-BR')}</p>
                                    <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{alerta.mensagem}</p>
                                </div>
                                <button onClick={() => resolverAlerta(alerta.id)} style={{ padding: '0.75rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> Resolvido
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                        <Users size={24} color="#3b82f6" /> Meus Pacientes
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {pacientes.map(paciente => (
                            <div key={paciente.id} onClick={() => verPaciente(paciente)} style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: pacienteSelecionado?.id === paciente.id ? '#eff6ff' : 'white', borderColor: pacienteSelecionado?.id === paciente.id ? '#3b82f6' : '#cbd5e1' }}>
                                <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{paciente.nome} ({paciente.idade || '?'} anos)</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Condições: {paciente.condicoes || 'Nenhuma'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {!pacienteSelecionado ? (
                        <div style={{ backgroundColor: 'white', padding: '3rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '1.1rem' }}>Clique em um paciente ao lado para ver o histórico e prescrever exercícios.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '2px solid #22c55e' }}>
                                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', marginBottom: '1.5rem' }}>
                                    <PlusCircle size={24} /> Novo Treino: {pacienteSelecionado.nome.split(' ')[0]}
                                </h2>
                                <form onSubmit={prescreverTreino} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Tipo do Treino</label>
                                            <select value={novaPrescricao.tipo} onChange={e => setNovaPrescricao({...novaPrescricao, tipo: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                <option value="tempo">Contínuo (Por Tempo)</option>
                                                <option value="repeticao">Por Repetições</option>
                                                <option value="isometria">Sustentação / Isometria</option>
                                                <option value="carga">Com Carga / Resistência</option>
                                                <option value="meta">Tarefa / Meta (Ex: Distância)</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 3 }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome do Exercício</label>
                                            <input type="text" value={novaPrescricao.titulo} onChange={e => setNovaPrescricao({...novaPrescricao, titulo: e.target.value})} placeholder="Ex: Alongamento, Sentar e Levantar..." required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                        {novaPrescricao.tipo === 'tempo' && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Minutos</label>
                                                <input type="number" min="1" value={novaPrescricao.duracaoMinutos} onChange={e => setNovaPrescricao({...novaPrescricao, duracaoMinutos: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        {['repeticao', 'isometria', 'carga'].includes(novaPrescricao.tipo) && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Qtd. Séries</label>
                                                <input type="number" min="1" value={novaPrescricao.series} onChange={e => setNovaPrescricao({...novaPrescricao, series: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        {['repeticao', 'carga'].includes(novaPrescricao.tipo) && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Repetições</label>
                                                <input type="number" min="1" value={novaPrescricao.repeticoes} onChange={e => setNovaPrescricao({...novaPrescricao, repeticoes: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        {novaPrescricao.tipo === 'isometria' && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Segundos por Série</label>
                                                <input type="number" min="1" value={novaPrescricao.duracaoMinutos} onChange={e => setNovaPrescricao({...novaPrescricao, duracaoMinutos: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        {novaPrescricao.tipo === 'carga' && (
                                            <div style={{ flex: 2 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Carga / Elástico</label>
                                                <input type="text" value={novaPrescricao.carga} onChange={e => setNovaPrescricao({...novaPrescricao, carga: e.target.value})} placeholder="Ex: Peso 1kg" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        {novaPrescricao.tipo === 'meta' && (
                                            <div style={{ flex: 2 }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Qual a meta?</label>
                                                <input type="text" value={novaPrescricao.meta} onChange={e => setNovaPrescricao({...novaPrescricao, meta: e.target.value})} placeholder="Ex: Dar 3 voltas no quintal" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                                            </div>
                                        )}

                                        <button type="submit" disabled={prescrevendo} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {prescrevendo ? 'Enviando...' : 'Prescrever'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                                    <ClipboardList size={24} color="#3b82f6" /> Treinos Prescritos (Aguardando)
                                </h2>
                                {prescricoesPaciente.length === 0 ? (
                                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>Não há exercícios pendentes para este paciente.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {prescricoesPaciente.map(prescricao => (
                                            <div key={prescricao.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#1e3a8a' }}>{prescricao.titulo}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>{formatarDetalhes(prescricao)}</p>
                                                </div>
                                                <button onClick={() => deletarPrescricao(prescricao.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Apagar Prescrição">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                                    <Activity size={24} color="#10b981" /> Histórico de Execução
                                </h2>
                                {historicoPaciente.length === 0 ? (
                                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhuma atividade concluída ainda.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {historicoPaciente.map(treino => (
                                            <div key={treino.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#1e293b' }}>{treino.titulo}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{new Date(treino.dataCriacao).toLocaleDateString('pt-BR')} - {formatarDetalhes(treino)}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: treino.feedback === 'facil' ? '#dcfce7' : treino.feedback === 'bom' ? '#fef9c3' : '#fee2e2', color: treino.feedback === 'facil' ? '#166534' : treino.feedback === 'bom' ? '#854d0e' : '#991b1b' }}>
                                                        {treino.feedback.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}