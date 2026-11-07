// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { AlertTriangle, CheckCircle, X, UserPlus, Library } from 'lucide-react';
import { useAlert } from '../../components/AlertContext/AlertContext';

import CardsTurmas from '../../components/Profissional/CardsTurmas';
import ListaAlunosTurma from '../../components/Profissional/ListaAlunosTurma';
import FichaIndividualAluno from '../../components/Profissional/FichaIndividualAluno';
import FormPrescricaoModal from '../../components/Profissional/FormPrescricaoModal';
import ModalAcervo from '../../components/Profissional/ModalAcervo';

export default function DashboardProfissional() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert(); 

    const [turmas, setTurmas] = useState([]);
    const [utentesTotais, setUtentesTotais] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [alertas, setAlertas] = useState([]);

    const [modalAlvo, setModalAlvo] = useState(null); 
    const [modalAddAlunoAberto, setModalAddAlunoAberto] = useState(false); 
    const [modalAcervoAberto, setModalAcervoAberto] = useState(false);

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'profissional') navigate('/login');
        else carregarDados();
    }, [usuario, navigate]);

    const carregarDados = async () => {
        try {
            const [resTurmas, resAlertas, resUtentes] = await Promise.all([
                fetch('http://localhost:3001/api/turmas'),
                fetch('http://localhost:3001/api/alertas/pendentes'),
                fetch('http://localhost:3001/api/utentes')
            ]);
            
            if (resUtentes.ok) setUtentesTotais(await resUtentes.json());
            if (resAlertas.ok) setAlertas(await resAlertas.json());
            
            if (resTurmas.ok) {
                const dados = await resTurmas.json();
                setTurmas(dados);
                if (dados.length > 0 && !turmaSelecionada) setTurmaSelecionada(dados[0]);
                else if (turmaSelecionada) setTurmaSelecionada(dados.find(t => t.id === turmaSelecionada.id) || dados[0]);
            }
        } catch (err) { console.error(err); }
    };

    const handleCriarTurma = async (novaTurma) => {
        try {
            const res = await fetch('http://localhost:3001/api/turmas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novaTurma) });
            if (res.ok) { showAlert('Turma criada com sucesso!', 'sucesso'); carregarDados(); }
        } catch (err) { showAlert('Erro de comunicação.', 'erro'); }
    };

    const handleDeletarTurma = async (idTurma, nomeTurma) => {
        if (!await showConfirm(`Apagar a turma "${nomeTurma}"? Os alunos não serão apagados.`)) return;
        try {
            const res = await fetch(`http://localhost:3001/api/turmas/${idTurma}`, { method: 'DELETE' });
            if (res.ok) {
                if (turmaSelecionada?.id === idTurma) setTurmaSelecionada(null);
                showAlert('Turma apagada.', 'info');
                carregarDados();
            }
        } catch (err) { showAlert('Erro ao apagar turma.', 'erro'); }
    };

    const handleAdicionarAlunoTurma = async (idAluno) => {
        try {
            const res = await fetch(`http://localhost:3001/api/turmas/${turmaSelecionada.id}/alunos`, { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: idAluno }) 
            });
            if (res.ok) {
                showAlert('Aluno adicionado à turma!', 'sucesso');
                carregarDados();
            }
        } catch (err) { showAlert('Erro ao adicionar.', 'erro'); }
    };

    const handleRemoverAlunoTurma = async (idAluno, nomeAluno) => {
        if (!await showConfirm(`Remover ${nomeAluno} da turma ${turmaSelecionada.nome}?`)) return;
        try {
            const res = await fetch(`http://localhost:3001/api/turmas/${turmaSelecionada.id}/alunos/${idAluno}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Aluno removido da turma.', 'sucesso');
                carregarDados();
            }
        } catch (err) { showAlert('Erro ao remover aluno.', 'erro'); }
    };

    const resolverAlerta = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/alertas/${id}/resolver`, { method: 'PUT' });
            if (res.ok) { showAlert('Alerta resolvido!', 'sucesso'); carregarDados(); }
        } catch (err) { console.error(err); }
    };

    const utentesDisponiveis = utentesTotais.filter(u => !u.turmasIds?.includes(turmaSelecionada?.id));

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ marginBottom: '2rem', backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div><h1 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '2rem' }}>Olá, {usuario.nome}</h1><p style={{ margin: 0, color: '#1d4ed8', fontSize: '1.1rem' }}>Gestão de Turmas e Prescrição</p></div>
                <button onClick={() => setModalAcervoAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#059669', border: '2px solid #059669', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}><Library size={20} /> O Meu Acervo</button>
            </div>

            {alertas.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={22} /> Alertas ({alertas.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alertas.map(alerta => (
                            <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.85rem', borderRadius: '8px' }}>
                                <div><strong style={{ color: '#b91c1c' }}>{alerta.utenteNome}</strong><p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>{alerta.mensagem}</p></div>
                                <button onClick={() => resolverAlerta(alerta.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}><CheckCircle size={16} /> Feito</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CardsTurmas turmas={turmas} turmaSelecionada={turmaSelecionada} onSelecionarTurma={(t) => { setTurmaSelecionada(t); setAlunoSelecionado(null); }} onCriarTurma={handleCriarTurma} onDeletarTurma={handleDeletarTurma} />

            {turmaSelecionada && (
                <ListaAlunosTurma 
                    turma={turmaSelecionada} 
                    alunoSelecionado={alunoSelecionado} 
                    onSelecionarAluno={setAlunoSelecionado} 
                    onPrescreverTurma={() => setModalAlvo({ tipo: 'turma', dados: turmaSelecionada })} 
                    onRemoverAlunoDaTurma={handleRemoverAlunoTurma} 
                    onAbrirAdicionarAluno={() => setModalAddAlunoAberto(true)} 
                />
            )}

            {alunoSelecionado && (
                <FichaIndividualAluno 
                    aluno={alunoSelecionado} 
                    onAbrirPrescricaoIndividual={(nomeGrupo) => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado, grupoPreDefinido: typeof nomeGrupo === 'string' ? nomeGrupo : '' })} 
                    onAbrirAcervoParaAluno={() => setModalAcervoAberto({ tipo: 'paciente', dados: alunoSelecionado })} 
                    onEditarPrescricao={(treino) => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado, treinoEditando: treino })}
                />
            )}

            {modalAcervoAberto && <ModalAcervo alvoPrescricao={modalAcervoAberto} onClose={() => { setModalAcervoAberto(false); carregarDados(); }} />}
            
            {/* O SEGREDO ESTÁ AQUI: FORÇAR A ATUALIZAÇÃO DO ALUNO APÓS SALVAR */}
            {modalAlvo && (
                <FormPrescricaoModal 
                    alvo={modalAlvo} 
                    onClose={() => setModalAlvo(null)} 
                    onSucesso={() => {
                        carregarDados();
                        if (alunoSelecionado) {
                            setAlunoSelecionado({ ...alunoSelecionado });
                        }
                    }} 
                />
            )}
            
            {modalAddAlunoAberto && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>Adicionar Utente à Turma</h2>
                            <button onClick={() => setModalAddAlunoAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>
                        <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.95rem' }}>Estes utentes não estão na turma <strong>{turmaSelecionada.nome}</strong>. Se os adicionar, eles farão parte de múltiplas turmas em simultâneo.</p>
                        
                        <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                            {utentesDisponiveis.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>Não há outros utentes disponíveis no sistema.</p>
                            ) : (
                                utentesDisponiveis.map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                                        <div>
                                            <strong style={{ display: 'block', color: '#1e293b', fontSize: '1rem' }}>{u.nome}</strong>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {u.turmasIds?.length > 0 ? `Inscrito em ${u.turmasIds.length} turma(s)` : 'Sem nenhuma turma'}
                                            </span>
                                        </div>
                                        <button onClick={() => handleAdicionarAlunoTurma(u.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            <UserPlus size={16} /> Adicionar
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}