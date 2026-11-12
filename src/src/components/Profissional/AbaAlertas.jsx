// src/components/Profissional/AbaAlertas.jsx
import React from 'react';
import { AlertTriangle, CheckCircle, Phone } from 'lucide-react';

export default function AbaAlertas({ alertas = [], onResolverAlerta }) {
    const listaAlertas = Array.isArray(alertas) ? alertas : [];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Alertas de Treino & Ocorrências</h2>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Monitorização em tempo real de queixas de esforço e solicitações de emergência.</p>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.5rem 1rem', border: '1px solid #fecaca' }}>
                    {listaAlertas.length} ocorrência(s) pendente(s)
                </span>
            </div>

            {listaAlertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Tudo sob controle</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Nenhum paciente registrou queixas ou pedidos de emergência nas últimas sessões.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {listaAlertas.map(alerta => (
                        <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.25rem', borderLeft: `6px solid ${alerta.tipo === 'sos' ? '#ef4444' : '#f59e0b'}`, borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '280px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <strong style={{ color: '#1e293b', fontSize: '1.15rem' }}>👤 {alerta.utenteNome || alerta.usuario?.nome || 'Paciente'}</strong>
                                    <span style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem' }}>
                                        🕒 {new Date(alerta.dataCriacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: alerta.tipo === 'sos' ? '#fee2e2' : '#fef3c7', color: alerta.tipo === 'sos' ? '#991b1b' : '#92400e', padding: '0.2rem 0.5rem' }}>
                                        {alerta.tipo === 'sos' ? 'SOS Emergência' : 'Dificuldade'}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#334155', fontWeight: '500' }}>"{alerta.mensagem}"</p>
                                
                                {(alerta.grupo || alerta.treino) && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {alerta.grupo && <span style={{ fontSize: '0.85rem', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}>📁 Pasta: {alerta.grupo}</span>}
                                        {alerta.treino && <span style={{ fontSize: '0.85rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}>🏋️ Exercício: {alerta.treino}</span>}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {(alerta.utenteTel || alerta.usuario?.celular) && (
                                    <a href={`tel:${(alerta.utenteTel || alerta.usuario?.celular).replace(/\D/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        <Phone size={16} /> Contatar
                                    </a>
                                )}
                                <button onClick={() => onResolverAlerta(alerta.id)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                    <CheckCircle size={18} /> Marcar como Resolvido
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}