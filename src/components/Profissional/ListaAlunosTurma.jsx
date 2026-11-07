// src/components/Profissional/ListaAlunosTurma.jsx
import React from 'react';
import { User, Send, ArrowRight, X, UserPlus } from 'lucide-react';

export default function ListaAlunosTurma({ turma, onPrescreverTurma, onSelecionarAluno, alunoSelecionado, onRemoverAlunoDaTurma, onAbrirAdicionarAluno }) {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                        Alunos de: <span style={{ color: turma.cor }}>{turma.nome}</span>
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Clique num aluno para ver ficha e prescrever individualmente.</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={onAbrirAdicionarAluno} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <UserPlus size={18} /> Adicionar Alunos
                    </button>
                    <button onClick={onPrescreverTurma} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: turma.cor, color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <Send size={18} /> Prescrever p/ Todos
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {turma.alunos && turma.alunos.length > 0 ? (
                    turma.alunos.map(aluno => {
                        const isSelected = alunoSelecionado?.id === aluno.id;
                        return (
                            <div key={aluno.id} onClick={() => onSelecionarAluno(aluno)} style={{ padding: '0.75rem', borderRadius: '10px', border: `1px solid ${isSelected ? turma.cor : '#cbd5e1'}`, backgroundColor: isSelected ? `${turma.cor}10` : '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${turma.cor}20`, color: turma.cor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.2rem 0', color: '#1e293b', fontSize: '0.95rem' }}>{aluno.nome}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{aluno.idade || '?'} anos</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ArrowRight size={18} color={isSelected ? turma.cor : '#94a3b8'} />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemoverAlunoDaTurma(aluno.id, aluno.nome); }} 
                                        style={{ background: 'white', border: '1px solid #fecaca', borderRadius: '50%', padding: '0.3rem', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                                        title="Remover da Turma"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>Nenhum aluno associado a esta turma.</p>
                )}
            </div>
        </div>
    );
}