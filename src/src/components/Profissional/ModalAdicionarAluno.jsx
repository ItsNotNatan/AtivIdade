// src/components/Profissional/ModalAdicionarAluno.jsx
import React from 'react';
import { X, UserPlus } from 'lucide-react';

export default function ModalAdicionarAluno({ isOpen, onClose, turma, utentesDisponiveis, onAdicionarAluno }) {
    if (!isOpen || !turma) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="fade-in" style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>Adicionar Paciente à Turma</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    Estes utentes não estão na turma <strong>{turma.nome}</strong>. Se os adicionar, eles farão parte de múltiplas turmas simultaneamente.
                </p>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {utentesDisponiveis.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>Não há outros utentes disponíveis no sistema.</p>
                    ) : (
                        utentesDisponiveis.map(u => (
                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <div>
                                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '1rem' }}>{u.nome}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {u.turmasIds?.length > 0 ? `Inscrito em ${u.turmasIds.length} turma(s)` : 'Sem nenhuma turma'}
                                    </span>
                                </div>
                                <button onClick={() => onAdicionarAluno(u.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 0.85rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <UserPlus size={16} /> Adicionar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}