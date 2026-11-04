// src/pages/Equipa/Equipa.jsx
import React from 'react';
import { UserPlus, Users, Phone, Mail, Award } from 'lucide-react';
import './Equipa.css';

export default function Equipa() {
    const profissionais = [
        {
            id: 1,
            nome: 'Dra. Camila Santos',
            especialidade: 'Fisioterapeuta Geriátrica',
            turma: 'Turma Cadeira & Alongamento',
            alunosQtd: 16,
            telemovel: '(11) 98765-4321',
            email: 'camila.fisioterapia@email.com'
        },
        {
            id: 2,
            nome: 'Dr. Marcos Lima',
            especialidade: 'Educador Físico Sénior',
            turma: 'Turma Caminhada & Equilíbrio',
            alunosQtd: 18,
            telemovel: '(11) 97654-3210',
            email: 'marcos.treino@email.com'
        },
        {
            id: 3,
            nome: 'Dra. Inês Ferreira',
            especialidade: 'Terapeuta Ocupacional',
            turma: 'Turma Coordenação Motora',
            alunosQtd: 14,
            telemovel: '(11) 96543-2109',
            email: 'ines.terapia@email.com'
        }
    ];

    return (
        <div className="equipa-container fade-in">
            <header className="equipa-header">
                <div>
                    <h1 className="equipa-title">Corpo Clínico & Instrutores</h1>
                    <p className="equipa-subtitle">
                        Gestão dos profissionais responsáveis pela monitorização das turmas.
                    </p>
                </div>
                <button onClick={() => alert('Modal para convidar novo profissional')} className="btn-adicionar">
                    <UserPlus size={20} /> Adicionar Profissional
                </button>
            </header>

            <div className="profissionais-grid">
                {profissionais.map((prof) => (
                    <div key={prof.id} className="profissional-card">
                        <div>
                            <div className="profissional-topo">
                                <div className="profissional-avatar">
                                    {prof.nome.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}
                                </div>
                                <div className="profissional-info">
                                    <h3>{prof.nome}</h3>
                                    <p>{prof.especialidade}</p>
                                </div>
                            </div>

                            <div className="profissional-detalhes">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Award size={16} color="#059669" />
                                    <span><strong>{prof.turma}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={16} color="#2563eb" />
                                    <span>{prof.alunosQtd} seniores sob supervisão</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={16} color="#6b7280" />
                                    <span>{prof.telemovel}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profissional-acoes">
                            <button className="btn-acao-prof" onClick={() => alert(`Aceder à turma de ${prof.nome}`)}>
                                Ver Turma
                            </button>
                            <button className="btn-acao-prof" onClick={() => alert(`Editar perfil de ${prof.nome}`)}>
                                Gerir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}