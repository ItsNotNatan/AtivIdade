// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, User, Phone, Lock, Calendar, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './Cadastro.css';

export default function Cadastro() {
    const navigate = useNavigate();
    const [etapa, setEtapa] = useState(1);
    const [carregando, setCarregando] = useState(false);

    const [dados, setDados] = useState({
        nome: '', 
        idade: '', 
        telemovel: '', 
        pin: '',
        contatoEmergenciaNome: '', 
        contatoEmergenciaTel: '',
        mobilidade: 'Caminho sem ajuda',
        condicoes: []
    });

    const opcoesMobilidade = [
        "Caminho sem ajuda",
        "Uso bengala",
        "Uso andador",
        "Na cadeira"
    ];

    const opcoesCondicoes = [
        "Dor nas Costas",
        "Dor nos Joelhos",
        "Pressão Alta",
        "Falta de Equilíbrio",
        "Problemas no Coração",
        "Nenhuma destas"
    ];

    const aplicarMascaraTelefone = (valor) => {
        let v = valor.replace(/\D/g, ""); // Remove tudo o que não for número
        if (v.length > 11) v = v.substring(0, 11); // Limita a 11 dígitos
        
        // Aplica a máscara (XX) XXXXX-XXXX
        if (v.length <= 10) {
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let novoValor = value;

        // Validação de Nomes (apenas letras, acentos e espaços)
        if (name === 'nome' || name === 'contatoEmergenciaNome') {
            novoValor = novoValor.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
        }
        // Validação da Idade (apenas números, limite 120)
        else if (name === 'idade') {
            novoValor = novoValor.replace(/\D/g, '');
            if (novoValor !== '' && parseInt(novoValor, 10) > 120) {
                novoValor = '120';
            }
        } 
        // Máscara e bloqueio de letras para Telefones
        else if (name === 'telemovel' || name === 'contatoEmergenciaTel') {
            novoValor = aplicarMascaraTelefone(novoValor);
        }
        // Bloqueio de letras para o PIN
        else if (name === 'pin') {
            novoValor = novoValor.replace(/\D/g, '');
        }

        setDados(prev => ({ ...prev, [name]: novoValor }));
    };

    const handleToggleCondicao = (condicao) => {
        setDados(prev => {
            if (condicao === "Nenhuma destas") {
                return { ...prev, condicoes: ["Nenhuma destas"] };
            }
            
            let novasCondicoes = prev.condicoes.filter(c => c !== "Nenhuma destas");
            if (novasCondicoes.includes(condicao)) {
                novasCondicoes = novasCondicoes.filter(c => c !== condicao);
            } else {
                novasCondicoes.push(condicao);
            }
            return { ...prev, condicoes: novasCondicoes };
        });
    };

    const avancar = () => setEtapa(prev => prev + 1);
    const voltar = () => setEtapa(prev => prev - 1);

    const finalizar = async (e) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const resposta = await fetch('http://localhost:3001/api/auth/registo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (resposta.ok) {
                alert('Conta criada com sucesso! Por favor, faça login.');
                navigate('/login');
            } else {
                const erroData = await resposta.json();
                alert(erroData.erro || 'Erro ao criar conta.');
            }
        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert('Falha na comunicação com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="cadastro-container">
            <div className="cadastro-card fade-in">
                <div className="cadastro-header">
                    <HeartPulse className="mx-auto" size={48} color="#059669" strokeWidth={2.5} />
                    <h1 className="cadastro-title">Criar Conta</h1>

                    <div className="progress-bar">
                        <div className={`progress-step ${etapa >= 1 ? 'active' : ''}`}>1</div>
                        <div className={`progress-line ${etapa >= 2 ? 'active' : ''}`}></div>
                        <div className={`progress-step ${etapa >= 2 ? 'active' : ''}`}>2</div>
                        <div className={`progress-line ${etapa >= 3 ? 'active' : ''}`}></div>
                        <div className={`progress-step ${etapa >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                    <p className="step-subtitle">
                        {etapa === 1 && 'Identificação Simples'}
                        {etapa === 2 && 'Segurança (Apoio)'}
                        {etapa === 3 && 'O seu Perfil Físico'}
                    </p>
                </div>

                <form onSubmit={etapa === 3 ? finalizar : (e) => { e.preventDefault(); avancar(); }}>
                    
                    {/* ETAPA 1: Identificação */}
                    {etapa === 1 && (
                        <div className="step-content fade-in">
                            <div className="input-group">
                                <label>Como gosta de ser chamado(a)?</label>
                                <div className="input-with-icon">
                                    <User size={22} className="input-icon" />
                                    <input type="text" name="nome" value={dados.nome} onChange={handleChange} placeholder="Seu nome" required className="input-control" />
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>A sua Idade</label>
                                    <div className="input-with-icon">
                                        <Calendar size={22} className="input-icon" />
                                        <input type="text" inputMode="numeric" name="idade" value={dados.idade} onChange={handleChange} placeholder="Ex: 75" required className="input-control" />
                                    </div>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Seu Celular (Será o seu login)</label>
                                <div className="input-with-icon">
                                    <Phone size={22} className="input-icon" />
                                    <input type="tel" name="telemovel" value={dados.telemovel} onChange={handleChange} placeholder="(00) 00000-0000" required className="input-control" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Crie um PIN (4 números fáceis)</label>
                                <div className="input-with-icon">
                                    <Lock size={22} className="input-icon" />
                                    <input type="text" inputMode="numeric" maxLength="4" name="pin" value={dados.pin} onChange={handleChange} placeholder="****" required className="input-control" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ETAPA 2: Emergência */}
                    {etapa === 2 && (
                        <div className="step-content fade-in">
                            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <AlertCircle color="#ef4444" size={32} />
                                <p style={{ margin: 0, color: '#991b1b', fontWeight: '500' }}>
                                    Isto servirá para o <strong>Botão de SOS</strong> poder avisar alguém de confiança.
                                </p>
                            </div>

                            <div className="input-group">
                                <label>Nome do Familiar/Amigo</label>
                                <input type="text" name="contatoEmergenciaNome" value={dados.contatoEmergenciaNome} onChange={handleChange} placeholder="Ex: João (Filho)" required className="input-control no-icon" />
                            </div>
                            <div className="input-group">
                                <label>Celular do Familiar/Amigo</label>
                                <input type="tel" name="contatoEmergenciaTel" value={dados.contatoEmergenciaTel} onChange={handleChange} placeholder="(00) 00000-0000" required className="input-control no-icon" />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 3: Perfil Físico (Botões Grandes) */}
                    {etapa === 3 && (
                        <div className="step-content fade-in">
                            <div className="input-group">
                                <label>Como é a sua mobilidade na rua?</label>
                                <div className="grid-selecao">
                                    {opcoesMobilidade.map(opcao => (
                                        <button 
                                            type="button" 
                                            key={opcao}
                                            className={`btn-selecao ${dados.mobilidade === opcao ? 'ativo' : ''}`}
                                            onClick={() => setDados({...dados, mobilidade: opcao})}
                                        >
                                            {opcao}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label>Tem alguma destas condições?</label>
                                <div className="grid-selecao">
                                    {opcoesCondicoes.map(cond => (
                                        <button 
                                            type="button" 
                                            key={cond}
                                            className={`btn-selecao ${dados.condicoes.includes(cond) ? 'ativo' : ''}`}
                                            onClick={() => handleToggleCondicao(cond)}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions-footer">
                        {etapa > 1 ? (
                            <button type="button" onClick={voltar} className="btn-secondary">
                                <ArrowLeft size={20} /> Voltar
                            </button>
                        ) : (
                            <div style={{ width: '20px' }}></div>
                        )}

                        {etapa < 3 ? (
                            <button type="submit" className="btn-primary">
                                Próximo <ArrowRight size={24} />
                            </button>
                        ) : (
                            <button type="submit" className="btn-primary btn-success" disabled={carregando}>
                                {carregando ? 'Aguarde...' : <><CheckCircle2 size={24} /> Concluir</>}
                            </button>
                        )}
                    </div>
                </form>

                {etapa === 1 && (
                    <div className="toggle-mode fade-in">
                        <p>Já tem um PIN de acesso?</p>
                        <button type="button" onClick={() => navigate('/login')} className="btn-toggle">
                            Entrar na minha conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}