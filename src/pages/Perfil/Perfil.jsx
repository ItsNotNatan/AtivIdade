// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect } from 'react';
import {
    User, Settings, Bell, Award, Phone, Activity, 
    Ruler, Save, X, Building, Stethoscope, HeartHandshake, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { formatarTelefone } from '../../utils/formatadores';
import './Perfil.css';

export default function Perfil() {
    const { usuario } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const secoesCondicoes = [
        {
            titulo: "Articulações & Coluna",
            opcoes: [
                "Dor nos Joelhos", "Dor nos Ombros", "Coluna / Hérnia de Disco", 
                "Osteoporose / Osteopenia", "Prótese ou Pino (Quadril/Joelho/Ombro)", 
                "Cirurgia nos últimos 12 meses"
            ]
        },
        {
            titulo: "Saúde & Coração",
            opcoes: [
                "Pressão Alta (Hipertensão)", "Diabetes", "Problemas Cardíacos (Arritmia/Infarto)", 
                "Uso de Marca-passo", "Labirintite / Tontura frequente"
            ]
        },
        {
            titulo: "Segurança & Medicamentos",
            opcoes: [
                "Caí nos últimos 6 meses", "Tomo remédio para o coração/pressão", 
                "Tomo anticoagulante", "Prefiro exercícios sentado(a)"
            ]
        }
    ];

    const [letrasGrandes, setLetrasGrandes] = useState(() => {
        return localStorage.getItem('letrasGrandes') === 'true';
    });

    useEffect(() => {
        if (letrasGrandes) {
            document.body.classList.add('letras-grandes');
        } else {
            document.body.classList.remove('letras-grandes');
        }
    }, [letrasGrandes]);

    const alternarLetrasGrandes = () => {
        const novoValor = !letrasGrandes;
        setLetrasGrandes(novoValor);
        localStorage.setItem('letrasGrandes', novoValor.toString());
    };

    const [dados, setDados] = useState(() => {
        if (usuario?.tipo === 'profissional') {
            return {
                nome: usuario.nome || 'Dra. Camila',
                especialidade: usuario.especialidade || 'Fisioterapia Geriátrica',
                celular: '(11) 98765-4321',
                registoProfissional: 'CREFITO 123456-F'
            };
        }
        if (usuario?.tipo === 'gestor') {
            return {
                nome: usuario.nome || 'Diretor Carlos',
                cargo: 'Coordenador Geral',
                instituicao: usuario.instituicao || 'Centro Sénior Viver Bem',
                celular: '(11) 97777-6666'
            };
        }
        return {
            nome: usuario?.nome || 'Natan Silva',
            celular: '(11) 99999-9999',
            idade: '72',
            peso: '70',
            altura: '165',
            contatoEmergenciaNome: 'João (Filho)',
            contatoEmergenciaTel: '(11) 98888-8888',
            condicoes: ['Pressão Alta (Hipertensão)', 'Dor nos Joelhos', 'Caí nos últimos 6 meses']
        };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let novoValor = value;

        if (name === 'nome') {
            novoValor = novoValor.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
        } else if (name === 'celular') {
            novoValor = formatarTelefone(novoValor);
        } else if (name === 'peso' || name === 'altura') {
            novoValor = novoValor.replace(/\D/g, '');
        }

        setDados(prev => ({ ...prev, [name]: novoValor }));
    };

    const toggleCondicao = (condicao) => {
        setDados(prev => {
            const lista = prev.condicoes || [];
            const novas = lista.includes(condicao)
                ? lista.filter(c => c !== condicao)
                : [...lista, condicao];
            return { ...prev, condicoes: novas };
        });
    };

    const handleSalvar = (e) => {
        e.preventDefault();
        setCarregando(true);
        setTimeout(() => {
            setCarregando(false);
            setIsEditing(false);
        }, 600);
    };

    const tipoPerfil = usuario?.tipo || 'idoso';

    return (
        <div className="perfil-container fade-in">
            <header className="perfil-header">
                <h1 className="perfil-title">O Meu Perfil</h1>
                <p className="perfil-subtitle">Consulte e ajuste as preferências e condições de saúde.</p>
            </header>

            <div className="perfil-grid">
                <section className="perfil-card">
                    {!isEditing ? (
                        <div className="perfil-view fade-in">
                            <div className="avatar-circulo">
                                {tipoPerfil === 'idoso' && <User size={56} color="#059669" />}
                                {tipoPerfil === 'profissional' && <Stethoscope size={56} color="#2563eb" />}
                                {tipoPerfil === 'gestor' && <Building size={56} color="#4f46e5" />}
                            </div>

                            <h2 className="usuario-nome">{dados.nome}</h2>
                            <p className="usuario-detalhe">
                                {tipoPerfil === 'idoso' && 'Membro Ativo'}
                                {tipoPerfil === 'profissional' && dados.especialidade}
                                {tipoPerfil === 'gestor' && `${dados.cargo} • ${dados.instituicao}`}
                            </p>
                            <p className="usuario-detalhe">{dados.celular}</p>

                            {tipoPerfil === 'idoso' && (
                                <>
                                    <div className="usuario-medidas">
                                        <span><strong>Idade:</strong> {dados.idade} anos</span>
                                        <span><strong>Peso:</strong> {dados.peso} kg</span>
                                        <span><strong>Altura:</strong> {dados.altura} cm</span>
                                    </div>

                                    <div style={{ marginTop: '1.25rem', width: '100%' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#166534', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <HeartHandshake size={18} /> Condições & Cuidados Físicos
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'flex-start' }}>
                                            {dados.condicoes && dados.condicoes.length > 0 ? (
                                                dados.condicoes.map((c, i) => (
                                                    <span key={i} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontWeight: '500' }}>
                                                        {c}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Nenhuma restrição registrada.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280' }}>
                                        Contato SOS: <strong>{dados.contatoEmergenciaNome}</strong> ({dados.contatoEmergenciaTel})
                                    </div>
                                </>
                            )}

                            {tipoPerfil === 'profissional' && (
                                <div className="usuario-medidas" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                                    <span><strong>Registro:</strong> {dados.registoProfissional}</span>
                                </div>
                            )}

                            <button onClick={() => setIsEditing(true)} className="btn-editar">
                                Editar Informações & Saúde
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSalvar} className="perfil-edit-form fade-in" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                            <h3 className="sessao-titulo" style={{ alignSelf: 'center', margin: '0 0 1rem 0' }}>
                                Atualizar Perfil e Saúde
                            </h3>

                            <div className="input-group">
                                <label>Nome</label>
                                <div className="input-with-icon">
                                    <User size={20} className="input-icon" />
                                    <input type="text" name="nome" value={dados.nome} onChange={handleChange} className="input-control" required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Celular</label>
                                <div className="input-with-icon">
                                    <Phone size={20} className="input-icon" />
                                    <input type="tel" inputMode="numeric" name="celular" value={dados.celular} onChange={handleChange} className="input-control" required />
                                </div>
                            </div>

                            {tipoPerfil === 'idoso' && (
                                <>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>Peso (kg)</label>
                                            <div className="input-with-icon">
                                                <Activity size={20} className="input-icon" />
                                                <input type="text" inputMode="numeric" name="peso" value={dados.peso} onChange={handleChange} className="input-control" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Altura (cm)</label>
                                            <div className="input-with-icon">
                                                <Ruler size={20} className="input-icon" />
                                                <input type="text" inputMode="numeric" name="altura" value={dados.altura} onChange={handleChange} className="input-control" />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '0.5rem' }}>
                                            Condições de Saúde e Limitações
                                        </label>
                                        {secoesCondicoes.map(sec => (
                                            <div key={sec.titulo} style={{ marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '0.35rem' }}>
                                                    {sec.titulo}
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                    {sec.opcoes.map(opcao => {
                                                        const ativo = dados.condicoes?.includes(opcao);
                                                        return (
                                                            <button 
                                                                type="button" 
                                                                key={opcao}
                                                                onClick={() => toggleCondicao(opcao)}
                                                                style={{
                                                                    padding: '0.35rem 0.65rem',
                                                                    borderRadius: '8px',
                                                                    border: `1px solid ${ativo ? '#059669' : '#cbd5e1'}`,
                                                                    backgroundColor: ativo ? '#059669' : '#f8fafc',
                                                                    color: ativo ? 'white' : '#334155',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {opcao}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="form-actions-perfil">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancelar">
                                    <X size={20} /> Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={carregando}>
                                    {carregando ? 'Salvando...' : <><Save size={20} /> Salvar</>}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <section className="perfil-card">
                    <h3 className="sessao-titulo">Configurações e Acessibilidade</h3>
                    <ul className="config-lista">
                        <li className="config-item">
                            <div className="config-info">
                                <Settings size={24} color="#059669" />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 'bold' }}>Letras Grandes</span>
                                    <small style={{ color: '#6b7280' }}>Aumenta o tamanho de todo o texto na tela</small>
                                </div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="toggle-switch" 
                                checked={letrasGrandes} 
                                onChange={alternarLetrasGrandes} 
                            />
                        </li>
                        <li className="config-item">
                            <div className="config-info">
                                <Bell size={24} color="#4b5563" />
                                <span>Lembretes de Treino</span>
                            </div>
                            <input type="checkbox" className="toggle-switch" defaultChecked />
                        </li>
                        <li className="config-item">
                            <div className="config-info">
                                <Award size={24} color="#4b5563" />
                                <span>Conquistas e Medalhas</span>
                            </div>
                            <input type="checkbox" className="toggle-switch" defaultChecked />
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}