// src/components/Profissional/CardsTurmas.jsx
import React, { useState } from 'react';
import { Users, Clock, CalendarDays, Plus, Trash2, X } from 'lucide-react';

export default function CardsTurmas({ turmas, turmaSelecionada, onSelecionarTurma, onCriarTurma, onDeletarTurma }) {
    const [criando, setCriando] = useState(false);
    
    const [novaTurma, setNovaTurma] = useState({ 
        nome: '', 
        horarioInicio: '08:00', 
        horarioFim: '09:00', 
        cor: '#059669' 
    });
    
    const [diasSelecionados, setDiasSelecionados] = useState(['Seg', 'Qua']);

    const diasOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const cores = ['#059669', '#2563eb', '#7c3aed', '#ea580c', '#db2777'];

    // GERA A LISTA DE HORÁRIOS A CADA 15 MINUTOS (Garante formato 24h)
    const gerarHorarios = () => {
        const horarios = [];
        for (let h = 6; h <= 22; h++) {
            for (let m = 0; m < 60; m += 15) {
                const horaStr = h.toString().padStart(2, '0');
                const minStr = m.toString().padStart(2, '0');
                horarios.push(`${horaStr}:${minStr}`);
            }
        }
        return horarios;
    };
    const opcoesDeHorario = gerarHorarios();

    const toggleDia = (dia) => {
        setDiasSelecionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (diasSelecionados.length === 0) return alert('Selecione pelo menos um dia.');
        
        const horarioFormatado = `${novaTurma.horarioInicio} - ${novaTurma.horarioFim}`;
        
        onCriarTurma({ 
            nome: novaTurma.nome, 
            horario: horarioFormatado, 
            cor: novaTurma.cor, 
            dias: diasSelecionados.join(', ') 
        });
        
        setCriando(false);
        setNovaTurma({ nome: '', horarioInicio: '08:00', horarioFim: '09:00', cor: '#059669' });
        setDiasSelecionados(['Seg', 'Qua']);
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>Gestão de Turmas</h2>
                <button 
                    onClick={() => setCriando(!criando)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {criando ? <X size={18} /> : <Plus size={18} />} {criando ? 'Cancelar' : 'Nova Turma'}
                </button>
            </div>

            {criando && (
                <form onSubmit={handleSubmit} className="fade-in" style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome da Turma</label>
                            <input type="text" placeholder="Ex: Turma Equilíbrio" value={novaTurma.nome} onChange={e=>setNovaTurma({...novaTurma, nome: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        
                        {/* SELETORES DE HORA EM DROPDOWN (FORÇA 24H E PERMITE CLIQUES) */}
                        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Início</label>
                                <select 
                                    value={novaTurma.horarioInicio} 
                                    onChange={e=>setNovaTurma({...novaTurma, horarioInicio: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    {opcoesDeHorario.map(h => <option key={`ini-${h}`} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Fim</label>
                                <select 
                                    value={novaTurma.horarioFim} 
                                    onChange={e=>setNovaTurma({...novaTurma, horarioFim: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    {opcoesDeHorario.map(h => <option key={`fim-${h}`} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Dias da Semana:</label>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {diasOpcoes.map(d => {
                                    const ativo = diasSelecionados.includes(d);
                                    return (
                                        <button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.4rem 0.65rem', borderRadius: '6px', border: `1px solid ${ativo ? novaTurma.cor : '#cbd5e1'}`, backgroundColor: ativo ? novaTurma.cor : 'white', color: ativo ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Cor:</span>
                                {cores.map(c => (
                                    <div key={c} onClick={() => setNovaTurma({...novaTurma, cor: c})} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: novaTurma.cor === c ? '3px solid #1e293b' : 'none' }} />
                                ))}
                            </div>
                            <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Salvar Turma
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {turmas.length === 0 && !criando && <p style={{ color: '#64748b' }}>Nenhuma turma cadastrada.</p>}
                
                {turmas.map(t => {
                    const isSelected = turmaSelecionada?.id === t.id;
                    return (
                        <div key={t.id} onClick={() => onSelecionarTurma(t)} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: `2px solid ${isSelected ? t.cor : '#e2e8f0'}`, boxShadow: isSelected ? `0 8px 16px -4px ${t.cor}30` : '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}>
                            <div style={{ width: '8px', position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: t.cor, borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '0.5rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.15rem' }}>{t.nome}</h3>
                                <button onClick={(e) => { e.stopPropagation(); onDeletarTurma(t.id, t.nome); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Apagar Turma">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Clock size={16} color={t.cor} /> {t.horario}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <CalendarDays size={16} color={t.cor} /> {t.dias}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                                    {/* AQUI FOI FEITA A ALTERAÇÃO: Utentes Registados -> Pacientes Registrados */}
                                    <Users size={16} color={t.cor} /> {t.alunos?.length || 0} Pacientes Registrados
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}