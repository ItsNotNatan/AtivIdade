// src/components/Profissional/AbaTurmas.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import CardsTurmas from './CardsTurmas';
import ListaAlunosTurma from './ListaAlunosTurma';
import FichaIndividualAluno from './FichaIndividualAluno';

export default function AbaTurmas({
    turmas,
    turmaSelecionada,
    onSelecionarTurma,
    onCriarTurma,
    onDeletarTurma,
    alunoSelecionado,
    onSelecionarAluno,
    onPrescreverTurma,
    onRemoverAlunoDaTurma,
    onAbrirAdicionarAluno,
    onAbrirPrescricaoIndividual,
    onAbrirAcervoParaAluno,
    onEditarPrescricao
}) {
    if (alunoSelecionado) {
        return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', border: '1px solid #cbd5e1' }}>
                    <button 
                        onClick={() => onSelecionarAluno(null)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                    >
                        <ArrowLeft size={18} /> Voltar à lista de alunos ({turmaSelecionada?.nome})
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>A visualizar prontuário individual</span>
                </div>

                <FichaIndividualAluno 
                    aluno={alunoSelecionado} 
                    onAbrirPrescricaoIndividual={onAbrirPrescricaoIndividual} 
                    onAbrirAcervoParaAluno={onAbrirAcervoParaAluno} 
                    onEditarPrescricao={onEditarPrescricao}
                />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <CardsTurmas 
                turmas={turmas} 
                turmaSelecionada={turmaSelecionada} 
                onSelecionarTurma={onSelecionarTurma} 
                onCriarTurma={onCriarTurma} 
                onDeletarTurma={onDeletarTurma} 
            />

            {turmaSelecionada && (
                <ListaAlunosTurma 
                    turma={turmaSelecionada} 
                    alunoSelecionado={alunoSelecionado} 
                    onSelecionarAluno={onSelecionarAluno} 
                    onPrescreverTurma={onPrescreverTurma} 
                    onRemoverAlunoDaTurma={onRemoverAlunoDaTurma} 
                    onAbrirAdicionarAluno={onAbrirAdicionarAluno} 
                />
            )}
        </div>
    );
}