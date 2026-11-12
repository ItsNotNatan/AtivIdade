// src/pages/DashboardGestor/DashboardGestor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { BarChart3, Users, Activity, AlertTriangle, Stethoscope, UserPlus, Trash2, X, FileText, BadgeInfo, Phone } from 'lucide-react';
import { API_URL } from '../../config';
import { formatarTelefone } from '../../utils/formatadores';

const especialidadesOpcoes = [
    "Fisioterapia Acupuntura",
    "Fisioterapia Aquática (Hidroterapia)",
    "Fisioterapia Cardiovascular",
    "Fisioterapia Dermatofuncional (focada em estética, queimaduras e cicatrização)",
    "Fisioterapia do Trabalho (ergonomia e saúde ocupacional)",
    "Fisioterapia em Gerontologia (saúde do idoso)",
    "Fisioterapia em Oncologia (reabilitação de pacientes com câncer)",
    "Fisioterapia em Osteopatia",
    "Fisioterapia em Quiropraxia",
    "Fisioterapia em Saúde da Mulher (inclui uroginecológica e obstétrica)",
    "Fisioterapia em Terapia Intensiva (UTI)",
    "Fisioterapia Esportiva",
    "Fisioterapia Neurofuncional (adulto e pediátrica)",
    "Fisioterapia Ortopédica e Traumatológica",
    "Fisioterapia Pediátrica e Neonatal",
    "Fisioterapia Respiratória"
];

