// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Importação dos Componentes Modulares Limpos
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

    // Estado do Modal de Prescrição (alvo pode ser a turma inteira ou o paciente)
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
                // Se ainda não houver turma selecionada, seleciona a primeira automaticamente
                if (dados.length > 0 && !turmaSelecionada) {
                    setTurmaSelecionada(dados[0]);
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

            {/* ALERTAS SOS EM TEMPO REAL */}
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

            {/* 1. SELEÇÃO DE TURMAS (COMPONENTE MODULAR) */}
            <CardsTurmas 
                turmas={turmas} 
                turmaSelecionada={turmaSelecionada} 
                onSelecionarTurma={(t) => { setTurmaSelecionada(t); setAlunoSelecionado(null); }} 
            />

            {/* 2. ALUNOS DA TURMA SELECIONADA (COMPONENTE MODULAR) */}
            {turmaSelecionada && (
                <ListaAlunosTurma 
                    turma={turmaSelecionada}
                    alunoSelecionado={alunoSelecionado}
                    onSelecionarAluno={(a) => setAlunoSelecionado(a)}
                    onPrescreverTurma={() => setModalAlvo({ tipo: 'turma', dados: turmaSelecionada })}
                />
            )}

            {/* 3. FICHA INDIVIDUAL DO ALUNO (COMPONENTE MODULAR) */}
            {alunoSelecionado && (
                <FichaIndividualAluno 
                    aluno={alunoSelecionado}
                    onAbrirPrescricaoIndividual={() => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado })}
                />
            )}

            {/* 4. MODAL REUTILIZÁVEL DE PRESCRIÇÃO (Abre por cima da tela) */}
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