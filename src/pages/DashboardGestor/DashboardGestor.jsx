// src/pages/DashboardGestor/DashboardGestor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { 
    BarChart3, Users, Activity, AlertTriangle, 
    LogOut, UserPlus, Phone, Briefcase, Trash2, X, Stethoscope, BadgeInfo, FileText,
    Search, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { API_URL } from '../../config';
import { formatarTelefone } from '../../utils/formatadores';

export default function DashboardGestor() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert();

    const [estatisticas, setEstatisticas] = useState({ idosos: 0, treinos: 0, alertas: 0 });
    const [profissionais, setProfissionais] = useState([]);
    
    // Controles de Pesquisa e Paginação
    const [busca, setBusca] = useState('');
    const [pagina, setPagina] = useState(1);
    const profissionaisPorPagina = 6;

    // Controles do Modal de Novo Profissional
    const [modalAberto, setModalAberto] = useState(false);
    const [carregandoForm, setCarregandoForm] = useState(false);
    const [form, setForm] = useState({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'gestor') {
            navigate('/login');
        } else {
            carregarEstatisticas();
            carregarEquipe();
        }
    }, [usuario, navigate]);

    // Reseta a página para a 1 sempre que o usuário digitar algo na pesquisa
    useEffect(() => {
        setPagina(1);
    }, [busca]);

    // ==========================================
    // CARREGAR DADOS
    // ==========================================
    const carregarEstatisticas = async () => {
        try {
            const resposta = await fetch(`${API_URL}/api/estatisticas`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setEstatisticas(dados);
            }
        } catch (erro) {
            console.error("Erro ao carregar estatísticas:", erro);
        }
    };

    const carregarEquipe = async () => {
        try {
            const res = await fetch(`${API_URL}/api/profissionais`);
            if (res.ok) setProfissionais(await res.json());
        } catch (error) { 
            console.error(error); 
        }
    };

    // ==========================================
    // FILTRAGEM E PAGINAÇÃO
    // ==========================================
    const profissionaisFiltrados = profissionais.filter(prof => {
        const termo = busca.toLowerCase();
        return (
            (prof.nome && prof.nome.toLowerCase().includes(termo)) ||
            (prof.especialidade && prof.especialidade.toLowerCase().includes(termo)) ||
            (prof.registroProfissional && prof.registroProfissional.toLowerCase().includes(termo))
        );
    });

    const totalPaginas = Math.ceil(profissionaisFiltrados.length / profissionaisPorPagina) || 1;
    
    // Proteção: caso a pesquisa diminua o número de páginas e o gestor estivesse numa página alta
    if (pagina > totalPaginas) {
        setPagina(totalPaginas);
    }
    
    const indexInicial = (pagina - 1) * profissionaisPorPagina;
    const profissionaisPaginados = profissionaisFiltrados.slice(indexInicial, indexInicial + profissionaisPorPagina);
    const paginasNumeros = Array.from({ length: totalPaginas }, (_, i) => i + 1);

    // ==========================================
    // AÇÕES DE GESTÃO DA EQUIPA
    // ==========================================
    const criarProfissional = async (e) => {
        e.preventDefault();
        setCarregandoForm(true);
        try {
            const res = await fetch(`${API_URL}/api/profissionais`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
            });

            if (res.ok) {
                showAlert('Profissional adicionado à clínica com sucesso!', 'sucesso');
                setModalAberto(false);
                setForm({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });
                carregarEquipe();
            } else {
                const erro = await res.json();
                showAlert(erro.erro || 'Falha ao registrar profissional.', 'erro');
            }
        } catch (error) { 
            showAlert('Erro de conexão ao servidor.', 'erro'); 
        } finally { 
            setCarregandoForm(false); 
        }
    };

    const removerProfissional = async (id, nome) => {
        if (!await showConfirm(`Tem certeza que deseja revogar o acesso de ${nome}?`)) return;
        
        try {
            const res = await fetch(`${API_URL}/api/profissionais/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Profissional removido com sucesso!', 'sucesso');
                carregarEquipe();
            } else {
                showAlert('Erro ao remover profissional.', 'erro');
            }
        } catch (error) { 
            console.error(error); 
            showAlert('Erro de conexão.', 'erro');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!usuario) return null;

    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', backgroundColor: '#f5f3ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd6fe', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.25rem 0', color: '#4c1d95', fontSize: '2rem' }}>Olá, {usuario.nome}</h1>
                    <p style={{ margin: 0, color: '#6d28d9', fontSize: '1.1rem', fontWeight: '500' }}>Painel de Direção e Gestão da Instituição</p>
                </div>
            </div>

            {/* SEÇÃO 1: MÉTRICAS GERAIS */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>
                    <BarChart3 size={24} color="#7c3aed" /> Visão Geral do Sistema
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={36} color="#3b82f6" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'uppercase' }}>Utentes Ativos</p>
                            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{estatisticas.idosos}</h3>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '50%' }}>
                            <Activity size={36} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'uppercase' }}>Exercícios Concluídos</p>
                            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{estatisticas.treinos}</h3>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '50%' }}>
                            <AlertTriangle size={36} color="#ef4444" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'uppercase' }}>Histórico de Alertas</p>
                            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{estatisticas.alertas}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: GESTÃO DO CORPO CLÍNICO */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', margin: 0, fontSize: '1.4rem' }}>
                        <Stethoscope size={24} color="#059669" /> Corpo Clínico & Instrutores
                    </h2>
                    <button 
                        onClick={() => setModalAberto(true)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                    >
                        <UserPlus size={20} /> Registrar Profissional
                    </button>
                </div>

                {/* BARRA DE PESQUISA */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar profissional por nome, especialidade ou número de registro..." 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>
                </div>

                {profissionais.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Nenhum profissional cadastrado na clínica.</p>
                    </div>
                ) : profissionaisPaginados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>A pesquisa não retornou nenhum profissional.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {profissionaisPaginados.map((prof) => (
                                <div key={prof.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800', flexShrink: 0 }}>
                                                {prof.nome.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: '#1f2937' }}>{prof.nome}</h3>
                                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                                                    {prof.especialidade || 'Fisioterapeuta'} {prof.registroProfissional ? `| ${prof.registroProfissional}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {prof.biografia && (
                                            <div style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', borderLeft: '3px solid #059669', lineHeight: '1.4' }}>
                                                "{prof.biografia}"
                                            </div>
                                        )}

                                        <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '1rem 0', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem', color: '#4b5563' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Briefcase size={16} color="#059669" /> <span>Conta Ativa no Sistema</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} color="#6b7280" /> <span>{prof.celular}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => removerProfissional(prof.id, prof.nome)}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#ef4444', transition: 'all 0.2s' }}
                                    >
                                        <Trash2 size={18} /> Revogar Acesso
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* CONTROLES DE PAGINAÇÃO NUMÉRICA */}
                        {totalPaginas > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                                <button 
                                    onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                                    disabled={pagina === 1}
                                    style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === 1 ? '#f8fafc' : 'white', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronLeft size={20} color={pagina === 1 ? '#94a3b8' : '#334155'} />
                                </button>
                                
                                {paginasNumeros.map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setPagina(num)}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: pagina === num ? '#059669' : 'white',
                                            color: pagina === num ? 'white' : '#334155',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                                
                                <button 
                                    onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                                    disabled={pagina === totalPaginas}
                                    style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === totalPaginas ? '#f8fafc' : 'white', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronRight size={20} color={pagina === totalPaginas ? '#94a3b8' : '#334155'} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL DE CRIAÇÃO DE PROFISSIONAL */}
            {modalAberto && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '650px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Stethoscope size={24} color="#059669" /> Registrar Novo Profissional
                                </h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Crie o acesso para um fisioterapeuta na sua clínica.</p>
                            </div>
                            <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={criarProfissional} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>Nome Completo *</label>
                                    <input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Dra. Marta Sousa" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>Especialidade *</label>
                                    <input type="text" value={form.especialidade} onChange={e => setForm({...form, especialidade: e.target.value})} placeholder="Ex: Fisioterapia Geriátrica" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>
                                    <BadgeInfo size={16} color="#059669"/> Registro (CREFITO) *
                                </label>
                                <input type="text" value={form.registroProfissional} onChange={e => setForm({...form, registroProfissional: e.target.value})} placeholder="Ex: CREFITO-3/123456-F" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>
                                    <FileText size={16} color="#059669"/> Biografia / Resumo Profissional *
                                </label>
                                <textarea value={form.biografia} onChange={e => setForm({...form, biografia: e.target.value})} placeholder="Escreva uma breve apresentação que o paciente irá ler..." required rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Credenciais de Acesso</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>Celular (Usado no Login) *</label>
                                        <input type="tel" inputMode="numeric" value={form.celular} onChange={(e) => setForm({ ...form, celular: formatarTelefone(e.target.value) })} placeholder="(00) 00000-0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#334155' }}>PIN Inicial (4 Dígitos) *</label>
                                        <input type="password" inputMode="numeric" maxLength="4" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="****" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '0.2rem' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={carregandoForm} style={{ padding: '0.85rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                                    {carregandoForm ? 'Registrando...' : 'Criar Acesso ao Sistema'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}