// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, HeartPulse, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { API_URL } from '../../config';
import UploadFotoPerfil from '../../components/UploadFotoPerfil/UploadFotoPerfil';
import './Cadastro.css'; // Mantenha o seu CSS original

export default function Cadastro() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [tipoConta, setTipoConta] = useState(null); // 'idoso' ou 'profissional'

    // Estados gerais
    const [nome, setNome] = useState('');
    const [celular, setCelular] = useState('');
    const [pin, setPin] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [carregando, setCarregando] = useState(false);

    // Estados específicos: Idoso
    const [idade, setIdade] = useState('');
    const [mobilidade, setMobilidade] = useState('Caminho sem ajuda');
    const [condicoes, setCondicoes] = useState('');
    const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
    const [contatoEmergenciaTel, setContatoEmergenciaTel] = useState('');

    // Estados específicos: Profissional
    const [especialidade, setEspecialidade] = useState('');
    const [registroProfissional, setRegistroProfissional] = useState('');

    const handleSalvar = async (e) => {
        e.preventDefault();
        
        if (pin.length !== 4) return showAlert('O PIN deve ter exatamente 4 números.', 'erro');
        
        setCarregando(true);
        const endpoint = tipoConta === 'profissional' ? `${API_URL}/api/profissionais` : `${API_URL}/api/auth/registo`;
        
        const payload = tipoConta === 'profissional' 
            ? { nome, celular, pin, fotoPerfil, especialidade, registroProfissional }
            : { nome, celular, pin, fotoPerfil, idade, mobilidade, condicoes, contatoEmergenciaNome, contatoEmergenciaTel };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                showAlert('Conta criada com sucesso! Faça login.', 'sucesso');
                navigate('/login');
            } else {
                showAlert(data.erro || 'Erro ao criar conta.', 'erro');
            }
        } catch (error) {
            showAlert('Falha na comunicação com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    };

    if (!tipoConta) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
                <h1 style={{ color: '#1e293b', marginBottom: '2rem', textAlign: 'center' }}>Como deseja usar o AtivIdade?</h1>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={() => setTipoConta('idoso')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem', backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '16px', cursor: 'pointer', width: '280px', transition: 'all 0.2s' }}>
                        <HeartPulse size={64} color="#059669" />
                        <strong style={{ fontSize: '1.4rem', color: '#0f172a' }}>Sou Paciente / Idoso</strong>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Quero fazer os meus treinos e cuidar da minha saúde.</span>
                    </button>
                    
                    <button onClick={() => setTipoConta('profissional')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem', backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '16px', cursor: 'pointer', width: '280px', transition: 'all 0.2s' }}>
                        <Stethoscope size={64} color="#2563eb" />
                        <strong style={{ fontSize: '1.4rem', color: '#0f172a' }}>Sou Profissional</strong>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Fisioterapeuta, médico ou gestor de turmas.</span>
                    </button>
                </div>
                <button onClick={() => navigate('/login')} style={{ marginTop: '3rem', background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                    Já tenho conta. Voltar ao Login.
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
            <div className="fade-in" style={{ backgroundColor: 'white', padding: '2.5rem', width: '100%', maxWidth: '600px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Registo de {tipoConta === 'profissional' ? 'Profissional' : 'Paciente'}</h2>
                    <button onClick={() => setTipoConta(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>Mudar tipo</button>
                </div>

                <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <UploadFotoPerfil foto={fotoPerfil} setFoto={setFotoPerfil} tamanho={100} />

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 2, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Nome Completo *</label>
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                        </div>
                        {tipoConta === 'idoso' && (
                            <div style={{ flex: 1, minWidth: '100px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Idade *</label>
                                <input type="number" value={idade} onChange={e => setIdade(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '180px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Nº de Telemóvel / Celular *</label>
                            <input type="text" value={celular} onChange={e => setCelular(e.target.value)} required placeholder="Ex: (11) 99999-9999" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>PIN de Acesso (4 dígitos) *</label>
                            <input type="password" maxLength="4" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required placeholder="Ex: 1234" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', letterSpacing: '0.2em', fontSize: '1.2rem' }} />
                        </div>
                    </div>

                    {tipoConta === 'profissional' && (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#eff6ff', padding: '1.25rem', border: '1px solid #bfdbfe' }}>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>Especialidade Clínica</label>
                                <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Fisioterapia Geriátrica" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>Nº de Registo / Ordem</label>
                                <input type="text" value={registroProfissional} onChange={e => setRegistroProfissional(e.target.value)} placeholder="Ex: CREFITO 12345" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                    )}

                    {tipoConta === 'idoso' && (
                        <>
                            <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#166534' }}>Nível de Mobilidade atual *</label>
                                    <select value={mobilidade} onChange={e => setMobilidade(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                                        <option value="Caminho sem ajuda">Caminho sem ajuda</option>
                                        <option value="Uso bengala ou andador">Uso bengala ou andador</option>
                                        <option value="Cadeirante">Cadeirante / Necessito de cadeira de rodas</option>
                                        <option value="Acamado">Acamado / Restrito ao leito</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#166534' }}>Condições de Saúde ou Restrições (Opcional)</label>
                                    <input type="text" value={condicoes} onChange={e => setCondicoes(e.target.value)} placeholder="Ex: Pressão alta, artrose no joelho direito..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#fef2f2', padding: '1.25rem', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={18} /> Contacto de Emergência</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#7f1d1d' }}>Nome do Familiar/Cuidador</label>
                                        <input type="text" value={contatoEmergenciaNome} onChange={e => setContatoEmergenciaNome(e.target.value)} placeholder="Ex: João (Filho)" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#7f1d1d' }}>Telefone de Emergência</label>
                                        <input type="text" value={contatoEmergenciaTel} onChange={e => setContatoEmergenciaTel(e.target.value)} placeholder="Ex: (11) 98888-8888" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={carregando} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', backgroundColor: tipoConta === 'profissional' ? '#2563eb' : '#059669', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginTop: '1rem' }}>
                        {carregando ? 'A Processar...' : 'Concluir Registo'} <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}