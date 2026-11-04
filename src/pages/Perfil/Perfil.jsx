// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect } from 'react';
import {
    User, Settings, Bell, Award, Phone, Activity, 
    Ruler, Save, X, Building, ShieldCheck, Stethoscope
} from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Perfil.css';

export default function Perfil() {
    const { usuario } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [carregando, setCarregando] = useState(false);

    // Estado do tamanho de texto sincronizado com o localStorage
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

    // Dados dinâmicos baseados no perfil logado
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
            contatoEmergenciaTel: '(11) 98888-8888'
        };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDados(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = (e) => {
        e.preventDefault();
        setCarregando(true);
        setTimeout(() => {
            setCarregando(false);
            setIsEditing(false);
        }, 800);
    };

    const tipoPerfil = usuario?.tipo || 'idoso';

    return (
        <div className="perfil-container fade-in">
            <header className="perfil-header">
                <h1 className="perfil-title">O Meu Perfil</h1>
                <p className="perfil-subtitle">Consulte e ajuste as preferências da sua conta.</p>
            </header>

            <div className="perfil-grid">
                {/* CARTÃO DE DADOS */}
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

                            {/* Detalhes específicos de idoso */}
                            {tipoPerfil === 'idoso' && (
                                <>
                                    <div className="usuario-medidas">
                                        <span><strong>Idade:</strong> {dados.idade} anos</span>
                                        <span><strong>Peso:</strong> {dados.peso} kg</span>
                                        <span><strong>Altura:</strong> {dados.altura} cm</span>
                                    </div>

                                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '1rem', color: '#6b7280' }}>
                                        Contacto SOS: <strong>{dados.contatoEmergenciaNome}</strong> ({dados.contatoEmergenciaTel})
                                    </div>
                                </>
                            )}

                            {/* Detalhes de profissional */}
                            {tipoPerfil === 'profissional' && (
                                <div className="usuario-medidas" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                                    <span><strong>Registo:</strong> {dados.registoProfissional}</span>
                                </div>
                            )}

                            <button onClick={() => setIsEditing(true)} className="btn-editar">
                                Editar Informações
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSalvar} className="perfil-edit-form fade-in">
                            <h3 className="sessao-titulo" style={{ alignSelf: 'center', margin: '0 0 1rem 0' }}>
                                Atualizar Informações
                            </h3>

                            <div className="input-group">
                                <label>Nome</label>
                                <div className="input-with-icon">
                                    <User size={20} className="input-icon" />
                                    <input type="text" name="nome" value={dados.nome} onChange={handleChange} className="input-control" required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Telemóvel</label>
                                <div className="input-with-icon">
                                    <Phone size={20} className="input-icon" />
                                    <input type="tel" name="celular" value={dados.celular} onChange={handleChange} className="input-control" required />
                                </div>
                            </div>

                            {tipoPerfil === 'idoso' && (
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Peso (kg)</label>
                                        <div className="input-with-icon">
                                            <Activity size={20} className="input-icon" />
                                            <input type="number" name="peso" value={dados.peso} onChange={handleChange} className="input-control" />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Altura (cm)</label>
                                        <div className="input-with-icon">
                                            <Ruler size={20} className="input-icon" />
                                            <input type="number" name="altura" value={dados.altura} onChange={handleChange} className="input-control" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-actions-perfil">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancelar">
                                    <X size={20} /> Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={carregando}>
                                    {carregando ? 'A guardar...' : <><Save size={20} /> Guardar</>}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* CARTÃO DE CONFIGURAÇÕES E ACESSIBILIDADE */}
                <section className="perfil-card">
                    <h3 className="sessao-titulo">Configurações e Acessibilidade</h3>
                    <ul className="config-lista">
                        <li className="config-item">
                            <div className="config-info">
                                <Settings size={24} color="#059669" />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 'bold' }}>Letras Grandes</span>
                                    <small style={{ color: '#6b7280' }}>Aumenta o tamanho de todo o texto no ecrã</small>
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