// src/components/Profissional/CardsTurmas.jsx
import React from 'react';
import { Users, Clock, CalendarDays } from 'lucide-react';

export default function CardsTurmas({ turmas, turmaSelecionada, onSelecionarTurma }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {turmas.map(t => {
                const isSelected = turmaSelecionada?.id === t.id;
                return (
                    <div 
                        key={t.id} 
                        onClick={() => onSelecionarTurma(t)}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: `2px solid ${isSelected ? t.cor : '#e2e8f0'}`,
                            boxShadow: isSelected ? `0 8px 16px -4px ${t.cor}30` : '0 2px 4px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        <div style={{ width: '8px', position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: t.cor, borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.15rem', paddingLeft: '0.5rem' }}>{t.nome}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={16} color={t.cor} /> {t.horario}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <CalendarDays size={16} color={t.cor} /> {t.dias}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                                <Users size={16} color={t.cor} /> {t.alunos?.length || 0} Utentes Registados
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}