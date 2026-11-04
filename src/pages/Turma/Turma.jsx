// src/pages/Turma/Turma.jsx
import React from 'react';
import { Users, CheckCircle2, AlertTriangle, Clock, Phone, ShieldAlert, Check } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Turma.css';

export default function Turma() {
    const { alertas, resolverAlerta } = useAuthStore();

    const profissional = {
        nome: 'Dra. Camila',
        especialidade: 'Fisioterapia Geriátrica',
        turmaNome: 'Grupo Manhã Ativa'
    };

    const alunos = [
        {
            id: 1,
            nome: 'Natan Silva',
            idade: 72,
            mobilidade: 'Caminho sem ajuda',
            condicoes: ['Pressão Alta', 'Dor no Joelho'],
            status: 'Concluído hoje',
            tipoStatus: 'ok',
            ultimoFeedback: 'Na medida certa 🙂',
            contatoEmergenciaNome: 'João (Filho)',
            contatoEmergenciaTel: '11988888888'
        },
        {
            id: 2,
            nome: 'Dona Maria Oliveira',
            idade: 78,
            mobilidade: 'Uso bengala',
            condicoes: ['Falta de Equilíbrio'],
            status: 'Atenção necessária',
            tipoStatus: 'atencao',
            ultimoFeedback: 'Muito difícil 🥵',
            contatoEmergenciaNome: 'Ana (Filha)',
            contatoEmergenciaTel: '11977777777'
        },
        {
            id: 3,
            nome: 'Seu Antônio Carlos',
            idade: 81,
            mobilidade: 'Na cadeira',
            condicoes: ['Problemas no Coração'],
            status: 'Não treinou hoje',
            tipoStatus: 'pendente',
            ultimoFeedback: 'Sem registo recente',
            contatoEmergenciaNome: 'Carla (Esposa)',
            contatoEmergenciaTel: '11966666666'
        }
    ];

    return (
        <div className="turma-container fade-in">
            <header className="turma-header">
                <div>
                    <h1 className="turma-title">{profissional.turmaNome}</h1>
                    <p className="turma-subtitle">
                        Responsável: <strong>{profissional.nome}</strong> ({profissional.especialidade})
                    </p>
                </div>
            </header>

            {/* SECÇÃO DE ALERTAS ATIVOS (SOS OU QUEIXA) */}
            {alertas.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <ShieldAlert size={22} color="#dc2626" /> Alertas em Tempo Real ({alertas.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alertas.map(alerta => (
                            <div 
                                key={alerta.id}
                                style={{
                                    backgroundColor: alerta.tipo === 'sos' ? '#fef2f2' : '#fffbeb',
                                    border: `2px solid ${alerta.tipo === 'sos' ? '#f87171' : '#fcd34d'}`,
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}
                            >
                                <div>
                                    <span style={{ 
                                        fontWeight: '800', 
                                        fontSize: '0.85rem', 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '0.4rem', 
                                        backgroundColor: alerta.tipo === 'sos' ? '#dc2626' : '#d97706',
                                        color: 'white',
                                        marginRight: '0.5rem'
                                    }}>
                                        {alerta.tipo === 'sos' ? 'EMERGÊNCIA SOS' : 'QUEIXA DE ESFORÇO'}
                                    </span>
                                    <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{alerta.alunoNome}</strong>
                                    <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: '0.5rem' }}>às {alerta.hora}</span>
                                    <p style={{ margin: '0.4rem 0 0 0', color: '#374151', fontSize: '1rem' }}>{alerta.mensagem}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <a 
                                        href={`tel:${alerta.contatoTel}`} 
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            backgroundColor: '#ffffff', color: '#1f2937', padding: '0.6rem 1rem',
                                            borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 'bold',
                                            textDecoration: 'none', fontSize: '0.95rem'
                                        }}
                                    >
                                        <Phone size={16} color="#059669" /> Ligar Apoio
                                    </a>
                                    <button 
                                        onClick={() => resolverAlerta(alerta.id)}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            backgroundColor: '#059669', color: 'white', padding: '0.6rem 1rem',
                                            borderRadius: '0.5rem', border: 'none', fontWeight: 'bold',
                                            cursor: 'pointer', fontSize: '0.95rem'
                                        }}
                                    >
                                        <Check size={16} /> Marcar como Resolvido
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Painel de Indicadores */}
            <div className="turma-kpis">
                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                        <Users size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Total de Alunos</h4>
                        <span>{alunos.length}</span>
                    </div>
                </div>

                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <CheckCircle2 size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Concluíram Hoje</h4>
                        <span>{alunos.filter(a => a.tipoStatus === 'ok').length}</span>
                    </div>
                </div>

                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        <AlertTriangle size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Alertas Ativos</h4>
                        <span>{alertas.length}</span>
                    </div>
                </div>
            </div>

            {/* Lista de Alunos */}
            <h2 className="turma-lista-titulo">Alunos da Turma</h2>
            <div className="alunos-grid">
                {alunos.map(aluno => (
                    <div 
                        key={aluno.id} 
                        className={`aluno-card ${aluno.tipoStatus === 'atencao' ? 'alerta' : ''}`}
                    >
                        <div className="aluno-perfil-bloco">
                            <div className="aluno-avatar">
                                {aluno.nome.charAt(0)}
                            </div>
                            <div className="aluno-info">
                                <h3>{aluno.nome} ({aluno.idade} anos)</h3>
                                <div className="aluno-tags">
                                    <span className="tag-mobilidade-pequena">{aluno.mobilidade}</span>
                                    {aluno.condicoes.map((cond, idx) => (
                                        <span key={idx} className="tag-restricao-pequena">{cond}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="aluno-status-bloco">
                            <span className={`status-treino status-${aluno.tipoStatus}`}>
                                {aluno.tipoStatus === 'ok' && <CheckCircle2 size={16} />}
                                {aluno.tipoStatus === 'atencao' && <AlertTriangle size={16} />}
                                {aluno.tipoStatus === 'pendente' && <Clock size={16} />}
                                {aluno.status}
                            </span>
                            
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                Retorno: <strong>{aluno.ultimoFeedback}</strong>
                            </span>

                            <a href={`tel:${aluno.contatoEmergenciaTel}`} className="contato-rapido" title="Ligar para o contacto de emergência">
                                <Phone size={14} /> Apoio: {aluno.contatoEmergenciaNome}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}