export default function DashboardGestor() {
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert();

    const [estatisticas, setEstatisticas] = useState({ idosos: 0, treinos: 0, alertas: 0, profissionais: 0 });
    const [profissionais, setProfissionais] = useState([]);
    
    const [modalAberto, setModalAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const [form, setForm] = useState({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });

    useEffect(() => {
        if (!usuario || usuario.tipo !== 'gestor') {
            navigate('/login');
        } else {
            carregarDadosGerais();
        }
    }, [usuario, navigate]);

    const carregarDadosGerais = async () => {
        try {
            const [resEst, resProf] = await Promise.all([
                fetch(`${API_URL}/api/estatisticas`),
                fetch(`${API_URL}/api/profissionais`)
            ]);
            
            if (resEst.ok) setEstatisticas(await resEst.json());
            if (resProf.ok) setProfissionais(await resProf.json());
            
        } catch (erro) {
            console.error("Erro ao carregar dados do gestor:", erro);
        }
    };

    const criarProfissional = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/api/profissionais`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
            });

            if (res.ok) {
                showAlert('Profissional cadastrado e com acesso liberado!', 'sucesso');
                setModalAberto(false);
                setForm({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });
                carregarDadosGerais();
            } else {
                const erro = await res.json();
                showAlert(erro.erro || 'Falha ao registrar profissional.', 'erro');
            }
        } catch (error) { 
            showAlert('Erro de conexão ao servidor.', 'erro'); 
        } finally { 
            setCarregando(false); 
        }
    };

    const removerProfissional = async (id, nome) => {
        if (!await showConfirm(`Tem certeza que deseja remover o acesso de ${nome} ao sistema?`)) return;
        
        try {
            const res = await fetch(`${API_URL}/api/profissionais/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Acesso revogado com sucesso.', 'sucesso');
                carregarDadosGerais();
            }
        } catch (error) { console.error(error); }
    };

    if (!usuario) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO */}
            <header style={{ marginBottom: '2.5rem', backgroundColor: '#eff6ff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.75rem' }}>Olá, {usuario.nome}</h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1d4ed8', fontSize: '0.95rem' }}>Painel de Gestão da Instituição</p>
                </div>
            </header>

            {/* SEÇÃO 1: VISÃO GERAL (KPIs) */}
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1.5rem' }}>
                <BarChart3 size={28} color="#2563eb" /> Visão Geral do Sistema
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Users size={40} color="#3b82f6" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.25rem 0', color: '#64748b', fontSize: '1rem' }}>Pacientes Ativos</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.idosos}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Stethoscope size={40} color="#059669" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.25rem 0', color: '#64748b', fontSize: '1rem' }}>Fisioterapeutas</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{profissionais.length}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Activity size={40} color="#10b981" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.25rem 0', color: '#64748b', fontSize: '1rem' }}>Exercícios Concluídos</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.treinos}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto' }} />
                    <h3 style={{ margin: '1rem 0 0.25rem 0', color: '#64748b', fontSize: '1rem' }}>Histórico de SOS</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.alertas}</p>
                </div>
            </div>

            {/* SEÇÃO 2: GESTÃO DA EQUIPE CLÍNICA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <Stethoscope size={28} color="#059669" /> Corpo Clínico
                </h2>
                <button 
                    onClick={() => setModalAberto(true)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <UserPlus size={18} /> Cadastrar Fisioterapeuta
                </button>
            </div>

            {/* LISTAGEM DOS PROFISSIONAIS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {profissionais.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhum profissional cadastrado na clínica. Adicione o primeiro!</p>
                    </div>
                ) : (
                    profissionais.map((prof) => (
                        <div key={prof.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    {prof.fotoPerfil ? (
                                        <img src={prof.fotoPerfil} alt={prof.nome} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800' }}>
                                            {prof.nome.replace(/^(Dr\.|Dra\.)\s+/i, '').charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.15rem', color: '#1f2937' }}>{prof.nome}</h3>
                                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                                            {prof.especialidade || 'Fisioterapeuta'} {prof.registroProfissional ? `| ${prof.registroProfissional}` : ''}
                                        </p>
                                    </div>
                                </div>
                                
                                {prof.biografia && (
                                    <div style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #059669', marginBottom: '1rem', lineHeight: '1.4' }}>
                                        "{prof.biografia}"
                                    </div>
                                )}

                                <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '0.75rem 0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Phone size={16} color="#6b7280" /><span>{prof.celular} (Login)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => removerProfissional(prof.id, prof.nome)}
                                style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                            >
                                <Trash2 size={16} /> Remover Acesso ao Sistema
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL DE CADASTRO DO PROFISSIONAL */}
            {modalAberto && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem', boxSizing: 'border-box' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Stethoscope size={24} color="#059669" /> Cadastrar Novo Fisioterapeuta
                            </h2>
                            <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={criarProfissional} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>Nome Completo</label>
                                    <input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Dra. Marta Sousa" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>Especialidade Principal</label>
                                    <select 
                                        value={form.especialidade} 
                                        onChange={e => setForm({...form, especialidade: e.target.value})} 
                                        required 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '0.95rem' }}
                                    >
                                        <option value="" disabled>-- Selecione uma especialidade --</option>
                                        {especialidadesOpcoes.map((esp) => (
                                            <option key={esp} value={esp}>{esp}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#334155' }}>
                                        <BadgeInfo size={16} color="#059669"/> Registro (CREFITO)
                                    </label>
                                    <input type="text" value={form.registroProfissional} onChange={e => setForm({...form, registroProfissional: e.target.value})} placeholder="Ex: CREFITO-3/123456-F" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#334155' }}>
                                    <FileText size={16} color="#059669"/> Biografia / Experiência (Curta)
                                </label>
                                <textarea value={form.biografia} onChange={e => setForm({...form, biografia: e.target.value})} placeholder="Escreva uma breve apresentação que o paciente irá ler sobre este profissional..." required rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                            </div>

                            <div style={{ backgroundColor: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem' }}>Credenciais de Acesso ao Sistema</h4>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>Celular (Login)</label>
                                        <input type="tel" inputMode="numeric" value={form.celular} onChange={(e) => setForm({ ...form, celular: formatarTelefone(e.target.value) })} placeholder="(00) 00000-0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', color: '#334155' }}>PIN Inicial</label>
                                        <input type="password" inputMode="numeric" maxLength="4" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="4 Dígitos" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '0.3rem' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={carregando} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                    {carregando ? 'Registrando...' : 'Liberar Acesso e Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}