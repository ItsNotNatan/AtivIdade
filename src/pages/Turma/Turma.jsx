import React from 'react';
import { Users, CheckCircle2, AlertTriangle, Clock, Phone, HeartPulse } from 'lucide-react';
import './Turma.css';

export default function Turma() {
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
            status: 'Atenção: Dor relatada',
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
            ultimoFeedback: 'Sem registro recente',
            contatoEmergenciaNome: 'Carla (Esposa)',
            contatoEmergenciaTel: '11966666666'
        }
    ];

    const totalAlunos = alunos.length;
    const concluidosHoje = alunos.filter(a => a.tipoStatus === 'ok').length;
    const alertas = alunos.filter(a => a.tipoStatus === 'atencao').length;

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

            {/* Painel de Indicadores */}
            <div className="turma-kpis">
                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                        <Users size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Total de Alunos</h4>
                        <span>{totalAlunos}</span>
                    </div>
                </div>

                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <CheckCircle2 size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Concluíram Hoje</h4>
                        <span>{concluidosHoje}</span>
                    </div>
                </div>

                <div className="kpi-turma-card">
                    <div className="kpi-turma-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        <AlertTriangle size={28} />
                    </div>
                    <div className="kpi-turma-info">
                        <h4>Precisam de Atenção</h4>
                        <span>{alertas}</span>
                    </div>
                </div>
            </div>

            {/* Grelha de Alunos */}
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

                            <a href={`tel:${aluno.contatoEmergenciaTel}`} className="contato-rapido" title="Ligar para o contato de emergência">
                                <Phone size={14} /> Apoio: {aluno.contatoEmergenciaNome}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}