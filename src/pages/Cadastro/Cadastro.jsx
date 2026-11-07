// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, User, Phone, Lock, Calendar, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAlert } from '../../components/AlertContext/AlertContext';
import './Cadastro.css';

export default function Cadastro() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [etapa, setEtapa] = useState(1);
    const [carregando, setCarregando] = useState(false);

    const [dados, setDados] = useState({
        nome: '', idade: '', telemovel: '', pin: '',
        contatoEmergenciaNome: '', contatoEmergenciaTel: '',
        mobilidade: 'Caminho sem ajuda', condicoes: []
    });

    const opcoesMobilidade = ["Caminho sem ajuda", "Uso bengala", "Uso andador", "Na cadeira de rodas"];
    const secoesCondicoes = [
        { titulo: "Articulações & Coluna", opcoes: ["Dor nos Joelhos", "Dor nos Ombros", "Coluna / Hérnia de Disco", "Osteoporose / Osteopenia", "Prótese ou Pino (Quadril/Joelho/Ombro)", "Cirurgia nos últimos 12 meses"] },
        { titulo: "Saúde & Coração", opcoes: ["Pressão Alta (Hipertensão)", "Diabetes", "Problemas Cardíacos (Arritmia/Infarto)", "Uso de Marca-passo", "Labirintite / Tontura frequente"] },
        { titulo: "Segurança & Medicamentos", opcoes: ["Caí nos últimos 6 meses", "Tomo remédio para o coração/pressão", "Tomo anticoagulante", "Prefiro exercícios sentado(a)"] }
    ];

    const aplicarMascaraTelefone = (valor) => {
        let v = valor.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
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
        if (name === 'nome' || name === 'contatoEmergenciaNome') novoValor = novoValor.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
        else if (name === 'idade') {
            novoValor = novoValor.replace(/\D/g, '');
            if (novoValor !== '' && parseInt(novoValor, 10) > 120) novoValor = '120';
        } 
        else if (name === 'telemovel' || name === 'contatoEmergenciaTel') novoValor = aplicarMascaraTelefone(novoValor);
        else if (name === 'pin') novoValor = novoValor.replace(/\D/g, '').slice(0, 4);
        setDados(prev => ({ ...prev, [name]: novoValor }));
    };

    const handleToggleCondicao = (condicao) => {
        setDados(prev => {
            let novas = prev.condicoes.includes(condicao) ? prev.condicoes.filter(c => c !== condicao) : [...prev.condicoes, condicao];
            return { ...prev, condicoes: novas };
        });
    };

    const avancar = () => setEtapa(prev => prev + 1);
    const voltar = () => setEtapa(prev => prev - 1);

    const finalizar = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const resposta = await fetch('http://localhost:3001/api/auth/registo', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
            });
            if (resposta.ok) {
                showAlert('Conta criada com sucesso! Faça login.', 'sucesso');
                navigate('/login');
            } else {
                const erroData = await resposta.json();
                showAlert(erroData.erro || 'Erro ao criar conta.', 'erro');
            }
        } catch (erro) {
            showAlert('Falha na comunicação com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="cadastro-container">
            <div className="cadastro-card fade-in" style={{ maxWidth: etapa === 3 ? '700px' : '550px' }}>
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
                        {etapa === 2 && 'Segurança (Contato SOS)'}
                        {etapa === 3 && 'Condições de Saúde e Articulações'}
                    </p>
                </div>

                <form onSubmit={etapa === 3 ? finalizar : (e) => { e.preventDefault(); avancar(); }}>
                    {etapa === 1 && (
                        <div className="step-content fade-in">
                            <div className="input-group"><label>Como gosta de ser chamado(a)?</label><div className="input-with-icon"><User size={22} className="input-icon" /><input type="text" name="nome" value={dados.nome} onChange={handleChange} placeholder="Seu nome" required className="input-control" /></div></div>
                            <div className="input-group"><label>A sua Idade</label><div className="input-with-icon"><Calendar size={22} className="input-icon" /><input type="text" inputMode="numeric" name="idade" value={dados.idade} onChange={handleChange} placeholder="Ex: 75" required className="input-control" /></div></div>
                            <div className="input-group"><label>Seu Celular (Será o seu login)</label><div className="input-with-icon"><Phone size={22} className="input-icon" /><input type="tel" inputMode="numeric" name="telemovel" value={dados.telemovel} onChange={handleChange} placeholder="(00) 00000-0000" required className="input-control" /></div></div>
                            <div className="input-group"><label>Crie um PIN (4 números fáceis)</label><div className="input-with-icon"><Lock size={22} className="input-icon" /><input type="password" inputMode="numeric" maxLength="4" name="pin" value={dados.pin} onChange={handleChange} placeholder="****" required className="input-control" /></div></div>
                        </div>
                    )}
                    {etapa === 2 && (
                        <div className="step-content fade-in">
                            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <AlertCircle color="#ef4444" size={32} />
                                <p style={{ margin: 0, color: '#991b1b', fontWeight: '500' }}>Isto servirá para o <strong>Botão de SOS</strong> poder avisar alguém de confiança.</p>
                            </div>
                            <div className="input-group"><label>Nome do Familiar/Amigo</label><input type="text" name="contatoEmergenciaNome" value={dados.contatoEmergenciaNome} onChange={handleChange} placeholder="Ex: João (Filho)" required className="input-control no-icon" /></div>
                            <div className="input-group"><label>Celular do Familiar/Amigo</label><input type="tel" inputMode="numeric" name="contatoEmergenciaTel" value={dados.contatoEmergenciaTel} onChange={handleChange} placeholder="(00) 00000-0000" required className="input-control no-icon" /></div>
                        </div>
                    )}
                    {etapa === 3 && (
                        <div className="step-content fade-in" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div className="input-group">
                                <label>Como é a sua mobilidade?</label>
                                <div className="grid-selecao">
                                    {opcoesMobilidade.map(opcao => (
                                        <button type="button" key={opcao} className={`btn-selecao ${dados.mobilidade === opcao ? 'ativo' : ''}`} onClick={() => setDados({ ...dados, mobilidade: opcao })}>{opcao}</button>
                                    ))}
                                </div>
                            </div>
                            {secoesCondicoes.map((secao) => (
                                <div key={secao.titulo} className="input-group" style={{ marginTop: '1.5rem' }}>
                                    <label style={{ fontSize: '1rem', color: '#047857', borderBottom: '1px solid #d1fae5', paddingBottom: '0.25rem' }}>{secao.titulo}</label>
                                    <div className="grid-selecao" style={{ marginTop: '0.5rem' }}>
                                        {secao.opcoes.map(cond => (
                                            <button type="button" key={cond} className={`btn-selecao ${dados.condicoes.includes(cond) ? 'ativo' : ''}`} onClick={() => handleToggleCondicao(cond)} style={{ fontSize: '0.95rem', padding: '0.75rem' }}>{cond}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="form-actions-footer">
                        {etapa > 1 ? <button type="button" onClick={voltar} className="btn-secondary"><ArrowLeft size={20} /> Voltar</button> : <div style={{ width: '20px' }}></div>}
                        {etapa < 3 ? <button type="submit" className="btn-primary">Próximo <ArrowRight size={24} /></button> : <button type="submit" className="btn-primary btn-success" disabled={carregando}>{carregando ? 'Aguarde...' : <><CheckCircle2 size={24} /> Concluir Cadastro</>}</button>}
                    </div>
                </form>
                {etapa === 1 && (
                    <div className="toggle-mode fade-in"><p>Já tem um PIN de acesso?</p><button type="button" onClick={() => navigate('/login')} className="btn-toggle">Entrar na minha conta</button></div>
                )}
            </div>
        </div>
    );
}