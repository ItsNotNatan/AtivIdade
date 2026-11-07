// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import CardsTurmas from '../../components/Profissional/CardsTurmas';
import ListaAlunosTurma from '../../components/Profissional/ListaAlunosTurma';
import FichaIndividualAluno from '../../components/Profissional/FichaIndividualAluno';
import FormPrescricaoModal from '../../components/Profissional/FormPrescricaoModal';

export default function DashboardProfissional() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();

    const [turmas, setTurmas] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [alertas, setAlertas] = useState([]);

    // Modal de Prescrição (Alvo: turma ou paciente individual)
    const [modalAlvo, setModalAlvo] = useState(null);

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'profissional') navigate('/login');
        else carregarDados();
    }, [usuario, navigate]);

    const carregarDados = async () => {
        try {
            const [resTurmas, resAlertas] = await Promise.all([
                fetch('http://localhost:3001/api/turmas'),
                fetch('http://localhost:3001/api/alertas/pendentes')
            ]);
            if (resTurmas.ok) {
                const dados = await resTurmas.json();
                setTurmas(dados);
                if (dados.length > 0 && !turmaSelecionada) {
                    setTurmaSelecionada(dados[0]); // Seleciona a primeira turma por defeito
                }
            }
            if (resAlertas.ok) setAlertas(await resAlertas.json());
        } catch (err) {
            console.error(err);
        }
    };

    const resolverAlerta = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/alertas/${id}/resolver`, { method: 'PUT' });
            if (res.ok) carregarDados();
        } catch (err) { console.error(err); }
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO */}
            <div style={{ marginBottom: '2rem', backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '12px' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '2rem' }}>Olá, {usuario.nome}</h1>
                <p style={{ margin: 0, color: '#1d4ed8', fontSize: '1.1rem' }}>Gestão de Turmas e Prescrição de Exercícios</p>
            </div>

            {/* ALERTAS SOS */}
            {alertas.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={22} /> Pedidos de SOS Pendentes ({alertas.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alertas.map(alerta => (
                            <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.85rem', borderRadius: '8px' }}>
                                <div>
                                    <strong style={{ color: '#b91c1c' }}>{alerta.utenteNome}</strong> ({alerta.utenteTel})
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>{alerta.mensagem}</p>
                                </div>
                                <button onClick={() => resolverAlerta(alerta.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <CheckCircle size={16} /> Resolvido
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 1. SELEÇÃO DE TURMAS */}
            <CardsTurmas 
                turmas={turmas} 
                turmaSelecionada={turmaSelecionada} 
                onSelecionarTurma={(t) => { setTurmaSelecionada(t); setAlunoSelecionado(null); }} 
            />

            {/* 2. ALUNOS DA TURMA SELECIONADA */}
            {turmaSelecionada && (
                <ListaAlunosTurma 
                    turma={turmaSelecionada}
                    alunoSelecionado={alunoSelecionado}
                    onSelecionarAluno={(a) => setAlunoSelecionado(a)}
                    onPrescreverTurma={() => setModalAlvo({ tipo: 'turma', dados: turmaSelecionada })}
                />
            )}

            {/* 3. FICHA INDIVIDUAL DO ALUNO (Se algum for clicado) */}
            {alunoSelecionado && (
                <FichaIndividualAluno 
                    aluno={alunoSelecionado}
                    onAbrirPrescricaoIndividual={() => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado })}
                />
            )}

            {/* MODAL REUTILIZÁVEL DE PRESCRIÇÃO */}
            {modalAlvo && (
                <FormPrescricaoModal 
                    alvo={modalAlvo} 
                    onClose={() => setModalAlvo(null)} 
                    onSucesso={() => carregarDados()} 
                />
            )}
        </div>
    );
}