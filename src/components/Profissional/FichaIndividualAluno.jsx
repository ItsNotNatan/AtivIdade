// src/components/Profissional/FichaIndividualAluno.jsx
import React, { useState, useEffect } from 'react';
import { HeartHandshake, PlusCircle, Trash2, Activity, ClipboardList } from 'lucide-react';

export default function FichaIndividualAluno({ aluno, onAbrirPrescricaoIndividual }) {
    const [prescricoes, setPrescricoes] = useState([]);
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        if (aluno?.id) carregarDadosAluno();
    }, [aluno]);

    const carregarDadosAluno = async () => {
        try {
            const [resP, resH] = await Promise.all([
                fetch(`http://localhost:3001/api/prescricoes/${aluno.id}`),
                fetch(`http://localhost:3001/api/atividades/${aluno.id}`)
            ]);
            if (resP.ok) setPrescricoes(await resP.json());
            if (resH.ok) setHistorico(await resH.json());
        } catch (err) {
            console.error(err);
        }
    };

    const deletarPrescricao = async (id) => {
        if (!window.confirm('Excluir exercício?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/prescricoes/${id}`, { method: 'DELETE' });
            if (res.ok) setPrescricoes(prev => prev.filter(p => p.id !== id));
        } catch (err) { console.error(err); }
    };

    const condicoesLista = aluno.condicoes ? aluno.condicoes.split(',').map(c => c.trim()).filter(Boolean) : [];

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.4rem' }}>Ficha de: {aluno.nome}</h2>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Idade: {aluno.idade || '?'} anos | Telemóvel: {aluno.telemovel}</span>
                </div>
                <button 
                    onClick={onAbrirPrescricaoIndividual}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    <PlusCircle size={18} /> Prescrever Treino Individual
                </button>
            </div>

            {/* ANAMNESE CLÍNICA */}
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                    <HeartHandshake size={18} /> Condições de Saúde & Articulações
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {condicoesLista.length > 0 ? (
                        condicoesLista.map((c, i) => (
                            <span key={i} style={{ backgroundColor: 'white', border: '1px solid #f87171', color: '#b91c1c', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>
                                {c}
                            </span>
                        ))
                    ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhuma limitação declarada.</span>
                    )}
                </div>
            </div>

            {/* LISTAGEM DE TREINOS DELE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', color: '#1e293b' }}>
                        <ClipboardList size={20} color="#2563eb" /> Exercícios Agendados ({prescricoes.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {prescricoes.length > 0 ? (
                            prescricoes.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${p.cor || '#059669'}` }}>
                                    <div>
                                        <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{p.titulo}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.grupo} ({p.diasDaSemana || 'Livre'})</div>
                                    </div>
                                    <button onClick={() => deletarPrescricao(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Sem exercícios pendentes.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', color: '#1e293b' }}>
                        <Activity size={20} color="#059669" /> Histórico Recente
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {historico.length > 0 ? (
                            historico.slice(0, 5).map(h => (
                                <div key={h.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{h.titulo}</div>
                                        <small style={{ color: '#64748b' }}>{new Date(h.dataCriacao).toLocaleDateString('pt-PT')}</small>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: h.feedback === 'facil' ? '#dcfce7' : '#fee2e2', color: h.feedback === 'facil' ? '#166534' : '#991b1b' }}>
                                        {h.feedback?.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhum treino concluído ainda.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}