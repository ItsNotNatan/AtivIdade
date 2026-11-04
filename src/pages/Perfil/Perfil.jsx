import React, { useState } from 'react';
import {
    User, Settings, Bell, Award, Mail, Phone, Activity, Ruler, Save, X
} from 'lucide-react';
import './Perfil.css';

export default function Perfil() {
    // Controla se estamos no modo visualização ou edição
    const [isEditing, setIsEditing] = useState(false);
    const [carregando, setCarregando] = useState(false);

    // Dados simulados do usuário (sincronizados com o que pedimos no cadastro)
    const [dados, setDados] = useState({
        nome: 'Natan',
        email: 'natan@exemplo.com',
        celular: '(11) 99999-9999',
        peso: '70',
        altura: '165',
        contatoEmergenciaNome: 'Maria (Filha)',
        contatoEmergenciaTel: '(11) 98888-8888'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDados(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = (e) => {
        e.preventDefault();
        setCarregando(true);

        // Simula o tempo de salvamento
        setTimeout(() => {
            setCarregando(false);
            setIsEditing(false); // Volta para a tela de visualização
        }, 1000);
    };

    return (
        <div className="perfil-container fade-in">
            <header className="perfil-header">
                <h1 className="perfil-title">Meu Perfil</h1>
                <p className="perfil-subtitle">Veja suas informações e ajuste suas preferências.</p>
            </header>

            <div className="perfil-grid">

                {/* CARTÃO DA ESQUERDA: Alterna entre Visualizar e Editar */}
                <section className="perfil-card">

                    {!isEditing ? (
                        // --- MODO VISUALIZAÇÃO ---
                        <div className="perfil-view fade-in">
                            <div className="avatar-circulo">
                                <User size={56} color="#059669" />
                            </div>
                            <h2 className="usuario-nome">{dados.nome}</h2>
                            <p className="usuario-detalhe">{dados.email}</p>
                            <p className="usuario-detalhe">Membro há 3 meses</p>

                            <div className="usuario-medidas">
                                <span><strong>Peso:</strong> {dados.peso} kg</span>
                                <span><strong>Altura:</strong> {dados.altura} cm</span>
                            </div>

                            <button onClick={() => setIsEditing(true)} className="btn-editar">
                                Editar Informações
                            </button>
                        </div>
                    ) : (
                        // --- MODO EDIÇÃO ---
                        <form onSubmit={handleSalvar} className="perfil-edit-form fade-in">
                            <h3 className="sessao-titulo" style={{ marginBottom: '1rem', alignSelf: 'center' }}>
                                Atualizar Dados
                            </h3>

                            <div className="input-group">
                                <label>Nome</label>
                                <div className="input-with-icon">
                                    <User size={20} className="input-icon" />
                                    <input type="text" name="nome" value={dados.nome} onChange={handleChange} className="input-control" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Celular</label>
                                <div className="input-with-icon">
                                    <Phone size={20} className="input-icon" />
                                    <input type="tel" name="celular" value={dados.celular} onChange={handleChange} className="input-control" />
                                </div>
                            </div>

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

                {/* CARTÃO DA DIREITA: Configurações */}
                <section className="perfil-card">
                    <h3 className="sessao-titulo">Configurações do Aplicativo</h3>
                    <ul className="config-lista">
                        <li className="config-item">
                            <div className="config-info">
                                <Bell size={24} color="#4b5563" />
                                <span>Lembretes de Atividade</span>
                            </div>
                            <input type="checkbox" className="toggle-switch" defaultChecked />
                        </li>
                        <li className="config-item">
                            <div className="config-info">
                                <Settings size={24} color="#4b5563" />
                                <span>Letras Grandes</span>
                            </div>
                            <input type="checkbox" className="toggle-switch" defaultChecked />
                        </li>
                        <li className="config-item">
                            <div className="config-info">
                                <Award size={24} color="#4b5563" />
                                <span>Mostrar minhas conquistas</span>
                            </div>
                            <input type="checkbox" className="toggle-switch" defaultChecked />
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}