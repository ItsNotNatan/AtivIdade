// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Phone, Mail, Stethoscope, BadgeCheck, GraduationCap, 
    FileText, Lock, Save, X, Edit3, Users, FolderKanban, Library, 
    HeartHandshake, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { formatarTelefone } from '../../utils/formatadores';
import { API_URL } from '../../config';
import UploadFotoPerfil from '../../components/UploadFotoPerfil/UploadFotoPerfil';
import './Perfil.css';

// LISTA COMPLETA DE ESPECIALIDADES (Usada pelo Profissional)
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

export default function Perfil() {
    const { usuario, atualizarUsuario } = useAuthStore();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    
    const [meusAlunos, setMeusAlunos] = useState([]);

    const [statsProfissional, setStatsProfissional] = useState({ totalTurmas: 0, totalAlunos: 0, totalAcervo: 0 });
    const [statsGestor, setStatsGestor] = useState({ idosos: 0, profissionais: 0, turmas: 0 });

    const [form, setForm] = useState({
        nome: '', celular: '', email: '', fotoPerfil: '', especialidade: '', 
        registroProfissional: '', formacao: '', biografia: '', pin: '', 
        idade: '', peso: '', altura: '', condicoes: []
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
        if (!usuario) {
            navigate('/login');
            return;
        }

        setForm(prev => ({
            ...prev,
            nome: usuario.nome || '',
            celular: usuario.celular || '',
            email: usuario.email || '',
            fotoPerfil: usuario.fotoPerfil || '',
            especialidade: usuario.especialidade || '',
            registroProfissional: usuario.registroProfissional || '',
            formacao: usuario.formacao || '',
            biografia: usuario.biografia || '',
            pin: '',
            idade: usuario.idade ? String(usuario.idade) : '',
            peso: usuario.peso ? String(usuario.peso) : '70',
            altura: usuario.altura ? String(usuario.altura) : '165',
            condicoes: usuario.condicoes ? usuario.condicoes.split(',').map(c => c.trim()).filter(Boolean) : []
        }));

        if (usuario.tipo === 'profissional') {
            carregarMetricasProfissional(usuario.id);
        } else if (usuario.tipo === 'gestor') {
            carregarMetricasGestor();
        }

    }, [usuario, navigate]);

    const carregarMetricasProfissional = async (idProf) => {
        try {
            const [resTurmas, resAcervo] = await Promise.all([
                fetch(`${API_URL}/api/turmas`),
                fetch(`${API_URL}/api/acervo/${idProf}`)
            ]);

            let turmasCount = 0;
            let alunosCount = 0;
            let acervoCount = 0;
            let listaUnicaAlunos = [];

            if (resTurmas.ok) {
                const todasTurmas = await resTurmas.json();
                const minhasTurmas = todasTurmas.filter(t => t.profissionalId === idProf);
                turmasCount = minhasTurmas.length;
                
                const mapaDeAlunos = new Map();
                minhasTurmas.forEach(t => {
                    if (t.alunos) {
                        t.alunos.forEach(aluno => {
                            if (!mapaDeAlunos.has(aluno.id)) {
                                mapaDeAlunos.set(aluno.id, aluno);
                            }
                        });
                    }
                });
                
                listaUnicaAlunos = Array.from(mapaDeAlunos.values());
                alunosCount = listaUnicaAlunos.length;
            }

            if (resAcervo.ok) {
                const acervo = await resAcervo.json();
                acervoCount = acervo.length;
            }

            setStatsProfissional({ totalTurmas: turmasCount, totalAlunos: alunosCount, totalAcervo: acervoCount });
            setMeusAlunos(listaUnicaAlunos);

        } catch (error) { console.error("Erro ao carregar métricas do profissional:", error); }
    };

    const carregarMetricasGestor = async () => {
        try {
            const res = await fetch(`${API_URL}/api/estatisticas`);
            if (res.ok) setStatsGestor(await res.json());
        } catch (error) { console.error("Erro ao carregar métricas do gestor:", error); }
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

    const setFotoPerfil = (novaFoto) => setForm(prev => ({ ...prev, fotoPerfil: novaFoto }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const payload = {
                nome: form.nome.trim(),
                celular: form.celular.trim(),
                email: form.email.trim(),
                fotoPerfil: form.fotoPerfil,
                especialidade: form.especialidade.trim(),
                registroProfissional: form.registroProfissional.trim(),
                formacao: form.formacao.trim(),
                biografia: form.biografia.trim(),
                pin: form.pin ? form.pin : undefined,
                idade: form.idade ? Number(form.idade) : null,
                condicoes: form.condicoes.join(', ')
            };

            const res = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                atualizarUsuario(data.usuario);
                showAlert('Informações atualizadas com sucesso!', 'sucesso');
                setModalEditarAberto(false);
            } else {
                const err = await res.json();
                showAlert(err.erro || 'Erro ao atualizar dados.', 'erro');
            }
        } catch (error) { showAlert('Falha na comunicação com o servidor.', 'erro'); } 
        finally { setCarregando(false); }
    };

    if (!usuario) return null;

    const isProf = usuario.tipo === 'profissional';
    const isGestor = usuario.tipo === 'gestor';

    return (
        <div className="perfil-layout fade-in">
            {/* ========================================================= */}
            {/* PERFIL DO DIRETOR / GESTOR */}
            {/* ========================================================= */}
            {isGestor && (
                <div className="perfil-prof-container">
                    <div className="prof-hero-card">
                        <div className="prof-avatar-badge" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e3a8a', color: 'white', border: 'none' }}>
                            {usuario.fotoPerfil ? (
                                <img src={usuario.fotoPerfil} alt={usuario.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{usuario.nome.replace(/^(Diretor\s*|Diretora\s*)/i, '').charAt(0) || 'G'}</span>
                            )}
                        </div>
                        <div className="prof-hero-info">
                            <div className="prof-title-row">
                                <h1>{form.nome || 'Diretor'}</h1>
                                <span className="badge-registro" style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none' }}>
                                    <ShieldCheck size={18} /> Gestor da Instituição
                                </span>
                            </div>
                            <p className="prof-especialidade-sub" style={{ color: '#475569' }}>
                                Painel de Administração Central
                            </p>
                            <div className="prof-contact-pills">
                                <span><Phone size={15} /> {form.celular}</span>
                                {form.email && <span><Mail size={15} /> {form.email}</span>}
                            </div>
                        </div>

                        <button onClick={() => setModalEditarAberto(true)} className="btn-edit-toggle">
                            <Edit3 size={18} /> Editar Perfil
                        </button>
                    </div>

                    <div className="prof-stats-grid">
                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <h3>{statsGestor.idosos}</h3>
                                <p>Pacientes na Clínica</p>
                            </div>
                        </div>

                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                                <Stethoscope size={24} />
                            </div>
                            <div>
                                <h3>{statsGestor.profissionais}</h3>
                                <p>Fisioterapeutas</p>
                            </div>
                        </div>

                        <div className="stat-box">
                            <div className="stat-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                <FolderKanban size={24} />
                            </div>
                            <div>
                                <h3>{statsGestor.turmas}</h3>
                                <p>Turmas Ativas Globais</p>
                            </div>
                        </div>
                    </div>

                    <div className="prof-section-card" style={{ marginTop: '2rem' }}>
                        <h2><Lock size={22} color="#1e3a8a" /> Acesso & Segurança (Administração)</h2>
                        <p className="section-content-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} color="#059669" /> Esta conta possui privilégios de gestão total para cadastrar e remover membros do corpo clínico.
                        </p>
                    </div>

                    {/* MODAL DE EDIÇÃO DO GESTOR */}
                    {modalEditarAberto && (
                        <div className="modal-backdrop">
                            <div className="modal-content-card fade-in" style={{ maxWidth: '500px' }}>
                                <div className="modal-header">
                                    <div>
                                        <h2>Editar Perfil da Direção</h2>
                                        <p>Atualize os seus dados de contacto e acesso.</p>
                                    </div>
                                    <button onClick={() => setModalEditarAberto(false)} className="btn-modal-close"><X size={22} /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="modal-form-body">
                                    <UploadFotoPerfil foto={form.fotoPerfil} setFoto={setFotoPerfil} tamanho={100} />
                                    <div className="form-group">
                                        <label>Nome Completo</label>
                                        <input type="text" name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: Diretor Carlos" />
                                    </div>
                                    <div className="form-group">
                                        <label>Celular (Login)</label>
                                        <input type="tel" inputMode="numeric" name="celular" value={form.celular} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>E-mail Institucional</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="diretoria@clinica.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Novo PIN de 4 Dígitos (Opcional)</label>
                                        <input type="password" inputMode="numeric" maxLength="4" name="pin" value={form.pin} onChange={handleChange} placeholder="Deixe em branco para manter" style={{ letterSpacing: '0.25rem' }} />
                                    </div>
                                    <div className="modal-actions-footer">
                                        <button type="button" onClick={() => setModalEditarAberto(false)} className="btn-modal-cancel">Cancelar</button>
                                        <button type="submit" disabled={carregando} className="btn-modal-save" style={{ backgroundColor: '#1e3a8a' }}>
                                            <Save size={18} /> {carregando ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* PERFIL DO FISIOTERAPEUTA (PROFISSIONAL) */}
            {/* ========================================================= */}
            {isProf && (
                <div className="perfil-prof-container">
                    
                    <div className="prof-hero-card">
                        <div className="prof-avatar-badge" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {usuario.fotoPerfil ? (
                                <img src={usuario.fotoPerfil} alt={usuario.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{usuario.nome.replace('Dr. ', '').replace('Dra. ', '').charAt(0) || 'F'}</span>
                            )}
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

                    <div className="prof-section-card fade-in">
                        <h2><Users size={22} color="#2563eb" /> Seus Pacientes ({meusAlunos.length})</h2>
                        {meusAlunos.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
                                {meusAlunos.map(aluno => (
                                    <div key={aluno.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        {aluno.fotoPerfil ? (
                                            <img src={aluno.fotoPerfil} alt={aluno.nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }} />
                                        ) : (
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {aluno.nome.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <strong style={{ display: 'block', color: '#1e293b', fontSize: '1.05rem', marginBottom: '0.2rem' }}>{aluno.nome}</strong>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{aluno.idade ? `${aluno.idade} anos` : 'Idade não informada'}</span>
                                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Phone size={12} /> {aluno.celular}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="section-content-text">
                                Você ainda não possui pacientes vinculados. Vá ao Painel Principal, crie uma Turma e adicione os pacientes para que eles apareçam na sua lista de cuidados.
                            </p>
                        )}
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

                    {/* MODAL DE EDIÇÃO DO FISIOTERAPEUTA */}
                    {modalEditarAberto && (
                        <div className="modal-backdrop">
                            <div className="modal-content-card fade-in">
                                
                                <div className="modal-header">
                                    <div>
                                        <h2>Editar Ficha do Profissional</h2>
                                        <p>Atualize suas credenciais, contatos e informações clínicas de atendimento.</p>
                                    </div>
                                    <button onClick={() => setModalEditarAberto(false)} className="btn-modal-close"><X size={22} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="modal-form-body">
                                    <UploadFotoPerfil foto={form.fotoPerfil} setFoto={setFotoPerfil} tamanho={100} />
                                    
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Nome Completo (Identificação Clínica)</label>
                                            <input type="text" name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: Dra. Camila Rocha" />
                                        </div>
                                        <div className="form-group">
                                            <label>Celular de Acesso</label>
                                            <input type="tel" inputMode="numeric" name="celular" value={form.celular} onChange={handleChange} required placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Especialidade Principal</label>
                                            <select 
                                                name="especialidade" 
                                                value={form.especialidade} 
                                                onChange={handleChange} 
                                                required
                                                style={{ width: '100%', padding: '0.75rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', fontFamily: 'inherit' }}
                                            >
                                                <option value="" disabled>-- Selecione uma especialidade --</option>
                                                {especialidadesOpcoes.map((esp) => (
                                                    <option key={esp} value={esp}>{esp}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Registro Profissional (CREFITO)</label>
                                            <input type="text" name="registroProfissional" value={form.registroProfissional} onChange={handleChange} required placeholder="Ex: CREFITO-3/123456-F" />
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>E-mail Institucional / Contato</label>
                                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="profissional@instituicao.com.br" />
                                        </div>
                                        <div className="form-group">
                                            <label>Novo PIN de 4 Dígitos (Opcional)</label>
                                            <input type="password" inputMode="numeric" maxLength="4" name="pin" value={form.pin} onChange={handleChange} placeholder="Deixe em branco para manter" style={{ letterSpacing: '0.25rem' }} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Formação Acadêmica, Pós e Cursos de Extensão</label>
                                        <textarea name="formacao" rows="2" value={form.formacao} onChange={handleChange} placeholder="Ex: Graduação em Fisioterapia (USP), Especialização em Gerontologia..."></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label>Apresentação / Abordagem Terapêutica com Idosos</label>
                                        <textarea name="biografia" rows="3" value={form.biografia} onChange={handleChange} placeholder="Descreva seu método de trabalho: foco em prevenção de quedas..."></textarea>
                                    </div>

                                    <div className="modal-actions-footer">
                                        <button type="button" onClick={() => setModalEditarAberto(false)} className="btn-modal-cancel">Cancelar</button>
                                        <button type="submit" disabled={carregando} className="btn-modal-save">
                                            <Save size={18} /> {carregando ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* PERFIL DO PACIENTE (IDOSO) */}
            {/* ========================================================= */}
            {!isProf && !isGestor && (
                <div className="perfil-idoso-container">
                    <div className="idoso-card">
                        <UploadFotoPerfil foto={form.fotoPerfil} setFoto={setFotoPerfil} tamanho={120} />
                        
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

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Acessibilidade</h3>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span>Modo de Letras Grandes</span>
                                <input type="checkbox" checked={letrasGrandes} onChange={alternarLetrasGrandes} style={{ width: '20px', height: '20px' }} />
                            </label>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={carregando}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '1rem', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                        >
                            <Save size={20} /> {carregando ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
