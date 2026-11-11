// src/components/Profissional/FichaIndividualAluno.jsx
import React, { useState, useEffect } from 'react';
import { 
    HeartHandshake, PlusCircle, Trash2, Edit2, Activity, 
    ClipboardList, Library, FolderPlus, CalendarDays, 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
    CheckCircle2, Users, Clock, Edit3, X, Save
} from 'lucide-react';
import { useAlert } from '../AlertContext/AlertContext';
import { API_URL } from '../../config';

export default function FichaIndividualAluno({ aluno, onAbrirPrescricaoIndividual, onAbrirAcervoParaAluno, onEditarPrescricao }) {
    const { showConfirm, showAlert } = useAlert();
    
    // Dados da API
    const [prescricoes, setPrescricoes] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [turmasAluno, setTurmasAluno] = useState([]);
    
    // Estado local para manter as condições sincronizadas após edição
    const [condicoesAluno, setCondicoesAluno] = useState('');
    
    // Gestão de Grupos
    const [gruposVazios, setGruposVazios] = useState([]);
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    // Modal de Edição de Condições
    const [modalCondicoesAberto, setModalCondicoesAberto] = useState(false);
    const [condicoesEditando, setCondicoesEditando] = useState('');
    const [salvandoCondicoes, setSalvandoCondicoes] = useState(false);

    // Controlos do Calendário
    const hoje = new Date();
    const [dataReferencia, setDataReferencia] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    const [diaSelecionadoStr, setDiaSelecionadoStr] = useState(hoje.toISOString().split('T')[0]);

    useEffect(() => {
        if (aluno?.id) {
            setCondicoesAluno(aluno.condicoes || '');
            carregarDadosCompletos();
        }
    }, [aluno]);

    const carregarDadosCompletos = async () => {
        try {
            const [resP, resH, resT] = await Promise.all([ 
                fetch(`${API_URL}/api/prescricoes/${aluno.id}`), 
                fetch(`${API_URL}/api/atividades/${aluno.id}`),
                fetch(`${API_URL}/api/turmas`)
            ]);
            
            if (resP.ok) {
                setPrescricoes(await resP.json());
                setGruposVazios([]); 
            }
            
            if (resH.ok) {
                setHistorico(await resH.json());
            }

            if (resT.ok) {
                const todasTurmas = await resT.json();
                const turmasDele = todasTurmas.filter(t => (t.alunos || []).some(a => a.id === aluno.id));
                setTurmasAluno(turmasDele);
            }
        } catch (err) { console.error("Erro ao carregar prontuário:", err); }
    };

    // ======================================================
    // SALVAR CONDIÇÕES CLÍNICAS
    // ======================================================
    const abrirModalCondicoes = () => {
        setCondicoesEditando(condicoesAluno);
        setModalCondicoesAberto(true);
    };

    const handleSalvarCondicoes = async (e) => {
        e.preventDefault();
        setSalvandoCondicoes(true);
        try {
            const res = await fetch(`${API_URL}/api/usuarios/${aluno.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ condicoes: condicoesEditando.trim() })
            });

            if (res.ok) {
                setCondicoesAluno(condicoesEditando.trim());
                setModalCondicoesAberto(false);
                showAlert('Condições atualizadas com sucesso!', 'sucesso');
            } else {
                showAlert('Erro ao atualizar condições.', 'erro');
            }
        } catch (err) {
            showAlert('Falha na comunicação com o servidor.', 'erro');
        } finally {
            setSalvandoCondicoes(false);
        }
    };

    // ======================================================
    // LÓGICA DO CALENDÁRIO MENSAL E HISTÓRICO
    // ======================================================
    const mudarMes = (incremento) => {
        setDataReferencia(prev => {
            const novaData = new Date(prev);
            novaData.setMonth(novaData.getMonth() + incremento);
            return novaData;
        });
    };

    const anoRef = dataReferencia.getFullYear();
    const mesRef = dataReferencia.getMonth();
    const diasNoMes = new Date(anoRef, mesRef + 1, 0).getDate();
    const primeiroDiaSemana = new Date(anoRef, mesRef, 1).getDay();

    const nomeMes = dataReferencia.toLocaleString('pt-BR', { month: 'long' });

    const historicoPorDia = (historico || []).reduce((acc, ativ) => {
        if (!ativ.dataCriacao) return acc;
        const dataStr = new Date(ativ.dataCriacao).toISOString().split('T')[0];
        if (!acc[dataStr]) acc[dataStr] = [];
        acc[dataStr].push(ativ);
        return acc;
    }, {});

    const atividadesDoDiaSelecionado = historicoPorDia[diaSelecionadoStr] || [];

    // ======================================================
    // LÓGICA DA AGENDA DA SEMANA
    // ======================================================
    const diasSemanaOrdem = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const agendaSemana = diasSemanaOrdem.reduce((acc, dia) => { acc[dia] = []; return acc; }, {});
    
    (prescricoes || []).forEach(p => {
        if (p.diasDaSemana) {
            const diasTreino = p.diasDaSemana.split(',').map(d => d.trim());
            diasTreino.forEach(d => {
                if (agendaSemana[d]) agendaSemana[d].push(p);
            });
        }
    });

    // ======================================================
    // GESTÃO DE PRESCRIÇÕES
    // ======================================================
    const deletarPrescricao = async (id) => {
        if (!await showConfirm('Excluir exercício da agenda do aluno?')) return;
        try {
            const res = await fetch(`${API_URL}/api/prescricoes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPrescricoes(prev => prev.filter(p => p.id !== id));
                showAlert('Exercício excluído!', 'sucesso');
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

    const gruposPrescritos = prescricoes.reduce((acc, p) => {
        const nomeGrupo = p.grupo || 'Geral';
        if(!acc[nomeGrupo]) acc[nomeGrupo] = { cor: p.cor || '#059669', dias: p.diasDaSemana || 'Livre', itens: [] };
        acc[nomeGrupo].itens.push(p);
        return acc;
    }, {});

    gruposVazios.forEach(gv => {
        if(!gruposPrescritos[gv.nome]) gruposPrescritos[gv.nome] = { cor: gv.cor, dias: 'Livre', itens: [] };
    });

    const condicoesLista = condicoesAluno ? condicoesAluno.split(',').map(c => c.trim()).filter(Boolean) : [];

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. CABEÇALHO E INFORMAÇÕES DE SAÚDE */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.6rem' }}>Prontuário: {aluno.nome}</h2>
                        <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>Idade: {aluno.idade || '?'} anos | Celular: {aluno.celular}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    
                    {/* BLOCO DE CONDIÇÕES COM BOTÃO DE EDIÇÃO */}
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                                <HeartHandshake size={18} /> Condições & Limitações
                            </h4>
                            <button 
                                onClick={abrirModalCondicoes}
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                <Edit3 size={14} /> Editar
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {condicoesLista.length > 0 ? condicoesLista.map((c, i) => <span key={i} style={{ backgroundColor: 'white', border: '1px solid #f87171', color: '#b91c1c', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>{c}</span>) : <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhuma limitação declarada.</span>}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                            <Users size={18} /> Turmas Matriculadas ({turmasAluno.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {turmasAluno.length > 0 ? turmasAluno.map((t) => <span key={t.id} style={{ backgroundColor: 'white', border: `1px solid ${t.cor || '#2563eb'}`, color: t.cor || '#1d4ed8', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>{t.nome}</span>) : <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Não está em nenhuma turma.</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. AGENDA DA SEMANA (GRADE VISUAL) */}
            <div>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1e293b' }}>
                    <CalendarDays size={22} color="#059669" /> Agenda Semanal Prescrita
                </h3>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                    {diasSemanaOrdem.map(dia => (
                        <div key={dia} style={{ flex: 1, minWidth: '120px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                                {dia}
                            </div>
                            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: '80px', backgroundColor: agendaSemana[dia].length > 0 ? '#f0fdf4' : 'white' }}>
                                {agendaSemana[dia].length > 0 ? (
                                    agendaSemana[dia].map(ex => (
                                        <div key={ex.id} style={{ fontSize: '0.75rem', backgroundColor: 'white', border: '1px solid #bbf7d0', color: '#166534', padding: '0.3rem', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ex.titulo}>
                                            • {ex.titulo}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', marginTop: '1rem' }}>Descanso</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. CALENDÁRIO MENSAL E HISTÓRICO DE TREINOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                
                {/* CALENDÁRIO */}
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e293b' }}>
                        <CalendarIcon size={20} color="#2563eb" /> Mapa de Frequência
                    </h3>
                    <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <button onClick={() => mudarMes(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#475569' }}><ChevronLeft size={20} /></button>
                            <strong style={{ textTransform: 'capitalize', color: '#1e293b' }}>{nomeMes} {anoRef}</strong>
                            <button onClick={() => mudarMes(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#475569' }}><ChevronRight size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>
                            <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                            {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`vazio-${i}`} />)}
                            
                            {Array.from({ length: diasNoMes }).map((_, i) => {
                                const dia = i + 1;
                                const dataAtual = new Date(anoRef, mesRef, dia);
                                const strData = new Date(dataAtual.getTime() - (dataAtual.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                
                                const temTreino = historicoPorDia[strData] && historicoPorDia[strData].length > 0;
                                const isSelecionado = diaSelecionadoStr === strData;

                                return (
                                    <button 
                                        key={dia}
                                        onClick={() => setDiaSelecionadoStr(strData)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '6px',
                                            border: isSelecionado ? '2px solid #2563eb' : '1px solid transparent',
                                            backgroundColor: temTreino ? '#22c55e' : '#f1f5f9',
                                            color: temTreino ? 'white' : '#475569',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {dia}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* DETALHES DO DIA CLICADO NO CALENDÁRIO */}
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e293b' }}>
                        <Activity size={20} color="#059669" /> Atividades de {diaSelecionadoStr.split('-').reverse().join('/')}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {atividadesDoDiaSelecionado.length === 0 ? (
                            <div style={{ backgroundColor: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0, fontSize: '0.95rem' }}>O paciente não registou nenhuma atividade neste dia.</p>
                            </div>
                        ) : (
                            atividadesDoDiaSelecionado.map(ativ => (
                                <div key={ativ.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', borderLeft: '4px solid #059669' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{ativ.titulo}</strong>
                                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            {new Date(ativ.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>📁 {ativ.grupo || 'Geral'}</span>
                                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                            <Clock size={12} style={{ display: 'inline', marginRight: '2px' }}/> 
                                            {ativ.duracaoSegundos ? Math.floor(ativ.duracaoSegundos / 60) + ' min' : (ativ.tipo || 'Exercício')}
                                        </span>
                                    </div>
                                    
                                    <div style={{ backgroundColor: ativ.feedback?.includes('10') || ativ.feedback?.includes('9') || ativ.feedback?.includes('8') ? '#fef2f2' : '#f0fdf4', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontWeight: 'bold' }}>Feedback do Paciente:</span><br/>
                                        {ativ.feedback || 'Concluído sem observações.'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 4. GESTÃO DE PRESCRIÇÕES */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1e293b' }}>
                        <ClipboardList size={22} color="#2563eb" /> Gestão de Prescrições
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setAddGrupoAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}><FolderPlus size={16} /> Criar Grupo</button>
                        <button onClick={onAbrirAcervoParaAluno} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'white', color: '#059669', border: '2px solid #059669', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}><Library size={16} /> Puxar do Acervo</button>
                    </div>
                </div>

                {addGrupoAberto && (
                    <form onSubmit={handleCriarGrupoVazio} className="fade-in" style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '2px dashed #059669', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.35rem' }}>Nome do Grupo para este aluno</label>
                            <input type="text" value={novoGrupoNome} onChange={e => setNovoGrupoNome(e.target.value)} autoFocus required placeholder="Ex: Fisioterapia Respiratória..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Adicionar Pasta</button>
                        <button type="button" onClick={() => setAddGrupoAberto(false)} style={{ backgroundColor: 'white', color: '#4b5563', border: '1px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                    </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
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
                            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
                                {dados.itens.length === 0 && <p style={{ margin: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>Nenhum exercício neste grupo.</p>}
                                {dados.itens.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>{p.titulo}</span>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button onClick={() => onEditarPrescricao(p)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={16} /></button>
                                            <button onClick={() => deletarPrescricao(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' }}>Nenhum exercício agendado para este paciente.</p>}
                </div>
            </div>

            {/* 5. MODAL DE EDIÇÃO DAS CONDIÇÕES CLÍNICAS */}
            {modalCondicoesAberto && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                                <HeartHandshake size={20} /> Atualizar Condições Clínicas
                            </h3>
                            <button onClick={() => setModalCondicoesAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSalvarCondicoes}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>
                                Adicione as restrições ou alertas de saúde do paciente, separadas por vírgula:
                            </label>
                            <textarea 
                                value={condicoesEditando}
                                onChange={(e) => setCondicoesEditando(e.target.value)}
                                placeholder="Ex: Hipertensão, Artrose no joelho direito, Risco de Queda..."
                                rows="3"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setModalCondicoesAberto(false)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvandoCondicoes} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', backgroundColor: '#dc2626', border: 'none', borderRadius: '6px', fontWeight: 'bold', color: 'white', cursor: 'pointer' }}>
                                    <Save size={16} /> {salvandoCondicoes ? 'Salvando...' : 'Salvar Ficha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}