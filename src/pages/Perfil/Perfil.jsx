// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Phone, Mail, Stethoscope, BadgeCheck, GraduationCap, 
    FileText, Lock, Save, X, Edit3, Users, FolderKanban, Library, 
    HeartHandshake, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { formatarTelefone } from '../../utils/formatadores';
import './Perfil.css';

export default function Perfil() {
    const { usuario, atualizarUsuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
        }
    }, [usuario, navigate]);

    const [statsProfissional, setStatsProfissional] = useState({
        totalTurmas: 0,
        totalAlunos: 0,
        totalAcervo: 0
    });

    const [form, setForm] = useState({
        nome: '',
        celular: '',
        email: '',
        especialidade: '',
        registroProfissional: '',
        formacao: '',
        biografia: '',
        pin: '',
        idade: '',
        peso: '',
        altura: '',
        condicoes: []
    });

    const [letrasGrandes, setLetrasGrandes] = useState(() => localStorage.getItem('letrasGrandes') === 'true');

    useEffect(() => {
        if (letrasGrandes) document.body.classList.add('letras-grandes');
        else document.body.classList.remove('letras-grandes');
    }, [letrasGrandes]);

    const alternarLetrasGrandes = () => {
        const novo = !letrasGrandes;
        setLetrasGrandes(novo);
        localStorage.setItem('letrasGrandes', novo.toString());
    };

    useEffect(() => {
        if (usuario) {
            setForm({
                nome: usuario.nome || '',
                celular: usuario.celular || '',
                email: usuario.email || '',
                especialidade: usuario.especialidade || '',
                registroProfissional: usuario.registroProfissional || '',
                formacao: usuario.formacao || '',
                biografia: usuario.biografia || '',
                pin: '',
                idade: usuario.idade ? String(usuario.idade) : '',
                peso: usuario.peso ? String(usuario.peso) : '70',
                altura: usuario.altura ? String(usuario.altura) : '165',
                condicoes: usuario.condicoes ? usuario.condicoes.split(',').map(c => c.trim()).filter(Boolean) : []
            });

            if (usuario.tipo === 'profissional') {
                carregarMetricasProfissional(usuario.id);
            }
        }
    }, [usuario]);

    const carregarMetricasProfissional = async (idProf) => {
        try {
            const [resTurmas, resAcervo] = await Promise.all([
                fetch('http://localhost:3001/api/turmas'),
                fetch(`http://localhost:3001/api/acervo/${idProf}`)
            ]);

            let turmasCount = 0;
            let alunosCount = 0;
            let acervoCount = 0;

            if (resTurmas.ok) {
                const turmas = await resTurmas.json();
                turmasCount = turmas.length;
                alunosCount = turmas.reduce((total, t) => total + (t.alunos?.length || 0), 0);
            }

            if (resAcervo.ok) {
                const acervo = await resAcervo.json();
                acervoCount = acervo.length;
            }

            setStatsProfissional({
                totalTurmas: turmasCount,
                totalAlunos: alunosCount,
                totalAcervo: acervoCount
            });
        } catch (error) {
            console.error("Erro ao carregar métricas do profissional:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let v = value;

        if (name === 'nome') {
            v = v.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
        } else if (name === 'celular') {
            v = formatarTelefone(v);
        } else if (name === 'pin') {
            v = v.replace(/\D/g, '').slice(0, 4);
        } else if (name === 'idade' || name === 'peso' || name === 'altura') {
            v = v.replace(/\D/g, '');
        }

        setForm(prev => ({ ...prev, [name]: v }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const payload = {
                nome: form.nome.trim(),
                celular: form.celular.trim(),
                email: form.email.trim(),
                especialidade: form.especialidade.trim(),
                registroProfissional: form.registroProfissional.trim(),
                formacao: form.formacao.trim(),
                biografia: form.biografia.trim(),
                pin: form.pin ? form.pin : undefined,
                idade: form.idade ? Number(form.idade) : null,
                condicoes: form.condicoes.join(', ')
            };

            const res = await fetch(`http://localhost:3001/api/usuarios/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                atualizarUsuario(data.usuario);
                showAlert('Informações profissionais atualizadas com sucesso!', 'sucesso');
                setModalEditarAberto(false);
            } else {
                const err = await res.json();
                showAlert(err.erro || 'Erro ao atualizar dados.', 'erro');
            }
        } catch (error) {
            showAlert('Falha na comunicação com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    };

    if (!usuario) return null;

    const isProf = usuario.tipo === 'profissional';

    return (
        <div className="perfil-layout fade-in">
            {isProf ? (
                <div className="perfil-prof-container">
                    
                    <div className="prof-hero-card">
                        <div className="prof-avatar-badge">
                            {form.nome.replace('Dr. ', '').replace('Dra. ', '').charAt(0) || 'F'}
                        </div>
                        <div className="prof-hero-info">
                            <div className="prof-title-row">
                                <h1>{form.nome || 'Fisioterapeuta'}</h1>
                                <span className="badge-registro">
                                    <BadgeCheck size={18} /> {form.registroProfissional || 'CREFITO Pendente'}
                                </span>
                            </div>
                            <p className="prof-especialidade-sub">
                                <Stethoscope size={18} color="#2563eb" /> {form.especialidade || 'Fisioterapia Geriátrica e Gerontologia'}
                            </p>
                            <div className="prof-contact-pills">
                                <span><Phone size={15} /> {form.celular}</span>
                                {form.email && <span><Mail size={15} /> {form.email}</span>}
                            </div>
                        </div>

                        <button onClick={() => setModalEditarAberto(true)} className="btn-edit-toggle">
                            <Edit3 size={18} /> Editar Ficha Profissional
                        </button>
                    </div>

                    <div className="prof-stats-grid">
                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <h3>{statsProfissional.totalAlunos}</h3>
                                <p>Idosos Sob Seus Cuidados</p>
                            </div>
                        </div>

                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                                <FolderKanban size={24} />
                            </div>
                            <div>
                                <h3>{statsProfissional.totalTurmas}</h3>
                                <p>Turmas Ativas</p>
                            </div>
                        </div>

                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                <Library size={24} />
                            </div>
                            <div>
                                <h3>{statsProfissional.totalAcervo}</h3>
                                <p>Modelos no Acervo</p>
                            </div>
                        </div>
                    </div>

                    <div className="prof-details-view fade-in">
                        <div className="prof-section-card">
                            <h2><GraduationCap size={22} color="#2563eb" /> Formação Acadêmica & Titulações</h2>
                            <p className="section-content-text">
                                {form.formacao || 'Nenhuma formação registrada. Clique no botão de edição acima para adicionar suas titulações e cursos.'}
                            </p>
                        </div>

                        <div className="prof-section-card">
                            <h2><FileText size={22} color="#2563eb" /> Abordagem Terapêutica & Especialidades</h2>
                            <p className="section-content-text">
                                {form.biografia || 'Nenhuma descrição adicionada. Informe seu método de tratamento focado na terceira idade para que a equipe e famílias conheçam sua prática.'}
                            </p>
                        </div>

                        <div className="prof-section-card">
                            <h2><Lock size={22} color="#2563eb" /> Acesso & Segurança</h2>
                            <p className="section-content-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={18} color="#059669" /> Acesso autenticado via Celular (<strong>{form.celular}</strong>) e PIN pessoal de 4 dígitos.
                            </p>
                        </div>
                    </div>

                    {modalEditarAberto && (
                        <div className="modal-backdrop">
                            <div className="modal-content-card fade-in">
                                
                                <div className="modal-header">
                                    <div>
                                        <h2>Editar Ficha do Profissional</h2>
                                        <p>Atualize suas credenciais, contatos e informações clínicas de atendimento.</p>
                                    </div>
                                    <button onClick={() => setModalEditarAberto(false)} className="btn-modal-close">
                                        <X size={22} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="modal-form-body">
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Nome Completo (Identificação Clínica)</label>
                                            <input 
                                                type="text" 
                                                name="nome" 
                                                value={form.nome} 
                                                onChange={handleChange} 
                                                required 
                                                placeholder="Ex: Dra. Camila Rocha"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Celular de Acesso</label>
                                            <input 
                                                type="tel" 
                                                inputMode="numeric" 
                                                name="celular" 
                                                value={form.celular} 
                                                onChange={handleChange} 
                                                required 
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Especialidade Principal</label>
                                            <input 
                                                type="text" 
                                                name="especialidade" 
                                                value={form.especialidade} 
                                                onChange={handleChange} 
                                                required 
                                                placeholder="Ex: Fisioterapia Geriátrica"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Registro Profissional (CREFITO)</label>
                                            <input 
                                                type="text" 
                                                name="registroProfissional" 
                                                value={form.registroProfissional} 
                                                onChange={handleChange} 
                                                required 
                                                placeholder="Ex: CREFITO-3/123456-F"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>E-mail Institucional / Contato</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={form.email} 
                                                onChange={handleChange} 
                                                placeholder="profissional@instituicao.com.br"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Novo PIN de 4 Dígitos (Opcional)</label>
                                            <input 
                                                type="password" 
                                                inputMode="numeric" 
                                                maxLength="4" 
                                                name="pin" 
                                                value={form.pin} 
                                                onChange={handleChange} 
                                                placeholder="Deixe em branco para manter"
                                                style={{ letterSpacing: '0.25rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Formação Acadêmica, Pós e Cursos de Extensão</label>
                                        <textarea 
                                            name="formacao" 
                                            rows="2" 
                                            value={form.formacao} 
                                            onChange={handleChange} 
                                            placeholder="Ex: Graduação em Fisioterapia (USP), Especialização em Gerontologia..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Apresentação / Abordagem Terapêutica com Idosos</label>
                                        <textarea 
                                            name="biografia" 
                                            rows="3" 
                                            value={form.biografia} 
                                            onChange={handleChange} 
                                            placeholder="Descreva seu método de trabalho: foco em prevenção de quedas..."
                                        />
                                    </div>

                                    <div className="modal-actions-footer">
                                        <button type="button" onClick={() => setModalEditarAberto(false)} className="btn-modal-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={carregando} className="btn-modal-save">
                                            <Save size={18} /> {carregando ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="perfil-idoso-container">
                    <div className="idoso-card">
                        <div className="avatar-circulo" style={{ margin: '0 auto 1.5rem', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={48} color="#059669" />
                        </div>
                        <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>{form.nome}</h2>
                        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 1.5rem 0' }}>Celular: {form.celular}</p>

                        <div className="medidas-row" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <span><strong>Idade:</strong> {form.idade || '--'} anos</span>
                            <span><strong>Peso:</strong> {form.peso || '--'} kg</span>
                            <span><strong>Altura:</strong> {form.altura || '--'} cm</span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', margin: '0 0 0.5rem 0' }}>
                                <HeartHandshake size={18} /> Condições de Saúde Cadastradas:
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {form.condicoes.length > 0 ? (
                                    form.condicoes.map((c, i) => (
                                        <span key={i} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>
                                            {c}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma restrição registrada.</span>
                                )}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Acessibilidade</h3>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span>Modo de Letras Grandes</span>
                                <input type="checkbox" checked={letrasGrandes} onChange={alternarLetrasGrandes} style={{ width: '20px', height: '20px' }} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}