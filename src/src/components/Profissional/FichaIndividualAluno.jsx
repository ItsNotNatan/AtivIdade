// src/components/Profissional/FichaIndividualAluno.jsx
import React, { useState, useEffect } from 'react';
import { 
    HeartHandshake, PlusCircle, Trash2, Edit2, Activity, 
    ClipboardList, Library, FolderPlus, Calendar as CalendarIcon, 
    Clock, Users, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useAlert } from '../AlertContext/AlertContext';
import { API_URL } from '../../config';

export default function FichaIndividualAluno({ aluno, onAbrirPrescricaoIndividual, onAbrirAcervoParaAluno, onEditarPrescricao }) {
    const { showConfirm, showAlert } = useAlert();
    const [prescricoes, setPrescricoes] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [turmas, setTurmas] = useState([]);
    
    const [gruposVazios, setGruposVazios] = useState([]);
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    // Estados do Calendário
    const [mesCalendario, setMesCalendario] = useState(new Date());
    const [diaSelecionado, setDiaSelecionado] = useState(new Date());

    useEffect(() => {
        if (aluno?.id) carregarDadosAluno();
    }, [aluno]);

    const carregarDadosAluno = async () => {
        try {
            const [resP, resH, resT] = await Promise.all([ 
                fetch(`${API_URL}/api/prescricoes/${aluno.id}`), 
                fetch(`${API_URL}/api/atividades/${aluno.id}`),
                fetch(`${API_URL}/api/turmas`)
            ]);
            
            if (resP.ok) setPrescricoes(await resP.json());
            if (resH.ok) setHistorico(await resH.json());
            if (resT.ok) {
                const todasTurmas = await resT.json();
                // Filtra apenas as turmas em que este aluno está matriculado
                const turmasDoAluno = todasTurmas.filter(t => t.alunos && t.alunos.some(a => a.id === aluno.id));
                setTurmas(turmasDoAluno);
            }
            setGruposVazios([]); 
        } catch (err) { console.error("Erro ao carregar dados da ficha:", err); }
    };

    const deletarPrescricao = async (id) => {
        if (!await showConfirm('Excluir exercício da agenda do paciente?')) return;
        try {
            const res = await fetch(`${API_URL}/api/prescricoes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPrescricoes(prev => prev.filter(p => p.id !== id));
                showAlert('Exercício excluído com sucesso.', 'sucesso');
            }
        } catch (err) { showAlert('Erro ao excluir exercício.', 'erro'); }
    };

    const handleCriarGrupoVazio = (e) => {
        e.preventDefault();
        const nomeFinal = novoGrupoNome.trim();
        if(nomeFinal) {
            setGruposVazios(prev => [...prev, { nome: nomeFinal, cor: '#2563eb' }]);
        }
        setAddGrupoAberto(false);
        setNovoGrupoNome('');
    };

    const condicoesLista = aluno.condicoes ? aluno.condicoes.split(',').map(c => c.trim()).filter(Boolean) : [];

    // Agrupamento para a Gestão de Pastas
    const gruposPrescritos = prescricoes.reduce((acc, p) => {
        const nomeGrupo = p.grupo || 'Geral';
        if(!acc[nomeGrupo]) acc[nomeGrupo] = { cor: p.cor || '#059669', dias: p.diasDaSemana || 'Livre', itens: [] };
        acc[nomeGrupo].itens.push(p);
        return acc;
    }, {});

    gruposVazios.forEach(gv => {
        if(!gruposPrescritos[gv.nome]) gruposPrescritos[gv.nome] = { cor: gv.cor, dias: 'Livre', itens: [] };
    });

    // Função de interpretação do feedback guardado
    const interpretarFeedback = (texto) => {
        if (!texto) return { nota: null, obs: '', cor: '#64748b', bg: '#f1f5f9', status: 'CONCLUÍDO' };
        
        if (texto.includes('Abortou') || texto.includes('Desistiu')) {
            return { nota: null, obs: 'O paciente abandonou a tela do exercício antes de finalizar.', cor: '#dc2626', bg: '#fee2e2', status: 'ABANDONADO' };
        }

        const match = texto.match(/Esforço:\s*(\d+)\/10\.\s*(.*)/i);
        if (match) {
            const nota = parseInt(match[1], 10);
            const obs = match[2]?.trim();
            
            let cor = '#b91c1c'; let bg = '#fef2f2'; 
            if (nota <= 3) { cor = '#166534'; bg = '#dcfce7'; } 
            else if (nota <= 6) { cor = '#b45309'; bg = '#fef3c7'; } 

            return { nota, obs, cor, bg, status: 'CONCLUÍDO' };
        }
        
        let cor = '#64748b'; let bg = '#f1f5f9';
        if (texto.toLowerCase().includes('facil')) { cor = '#166534'; bg = '#dcfce7'; }
        else if (texto.toLowerCase().includes('dificil')) { cor = '#b91c1c'; bg = '#fef2f2'; }
        
        return { nota: null, obs: texto, cor, bg, status: 'CONCLUÍDO' };
    };

    // =========================================================================
    // LÓGICA DO CALENDÁRIO E HISTÓRICO
    // =========================================================================
    const toDateKey = (data) => {
        const d = new Date(data);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };

    const historicoAgrupado = historico.reduce((acc, h) => {
        const key = toDateKey(h.dataCriacao);
        if (!acc[key]) acc[key] = [];
        acc[key].push(h);
        return acc;
    }, {});

    const getDiasDoMes = (data) => {
        const ano = data.getFullYear();
        const mes = data.getMonth();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        const primeiroDia = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sáb)
        return { diasNoMes, primeiroDia, ano, mes };
    };

    const alterarMes = (delta) => {
        const novaData = new Date(mesCalendario);
        novaData.setMonth(novaData.getMonth() + delta);
        setMesCalendario(novaData);
    };

    const { diasNoMes, primeiroDia, ano, mes } = getDiasDoMes(mesCalendario);
    const diasEmBranco = Array.from({ length: primeiroDia });
    const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

    const chaveDiaSelecionado = toDateKey(diaSelecionado);
    const historicoDoDiaSelecionado = historicoAgrupado[chaveDiaSelecionado] || [];

    // =========================================================================
    // LÓGICA DA AGENDA SEMANAL
    // =========================================================================
    const diasSemanaMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO DA FICHA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.5rem' }}>Ficha Clínica: {aluno.nome}</h2>
                    <span style={{ fontSize: '0.95rem', color: '#64748b' }}>Idade: {aluno.idade || '?'} anos | Celular: {aluno.celular}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setAddGrupoAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}><FolderPlus size={18} /> Criar Pasta</button>
                    <button onClick={onAbrirAcervoParaAluno} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}><Library size={18} /> Puxar do Acervo</button>
                </div>
            </div>

            {addGrupoAberto && (
                <form onSubmit={handleCriarGrupoVazio} className="fade-in" style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '2px dashed #059669', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.35rem' }}>Nome da nova pasta de treinos</label>
                        <input type="text" value={novoGrupoNome} onChange={e => setNovoGrupoNome(e.target.value)} autoFocus required placeholder="Ex: Reabilitação de Joelho..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar Pasta</button>
                    <button type="button" onClick={() => setAddGrupoAberto(false)} style={{ backgroundColor: 'white', color: '#4b5563', border: '1px solid #cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                </form>
            )}

            {/* SEÇÃO 1: INFORMAÇÕES DE SAÚDE E TURMAS */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}><HeartHandshake size={18} /> Condições de Saúde & Limitações</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {condicoesLista.length > 0 ? condicoesLista.map((c, i) => <span key={i} style={{ backgroundColor: 'white', border: '1px solid #f87171', color: '#b91c1c', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '600' }}>{c}</span>) : <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhuma restrição registrada.</span>}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}><Users size={18} /> Turmas Vinculadas</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {turmas.length > 0 ? turmas.map(t => (
                            <span key={t.id} style={{ backgroundColor: 'white', border: '1px solid #7dd3fc', color: '#0284c7', fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '6px', fontWeight: '600' }}>
                                📁 {t.nome}
                            </span>
                        )) : (
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>O paciente não pertence a nenhuma turma.</span>
                        )}
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: AGENDA DA SEMANA (Visão Horizontal) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <CalendarIcon size={22} color="#059669" /> Agenda Semanal de Treinos
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {diasSemanaMap.map((dia, index) => {
                        const treinosDesteDia = prescricoes.filter(p => p.diasDaSemana && p.diasDaSemana.includes(dia));
                        const isHoje = dia === diasSemanaMap[new Date().getDay()];
                        
                        return (
                            <div key={dia} style={{ flex: 1, minWidth: '130px', backgroundColor: isHoje ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isHoje ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: isHoje ? '#059669' : '#cbd5e1', color: isHoje ? 'white' : '#334155', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {dia} {isHoje && '(Hoje)'}
                                </div>
                                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '80px' }}>
                                    {treinosDesteDia.length > 0 ? treinosDesteDia.map(treino => (
                                        <div key={treino.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            <strong style={{ display: 'block', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{treino.titulo}</strong>
                                            <span style={{ color: treino.cor || '#059669', fontSize: '0.7rem', fontWeight: '600' }}>{treino.grupo}</span>
                                        </div>
                                    )) : (
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>Livre</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                
                {/* LADO ESQUERDO: GESTÃO DE PASTAS (Edição/Remoção) */}
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                        <ClipboardList size={22} color="#2563eb" /> Gestão de Exercícios ({prescricoes.length})
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.keys(gruposPrescritos).length > 0 ? Object.entries(gruposPrescritos).map(([nomeGrupo, dados]) => (
                            <div key={nomeGrupo} style={{ border: `1px solid ${dados.cor}40`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: `${dados.cor}15`, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${dados.cor}40` }}>
                                    <div>
                                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>{nomeGrupo}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dias: {dados.dias}</span>
                                    </div>
                                    <button onClick={() => onAbrirPrescricaoIndividual(nomeGrupo)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', color: dados.cor, border: `1px solid ${dados.cor}`, padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                        <PlusCircle size={14} /> Adicionar
                                    </button>
                                </div>
                                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {dados.itens.length === 0 && <p style={{ margin: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>Pasta vazia.</p>}
                                    {dados.itens.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                            
                                            {p.gifUrl ? (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    {p.gifUrl.match(/\.(mp4|webm)$/i) || p.gifUrl.startsWith('data:video') ? (
                                                        <video src={p.gifUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                                    ) : (
                                                        <img src={p.gifUrl} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🏋️</div>
                                            )}

                                            <span style={{ flex: 1, fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{p.titulo}</span>
                                            
                                            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                                <button onClick={() => onEditarPrescricao(p)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.25rem' }} title="Editar"><Edit2 size={16} /></button>
                                                <button onClick={() => deletarPrescricao(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }} title="Excluir"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>Nenhuma prescrição ativa.</p>}
                    </div>
                </div>

                {/* LADO DIREITO: CALENDÁRIO DE FREQUÊNCIA (NOVO) */}
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                        <Activity size={22} color="#059669" /> Calendário de Frequência
                    </h3>

                    {/* COMPONENTE DO CALENDÁRIO */}
                    <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <button onClick={() => alterarMes(-1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#334155' }}><ChevronLeft size={20} /></button>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', textTransform: 'capitalize' }}>
                                {mesCalendario.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </h4>
                            <button onClick={() => alterarMes(1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#334155' }}><ChevronRight size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                            {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>{d}</div>)}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                            {diasEmBranco.map((_, i) => <div key={`blank-${i}`} />)}
                            
                            {diasArray.map(dia => {
                                const dataFormatada = toDateKey(new Date(ano, mes, dia));
                                const temHistorico = historicoAgrupado[dataFormatada] && historicoAgrupado[dataFormatada].length > 0;
                                const isSelecionado = chaveDiaSelecionado === dataFormatada;
                                
                                return (
                                    <button 
                                        key={dia}
                                        onClick={() => setDiaSelecionado(new Date(ano, mes, dia))}
                                        style={{
                                            aspectRatio: '1', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                                            backgroundColor: isSelecionado ? '#1e293b' : (temHistorico ? '#dcfce7' : 'transparent'),
                                            color: isSelecionado ? 'white' : (temHistorico ? '#166534' : '#475569'),
                                            border: isSelecionado ? 'none' : (temHistorico ? '1px solid #bbf7d0' : '1px solid #f1f5f9'),
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {dia}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* DETALHES DO DIA SELECIONADO NO CALENDÁRIO */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={18} /> Registros de: {diaSelecionado.toLocaleDateString('pt-BR')}
                        </h4>

                        {historicoDoDiaSelecionado.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {historicoDoDiaSelecionado.map(h => {
                                    const feed = interpretarFeedback(h.feedback);
                                    return (
                                        <div key={h.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>{h.titulo}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>PASTA: {h.grupo || 'Geral'}</span>
                                                </div>
                                                <div style={{ backgroundColor: feed.bg, color: feed.cor, padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                                                    {feed.status === 'ABANDONADO' ? <><AlertCircle size={12}/> INCOMPLETO</> : (feed.nota !== null ? `Esforço: ${feed.nota}/10` : <><CheckCircle2 size={12}/> {feed.status}</>)}
                                                </div>
                                            </div>
                                            {feed.obs && (
                                                <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: `3px solid ${feed.cor}`, fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                                                    "{feed.obs}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>Nenhum exercício registrado neste dia.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}