// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bell, Library } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { API_URL } from '../../config';

// Componentes das 3 Abas
import AbaTurmas from '../../components/Profissional/AbaTurmas';
import AbaAlertas from '../../components/Profissional/AbaAlertas';
import AbaAcervo from '../../components/Profissional/AbaAcervo';

// Modais
import ModalAdicionarAluno from '../../components/Profissional/ModalAdicionarAluno';
import FormPrescricaoModal from '../../components/Profissional/FormPrescricaoModal';

export default function DashboardProfissional() {
    const auth = useAuthStore();
    const usuario = auth?.usuario || auth?.user;
    
    const navigate = useNavigate();
    const { showConfirm, showAlert } = useAlert();

    const [abaAtiva, setAbaAtiva] = useState('gestao');

    const [turmas, setTurmas] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [modalAddAlunoAberto, setModalAddAlunoAberto] = useState(false);
    const [alertas, setAlertas] = useState([]);
    const [acervo, setAcervo] = useState([]);
    const [modalPrescricaoAberto, setModalPrescricaoAberto] = useState(false);
    const [alvoPrescricao, setAlvoPrescricao] = useState(null);

    // ==========================================
    // SISTEMA EM TEMPO REAL (POLLING)
    // ==========================================
    useEffect(() => {
        if (usuario?.id) {
            carregarTurmas();
            carregarAlertas();
            carregarAcervo();

            // A cada 5 segundos, verifica silenciosamente se há novos alertas de SOS
            const intervaloDeVerificacao = setInterval(() => {
                carregarAlertas(true); // true = modo silencioso (pesquisa em background)
            }, 5000);

            return () => clearInterval(intervaloDeVerificacao);
        }
    }, [usuario?.id]);

    const carregarAlertas = async (isVerificacaoEmBackground = false) => {
        try {
            const [resAlertas, resUsers] = await Promise.all([
                fetch(`${API_URL}/api/alertas`),
                fetch(`${API_URL}/api/usuarios`).catch(() => fetch(`${API_URL}/api/users`)).catch(() => null)
            ]);

            let mapaUsuarios = {};
            if (resUsers && resUsers.ok) {
                const listaUsers = await resUsers.json();
                (listaUsers || []).forEach(u => { mapaUsuarios[u.id] = { nome: u.nome, celular: u.celular }; });
            }

            if (resAlertas.ok) {
                const dados = await resAlertas.json();
                const pendentes = (dados || [])
                    .filter(a => a.resolvido === 0 || !a.resolvido)
                    .map(a => ({
                        ...a,
                        utenteNome: a.utenteNome || a.usuario?.nome || mapaUsuarios[a.usuarioId]?.nome || 'Paciente',
                        utenteTel: a.utenteTel || a.usuario?.celular || mapaUsuarios[a.usuarioId]?.celular || ''
                    }));
                
                // ATUALIZAÇÃO SEGURA: Compara os alertas que chegaram agora com os que já estavam na tela
                setAlertas(alertasAntigos => {
                    if (isVerificacaoEmBackground) {
                        // Descobre se existe algum SOS novo que não estava na lista anterior
                        const novosSos = pendentes.filter(p => p.tipo === 'sos' && !alertasAntigos.some(antigo => antigo.id === p.id));
                        
                        if (novosSos.length > 0) {
                            novosSos.forEach(sos => {
                                // DISPARA O POPUP GIGANTE NA TELA DO INSTRUTOR!
                                showConfirm(`🚨 EMERGÊNCIA SOS ACIONADA! 🚨\n\nO paciente ${sos.utenteNome} acabou de pedir ajuda urgente durante o treino "${sos.treino}".\n\nVá até ele imediatamente!`);
                            });
                            // Muda automaticamente para a aba de alertas para o profissional ver os detalhes
                            setAbaAtiva('alertas');
                        }
                    }
                    return pendentes;
                });
            }
        } catch (err) {
            console.error("Erro ao carregar alertas:", err);
        }
    };

    // ==========================================
    // OUTRAS FUNÇÕES DE CARREGAMENTO
    // ==========================================
    const carregarTurmas = async () => {
        try {
            const res = await fetch(`${API_URL}/api/turmas`);
            if (res.ok) {
                const dados = await res.json();
                const minhasTurmas = (dados || []).filter(t => !t.profissionalId || t.profissionalId === usuario?.id);
                setTurmas(minhasTurmas);
                if (turmaSelecionada) {
                    const atualizada = minhasTurmas.find(t => t.id === turmaSelecionada.id);
                    setTurmaSelecionada(atualizada || null);
                }
            }
        } catch (err) { console.error(err); }
    };

    const carregarAcervo = async () => {
        if (!usuario?.id) return;
        try {
            const res = await fetch(`${API_URL}/api/acervo/${usuario.id}`);
            if (res.ok) setAcervo(await res.json());
        } catch (err) { console.error(err); }
    };

    // ==========================================
    // AÇÕES RESTANTES (MANTIDAS INTACTAS)
    // ==========================================
    const handleCriarTurma = async (dadosTurma) => {
        try {
            const res = await fetch(`${API_URL}/api/turmas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dadosTurma, profissionalId: usuario?.id }) });
            if (res.ok) { showAlert('Turma criada com sucesso!', 'sucesso'); carregarTurmas(); }
        } catch (err) { showAlert('Erro ao criar turma.', 'erro'); }
    };

    const handleDeletarTurma = async (id, nome) => {
        if (!await showConfirm(`Excluir a turma "${nome}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/turmas/${id}`, { method: 'DELETE' });
            if (res.ok) { showAlert('Turma removida!', 'sucesso'); if (turmaSelecionada?.id === id) setTurmaSelecionada(null); carregarTurmas(); }
        } catch (err) { showAlert('Erro ao excluir turma.', 'erro'); }
    };

    const handleRemoverAlunoDaTurma = async (turmaId, usuarioId) => {
        if (!await showConfirm('Remover este aluno da turma?')) return;
        try {
            const res = await fetch(`${API_URL}/api/turmas/${turmaId}/alunos/${usuarioId}`, { method: 'DELETE' });
            if (res.ok) { showAlert('Aluno removido da turma!', 'sucesso'); carregarTurmas(); }
        } catch (err) { showAlert('Erro ao remover aluno.', 'erro'); }
    };

    const handleResolverAlerta = async (id) => {
        if (!await showConfirm('Marcar esta ocorrência como resolvida?')) return;
        try {
            const res = await fetch(`${API_URL}/api/alertas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolvido: 1 }) });
            if (res.ok) { setAlertas(prev => prev.filter(a => a.id !== id)); showAlert('Alerta resolvido!', 'sucesso'); }
        } catch (err) { showAlert('Erro ao resolver alerta.', 'erro'); }
    };

    const handleNovoExercicioAcervo = (grupo, cor) => { setAlvoPrescricao({ tipo: 'acervo', grupo, cor }); setModalPrescricaoAberto(true); };
    const handleEditarExercicioAcervo = (treino, grupo) => { setAlvoPrescricao({ tipo: 'acervo', grupo, treinoEditando: treino }); setModalPrescricaoAberto(true); };
    const handleDeletarItemAcervo = async (id) => {
        if (!await showConfirm('Excluir este exercício do acervo?')) return;
        try {
            const res = await fetch(`${API_URL}/api/acervo/${id}`, { method: 'DELETE' });
            if (res.ok) { setAcervo(prev => prev.filter(item => item.id !== id)); showAlert('Exercício removido do acervo!', 'sucesso'); }
        } catch (err) { showAlert('Erro ao remover.', 'erro'); }
    };

    const handlePrescreverTurma = (turma) => { setAlvoPrescricao({ tipo: 'turma', turma }); setModalPrescricaoAberto(true); };
    const handleAbrirPrescricaoIndividual = (grupo) => { setAlvoPrescricao({ tipo: 'aluno', aluno: alunoSelecionado, grupo }); setModalPrescricaoAberto(true); };
    const handleEditarPrescricao = (prescricao) => { setAlvoPrescricao({ tipo: 'aluno', aluno: alunoSelecionado, treinoEditando: prescricao }); setModalPrescricaoAberto(true); };

    if (!usuario) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}><p>A carregar dados da sessão...</p></div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1250px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: '#0369a1', fontSize: '2rem' }}>Olá, {usuario.nome}</h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setAbaAtiva('gestao')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', backgroundColor: abaAtiva === 'gestao' ? '#ffffff' : '#f8fafc', color: abaAtiva === 'gestao' ? '#0f172a' : '#64748b', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', borderBottom: abaAtiva === 'gestao' ? '3px solid #2563eb' : 'none', boxShadow: abaAtiva === 'gestao' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
                >
                    <Users size={20} /> Gestão de Turmas & Alunos
                </button>
                
                <button 
                    onClick={() => setAbaAtiva('alertas')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', backgroundColor: abaAtiva === 'alertas' ? '#dc2626' : '#f8fafc', color: abaAtiva === 'alertas' ? '#ffffff' : '#64748b', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}
                >
                    <Bell size={20} /> Alertas de Pacientes
                    {alertas.length > 0 && (
                        <span style={{ backgroundColor: abaAtiva === 'alertas' ? '#ffffff' : '#dc2626', color: abaAtiva === 'alertas' ? '#dc2626' : '#ffffff', padding: '0.1rem 0.55rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {alertas.length}
                        </span>
                    )}
                </button>

                <button 
                    onClick={() => setAbaAtiva('acervo')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', backgroundColor: abaAtiva === 'acervo' ? '#059669' : '#f8fafc', color: abaAtiva === 'acervo' ? '#ffffff' : '#64748b', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}
                >
                    <Library size={20} /> Banco de Exercícios (Acervo)
                </button>
            </div>

            {abaAtiva === 'gestao' && (
                <AbaTurmas 
                    turmas={turmas} turmaSelecionada={turmaSelecionada} onSelecionarTurma={(t) => setTurmaSelecionada(t)}
                    onCriarTurma={handleCriarTurma} onDeletarTurma={handleDeletarTurma} alunoSelecionado={alunoSelecionado}
                    onSelecionarAluno={(a) => setAlunoSelecionado(a)} onPrescreverTurma={handlePrescreverTurma}
                    onRemoverAlunoDaTurma={handleRemoverAlunoDaTurma} onAbrirAdicionarAluno={() => setModalAddAlunoAberto(true)}
                    onAbrirPrescricaoIndividual={handleAbrirPrescricaoIndividual} onAbrirAcervoParaAluno={() => setAbaAtiva('acervo')}
                    onEditarPrescricao={handleEditarPrescricao}
                />
            )}

            {abaAtiva === 'alertas' && (
                <AbaAlertas alertas={alertas} onResolverAlerta={handleResolverAlerta} />
            )}

            {abaAtiva === 'acervo' && (
                <AbaAcervo 
                    acervo={acervo} onNovoExercicio={handleNovoExercicioAcervo}
                    onEditarExercicio={handleEditarExercicioAcervo} onDeletarItem={handleDeletarItemAcervo}
                />
            )}

            {modalAddAlunoAberto && turmaSelecionada && (
                <ModalAdicionarAluno turma={turmaSelecionada} onClose={() => setModalAddAlunoAberto(false)} onSucesso={() => { setModalAddAlunoAberto(false); carregarTurmas(); }} />
            )}

            {modalPrescricaoAberto && (
                <FormPrescricaoModal alvo={alvoPrescricao} onClose={() => { setModalPrescricaoAberto(false); setAlvoPrescricao(null); }} onSucesso={() => { setModalPrescricaoAberto(false); setAlvoPrescricao(null); carregarTurmas(); carregarAcervo(); }} />
            )}
        </div>
    );
}