// src/pages/DashboardProfissional/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { Users, Bell, Library } from 'lucide-react';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { API_URL } from '../../config';

// Subcomponentes modulares
import AbaTurmas from '../../components/Profissional/AbaTurmas';
import AbaAlertas from '../../components/Profissional/AbaAlertas';
import AbaAcervo from '../../components/Profissional/AbaAcervo';
import ModalAdicionarAluno from '../../components/Profissional/ModalAdicionarAluno';
import FormPrescricaoModal from '../../components/Profissional/FormPrescricaoModal';
import ModalAcervo from '../../components/Profissional/ModalAcervo';

export default function DashboardProfissional() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert(); 

    const [abaAtiva, setAbaAtiva] = useState('turmas');

    const [turmas, setTurmas] = useState([]);
    const [utentesTotais, setUtentesTotais] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [alertas, setAlertas] = useState([]);
    const [acervo, setAcervo] = useState([]);

    const [modalAlvo, setModalAlvo] = useState(null); 
    const [modalAddAlunoAberto, setModalAddAlunoAberto] = useState(false); 
    const [modalAcervoParaPaciente, setModalAcervoParaPaciente] = useState(null);

    // ==========================================
    // INICIALIZAÇÃO E POLLING DOS ALERTAS
    // ==========================================
    useEffect(() => {
        if (!usuario || usuario.tipo !== 'profissional') {
            navigate('/login');
        } else {
            carregarDadosGerais();
            carregarAlertas(false);

            // POLLING: Verifica novos alertas SOS a cada 5 segundos
            const intervaloDeVerificacao = setInterval(() => {
                carregarAlertas(true); // true = modo silencioso em background
            }, 5000);

            return () => clearInterval(intervaloDeVerificacao);
        }
    }, [usuario, navigate]);

    // ==========================================
    // FUNÇÕES DE CARREGAMENTO
    // ==========================================
    const carregarDadosGerais = async () => {
        try {
            const [resTurmas, resUsuarios, resAcervo] = await Promise.all([
                fetch(`${API_URL}/api/turmas`), 
                fetch(`${API_URL}/api/usuarios`), // <-- Busca a lista geral de usuários
                fetch(`${API_URL}/api/acervo/${usuario.id}`)
            ]);
            
            if (resUsuarios.ok) {
                const todosUsuarios = await resUsuarios.json();
                // Filtra os usuários para mostrar apenas pacientes no modal de adicionar à turma
                const apenasPacientes = todosUsuarios.filter(u => u.tipo === 'idoso' || !u.tipo || u.tipo === 'paciente');
                setUtentesTotais(apenasPacientes); 
            }

            if (resAcervo.ok) setAcervo(await resAcervo.json());
            
            if (resTurmas.ok) {
                const dados = await resTurmas.json();
                setTurmas(dados);
                if (dados.length > 0 && !turmaSelecionada) {
                    setTurmaSelecionada(dados[0]);
                } else if (turmaSelecionada) {
                    setTurmaSelecionada(dados.find(t => t.id === turmaSelecionada.id) || dados[0]);
                }
            }
        } catch (err) { 
            console.error("Erro ao carregar dados gerais:", err); 
        }
    };

    const carregarAlertas = async (isVerificacaoEmBackground = false) => {
        try {
            const resAlertas = await fetch(`${API_URL}/api/alertas/pendentes`);
            if (resAlertas.ok) {
                const pendentes = await resAlertas.json();
                
                // ATUALIZAÇÃO SEGURA: Compara novos alertas com os antigos para disparar o Pop-up
                setAlertas(alertasAntigos => {
                    if (isVerificacaoEmBackground) {
                        const novosSos = pendentes.filter(p => p.tipo === 'sos' && !alertasAntigos.some(antigo => antigo.id === p.id));
                        
                        if (novosSos.length > 0) {
                            novosSos.forEach(sos => {
                                // DISPARA O POP-UP GIGANTE E AVISA O INSTRUTOR
                                showConfirm(`🚨 EMERGÊNCIA SOS ACIONADA! 🚨\n\nO paciente ${sos.utenteNome || 'Desconhecido'} acabou de pedir ajuda urgente durante o treino "${sos.treino}".\n\nVá até ele imediatamente!`);
                            });
                            // Muda automaticamente para a aba de alertas para o instrutor ver detalhes
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
    // AÇÕES DE TURMA E ALUNOS
    // ==========================================
    const handleCriarTurma = async (novaTurma) => {
        try {
            const payload = { ...novaTurma, profissionalId: usuario.id }; 
            const res = await fetch(`${API_URL}/api/turmas`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            if (res.ok) { 
                showAlert('Turma criada com sucesso!', 'sucesso'); 
                carregarDadosGerais(); 
            }
        } catch (err) { showAlert('Erro de comunicação.', 'erro'); }
    };

    const handleDeletarTurma = async (idTurma, nomeTurma) => {
        if (!await showConfirm(`Apagar a turma "${nomeTurma}"? Os alunos não serão apagados.`)) return;
        try {
            const res = await fetch(`${API_URL}/api/turmas/${idTurma}`, { method: 'DELETE' }); 
            if (res.ok) {
                if (turmaSelecionada?.id === idTurma) setTurmaSelecionada(null);
                showAlert('Turma apagada.', 'info');
                carregarDadosGerais();
            }
        } catch (err) { showAlert('Erro ao apagar turma.', 'erro'); }
    };

    const handleAdicionarAlunoTurma = async (idAluno) => {
        try {
            const res = await fetch(`${API_URL}/api/turmas/${turmaSelecionada.id}/alunos`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ usuarioId: idAluno }) 
            });
            if (res.ok) {
                showAlert('Paciente adicionado à turma!', 'sucesso');
                setModalAddAlunoAberto(false);
                carregarDadosGerais();
            }
        } catch (err) { showAlert('Erro ao adicionar.', 'erro'); }
    };

    const handleRemoverAlunoTurma = async (idAluno, nomeAluno) => {
        if (!await showConfirm(`Remover ${nomeAluno} da turma ${turmaSelecionada.nome}?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/turmas/${turmaSelecionada.id}/alunos/${idAluno}`, { method: 'DELETE' }); 
            if (res.ok) {
                showAlert('Paciente removido da turma.', 'sucesso');
                carregarDadosGerais();
            }
        } catch (err) { showAlert('Erro ao remover paciente.', 'erro'); }
    };

    // ==========================================
    // AÇÕES DE ALERTAS E ACERVO
    // ==========================================
    const resolverAlerta = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/alertas/${id}/resolver`, { method: 'PUT' }); 
            if (res.ok) { 
                showAlert('Alerta resolvido!', 'sucesso'); 
                carregarAlertas(); 
            }
        } catch (err) { console.error(err); }
    };

    const deletarItemAcervo = async (id) => {
        if (!await showConfirm("Remover este exercício do acervo?")) return;
        try {
            const res = await fetch(`${API_URL}/api/acervo/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Removido do acervo.', 'sucesso');
                carregarDadosGerais();
            }
        } catch (error) { showAlert('Erro ao remover.', 'erro'); }
    };

    const utentesDisponiveis = utentesTotais.filter(u => !u.turmasIds?.includes(turmaSelecionada?.id));

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO */}
            <header style={{ marginBottom: '1.5rem', backgroundColor: '#eff6ff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.75rem' }}>Olá, {usuario.nome}</h1>
                </div>
            </header>

            {/* ABAS DE NAVEGAÇÃO */}
            <nav style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setAbaAtiva('turmas')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1.5rem', border: 'none', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '1rem',
                        backgroundColor: abaAtiva === 'turmas' ? '#2563eb' : '#f8fafc',
                        color: abaAtiva === 'turmas' ? 'white' : '#475569',
                        transition: 'all 0.15s ease'
                    }}
                >
                    <Users size={18} /> Gestão de Turmas & Alunos
                </button>

                <button
                    onClick={() => setAbaAtiva('alertas')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1.5rem', border: 'none', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '1rem',
                        backgroundColor: abaAtiva === 'alertas' ? '#dc2626' : '#f8fafc',
                        color: abaAtiva === 'alertas' ? 'white' : '#475569',
                        transition: 'all 0.15s ease'
                    }}
                >
                    <Bell size={18} /> Alertas de Pacientes
                    {alertas.length > 0 && (
                        <span style={{ backgroundColor: abaAtiva === 'alertas' ? 'white' : '#dc2626', color: abaAtiva === 'alertas' ? '#dc2626' : 'white', fontSize: '0.75rem', padding: '0.15rem 0.5rem', fontWeight: 'bold', borderRadius: '4px' }}>
                            {alertas.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setAbaAtiva('acervo')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1.5rem', border: 'none', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '1rem',
                        backgroundColor: abaAtiva === 'acervo' ? '#059669' : '#f8fafc',
                        color: abaAtiva === 'acervo' ? 'white' : '#475569',
                        transition: 'all 0.15s ease'
                    }}
                >
                    <Library size={18} /> Banco de Exercícios (Acervo)
                </button>
            </nav>

            {/* ABA 1: TURMAS E ALUNOS */}
            {abaAtiva === 'turmas' && (
                <AbaTurmas 
                    turmas={turmas}
                    turmaSelecionada={turmaSelecionada}
                    onSelecionarTurma={(t) => { setTurmaSelecionada(t); setAlunoSelecionado(null); }}
                    onCriarTurma={handleCriarTurma}
                    onDeletarTurma={handleDeletarTurma}
                    alunoSelecionado={alunoSelecionado}
                    onSelecionarAluno={setAlunoSelecionado}
                    onPrescreverTurma={() => setModalAlvo({ tipo: 'turma', dados: turmaSelecionada })}
                    onRemoverAlunoDaTurma={handleRemoverAlunoTurma}
                    onAbrirAdicionarAluno={() => setModalAddAlunoAberto(true)}
                    onAbrirPrescricaoIndividual={(nomeGrupo) => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado, grupoPreDefinido: typeof nomeGrupo === 'string' ? nomeGrupo : '' })}
                    onAbrirAcervoParaAluno={() => setModalAcervoParaPaciente({ tipo: 'paciente', dados: alunoSelecionado })}
                    onEditarPrescricao={(treino) => setModalAlvo({ tipo: 'paciente', dados: alunoSelecionado, treinoEditando: treino })}
                />
            )}

            {/* ABA 2: ALERTAS */}
            {abaAtiva === 'alertas' && (
                <AbaAlertas 
                    alertas={alertas} 
                    onResolverAlerta={resolverAlerta} 
                />
            )}

            {/* ABA 3: ACERVO */}
            {abaAtiva === 'acervo' && (
                <AbaAcervo 
                    acervo={acervo}
                    onNovoExercicio={(nomeGrupo, cor) => setModalAlvo({ tipo: 'acervo', dados: { nome: 'Meu Acervo' }, grupoPreDefinido: nomeGrupo, corPreDefinida: cor })}
                    onEditarExercicio={(treino, nomeGrupo) => setModalAlvo({ tipo: 'acervo', dados: { nome: 'Meu Acervo' }, grupoPreDefinido: nomeGrupo, treinoEditando: treino })}
                    onDeletarItem={deletarItemAcervo}
                />
            )}

            {/* MODAIS GLOBAIS DO PROFISSIONAL */}
            <ModalAdicionarAluno 
                isOpen={modalAddAlunoAberto}
                onClose={() => setModalAddAlunoAberto(false)}
                turma={turmaSelecionada}
                utentesDisponiveis={utentesDisponiveis}
                onAdicionarAluno={handleAdicionarAlunoTurma}
            />

            {modalAcervoParaPaciente && (
                <ModalAcervo 
                    alvoPrescricao={modalAcervoParaPaciente} 
                    onClose={() => { 
                        setModalAcervoParaPaciente(null); 
                        carregarDadosGerais(); 
                    }} 
                />
            )}
            
            {modalAlvo && (
                <FormPrescricaoModal 
                    alvo={modalAlvo} 
                    onClose={() => setModalAlvo(null)} 
                    onSucesso={() => {
                        carregarDadosGerais();
                        if (alunoSelecionado) {
                            setAlunoSelecionado({ ...alunoSelecionado });
                        }
                    }} 
                />
            )}
        </div>
    );
}