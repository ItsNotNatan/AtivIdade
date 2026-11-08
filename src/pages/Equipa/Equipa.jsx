// src/pages/Equipa/Equipa.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, Briefcase, Trash2, X, Stethoscope, FileText, BadgeInfo } from 'lucide-react';
import { formatarTelefone } from '../../utils/formatadores';
import { useAlert } from '../../components/AlertContext/AlertContext'; 
import { API_URL } from '../../config';
import './Equipa.css';

export default function Equipa() {
    const { showAlert, showConfirm } = useAlert(); 
    const [profissionais, setProfissionais] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const [form, setForm] = useState({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });

    useEffect(() => { carregarEquipe(); }, []);

    const carregarEquipe = async () => {
        try {
            const res = await fetch(`${API_URL}/api/profissionais`);
            if (res.ok) setProfissionais(await res.json());
        } catch (error) { console.error(error); }
    };

    const criarProfissional = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/api/profissionais`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
            });

            if (res.ok) {
                showAlert('Profissional adicionado à equipe com sucesso!', 'sucesso');
                setModalAberto(false);
                setForm({ nome: '', especialidade: '', registroProfissional: '', biografia: '', celular: '', pin: '' });
                carregarEquipe();
            } else {
                const erro = await res.json();
                showAlert(erro.erro || 'Falha ao registrar profissional.', 'erro');
            }
        } catch (error) { showAlert('Erro de conexão ao servidor.', 'erro'); } 
        finally { setCarregando(false); }
    };

    const removerProfissional = async (id, nome) => {
        if (!await showConfirm(`Tem certeza que deseja revogar o acesso de ${nome}?`)) return;
        
        try {
            const res = await fetch(`${API_URL}/api/profissionais/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Profissional removido com sucesso!', 'sucesso');
                carregarEquipe();
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="equipa-container fade-in">
            <header className="equipa-header">
                <div>
                    <h1 className="equipa-title">Corpo Clínico & Instrutores</h1>
                    <p className="equipa-subtitle">Gerencie os profissionais com acesso ao sistema.</p>
                </div>
                <button onClick={() => setModalAberto(true)} className="btn-adicionar">
                    <UserPlus size={20} /> Registrar Profissional
                </button>
            </header>

            <div className="profissionais-grid">
                {profissionais.map((prof) => (
                    <div key={prof.id} className="profissional-card">
                        <div>
                            <div className="profissional-topo">
                                <div className="profissional-avatar">{prof.nome.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}</div>
                                <div className="profissional-info">
                                    <h3>{prof.nome}</h3>
                                    <p>{prof.especialidade || 'Fisioterapeuta'} {prof.registroProfissional ? `| ${prof.registroProfissional}` : ''}</p>
                                </div>
                            </div>
                            
                            {prof.biografia && (
                                <div className="profissional-bio">
                                    "{prof.biografia}"
                                </div>
                            )}

                            <div className="profissional-detalhes">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} color="#059669" /><span>Conta Ativa no Sistema</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} color="#6b7280" /><span>{prof.celular}</span></div>
                            </div>
                        </div>
                        <div className="profissional-acoes">
                            <button className="btn-acao-prof" style={{ color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2' }} onClick={() => removerProfissional(prof.id, prof.nome)}>
                                <Trash2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Remover Acesso
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalAberto && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 900, padding: '1rem' }}>
                    <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={24} color="#059669" /> Registrar Novo Colega</h2>
                            <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={criarProfissional} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Nome Completo</label>
                                    <input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Dra. Marta Sousa" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Especialidade</label>
                                    <input type="text" value={form.especialidade} onChange={e => setForm({...form, especialidade: e.target.value})} placeholder="Ex: Fisioterapia Motora" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><BadgeInfo size={16} color="#059669"/> Registro (CREFITO)</label>
                                    <input type="text" value={form.registroProfissional} onChange={e => setForm({...form, registroProfissional: e.target.value})} placeholder="Ex: CREFITO-3/123456-F" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><FileText size={16} color="#059669"/> Biografia / Experiência Curta</label>
                                <textarea value={form.biografia} onChange={e => setForm({...form, biografia: e.target.value})} placeholder="Escreva uma breve apresentação que o paciente irá ler..." required rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Celular (Login)</label>
                                    <input type="tel" inputMode="numeric" value={form.celular} onChange={(e) => setForm({ ...form, celular: formatarTelefone(e.target.value) })} placeholder="(00) 00000-0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>PIN de Acesso</label>
                                    <input type="password" inputMode="numeric" maxLength="4" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="4 Dígitos" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '0.3rem' }} />
                                </div>
                            </div>

                            <button type="submit" disabled={carregando} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                {carregando ? 'Registrando...' : 'Criar Acesso ao Sistema'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}