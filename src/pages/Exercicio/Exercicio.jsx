// src/pages/Exercicio/Exercicio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, PhoneCall, PlayCircle, CheckCircle2, PauseCircle, CheckSquare, Send } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext'; 
import { API_URL } from '../../config';
import './Exercicio.css';

export default function Exercicio() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario } = useAuthStore();
    const { showAlert, showConfirm } = useAlert();
    
    const filaTreinos = location.state?.filaTreinos || [ location.state?.treino || { titulo: 'Movimento Livre', tipo: 'tempo', duracaoMinutos: 5 } ];
    const nomeGrupo = location.state?.nomeGrupo || 'Meu Treino';

    const [indiceAtual, setIndiceAtual] = useState(0);
    const treinoPrescrito = filaTreinos[indiceAtual];
    
    const isTempo = treinoPrescrito.tipo === 'tempo' || treinoPrescrito.tipo === 'isometria';
    
    const [fase, setFase] = useState(0); 
    const [tempo, setTempo] = useState(0);
    const [pausado, setPausado] = useState(false);
    const [serieAtual, setSerieAtual] = useState(1);

    // Escala de Dor/Esforço (0 a 10) e Caixa de Texto
    const [notaEsforco, setNotaEsforco] = useState(null);
    const [observacao, setObservacao] = useState('');
    
    const [sessaoEncerradaCedo, setSessaoEncerradaCedo] = useState(false);

    useEffect(() => {
        setTempo(treinoPrescrito.duracaoMinutos ? treinoPrescrito.duracaoMinutos * 60 : 0);
        setSerieAtual(1);
        setPausado(false);
        setNotaEsforco(null);
        setObservacao('');
    }, [indiceAtual, treinoPrescrito]);

    useEffect(() => {
        let intervalo;
        if (fase === 1 && isTempo && !pausado && tempo > 0) {
            intervalo = setInterval(() => setTempo((t) => t - 1), 1000);
        } else if (fase === 1 && isTempo && tempo === 0 && treinoPrescrito.tipo === 'tempo') {
            setFase(2);
        } else if (fase === 1 && isTempo && tempo === 0 && treinoPrescrito.tipo === 'isometria') {
            concluirSerie();
        }
        return () => clearInterval(intervalo);
    }, [fase, pausado, tempo, isTempo]);

    const formatarTempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg < 10 ? '0' : ''}${seg}`;
    };

    const concluirSerie = () => {
        if (serieAtual < (treinoPrescrito.series || 1)) {
            setSerieAtual(s => s + 1);
            if (treinoPrescrito.tipo === 'isometria') setTempo(treinoPrescrito.duracaoMinutos); 
        } else {
            setFase(2);
        }
    };

    const handleDesistir = async () => {
        const confirmou = await showConfirm('Tem certeza que deseja abandonar o treino? Ficará registrado na sua ficha que você desistiu desta sessão.');
        if (confirmou) {
            const payload = {
                usuarioId: usuario.id,
                titulo: treinoPrescrito.titulo,
                grupo: nomeGrupo,
                tipo: treinoPrescrito.tipo,
                duracaoSegundos: 0,
                feedback: 'Status: Abortou / Desistiu do exercício.'
            };
            fetch(`${API_URL}/api/atividades`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(console.error);
            navigate(-1);
        }
    };

    const handleFinalizarCedo = async () => {
        const exerciciosFeitos = indiceAtual + 1;
        const total = filaTreinos.length;
        
        if (exerciciosFeitos < total) {
            const confirmou = await showConfirm(`Você está encerrando antes de completar todos os exercícios (${exerciciosFeitos} de ${total}). Deseja finalizar a sessão e salvar o progresso atual?`);
            if (confirmou) {
                setSessaoEncerradaCedo(true);
                setFase(2); 
            }
        } else {
            setFase(2); 
        }
    };

    // =========================================================================
    // NOVO BOTÃO DE SOS CORRIGIDO (Envia o alerta para o Profissional)
    // =========================================================================
    const lidarComSos = async (e) => {
        e.preventDefault(); // Impede o navegador de tentar fazer chamadas ou abrir apps
        
        if (usuario) {
            const confirmou = await showConfirm('Pedir ajuda ao instrutor agora? Um alerta de emergência será enviado imediatamente para o painel dele.');
            if (!confirmou) return;

            try {
                const res = await fetch(`${API_URL}/api/alertas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuarioId: usuario.id, 
                        tipo: 'sos', 
                        mensagem: 'O paciente acionou o botão de emergência durante o exercício!',
                        treino: treinoPrescrito.titulo, 
                        grupo: nomeGrupo                
                    })
                });
                
                if (res.ok) {
                    showAlert('Alerta enviado! O instrutor foi notificado e virá ajudar.', 'sucesso');
                } else {
                    showAlert('Erro ao enviar alerta. Tente chamar alguém próximo.', 'erro');
                }
            } catch (error) {
                console.error(error);
                showAlert('Erro de conexão ao enviar o alerta.', 'erro');
            }
        }
    };

    const enviarFeedback = () => {
        if (usuario) {
            const precisaDeAlerta = notaEsforco >= 7 || observacao.trim().length > 0;

            if (precisaDeAlerta) {
                fetch(`${API_URL}/api/alertas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuarioId: usuario.id, 
                        tipo: notaEsforco >= 8 ? 'sos' : 'dificuldade', 
                        mensagem: `Relatou esforço Nível ${notaEsforco}/10. ${observacao.trim() ? `Queixa do Utente: "${observacao.trim()}"` : ''}`,
                        treino: treinoPrescrito.titulo, 
                        grupo: nomeGrupo                
                    })
                }).catch(console.error);
            }
            
            const textoIncompleto = sessaoEncerradaCedo ? ` [Sessão Incompleta: Fez ${indiceAtual + 1} de ${filaTreinos.length}]` : '';
            
            const payload = { 
                ...treinoPrescrito, 
                usuarioId: usuario.id,
                duracaoSegundos: (treinoPrescrito.duracaoMinutos || 0) * 60,
                feedback: `Esforço: ${notaEsforco}/10. ${observacao.trim()}${textoIncompleto}` 
            };
            
            fetch(`${API_URL}/api/atividades`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload)
            }).catch(console.error);
            
            if (treinoPrescrito.id) {
                fetch(`${API_URL}/api/prescricoes/${treinoPrescrito.id}`, { method: 'DELETE' }).catch(console.error);
            }
        }

        if (sessaoEncerradaCedo || indiceAtual >= filaTreinos.length - 1) {
            setFase(3); 
        } else {
            setIndiceAtual(prev => prev + 1);
            setFase(0); 
        }
    };

    const getCorEscala = (nota) => {
        if (nota <= 3) return '#22c55e'; 
        if (nota <= 6) return '#f59e0b'; 
        return '#ef4444'; 
    };

    return (
        <div className="exercicio-layout fade-in">
            
            {/* O BOTÃO SOS AGORA É UM <button> E NÃO UM <a href> */}
            <button onClick={lidarComSos} className="btn-sos" aria-label="Pedir Ajuda ao Instrutor">
                <PhoneCall size={32} className="icone-telefone" />
            </button>

            <div className="exercicio-card">
                {fase < 3 && (
                    <button onClick={handleDesistir} className="btn-voltar">
                        <ArrowLeft size={24} /> Voltar ao Início
                    </button>
                )}

                {/* FASE 0: PLAYLIST */}
                {fase === 0 && (
                    <div className="fade-in">
                        <div className="text-center" style={{ marginBottom: '1.5rem' }}>
                            <h1 className="exercicio-titulo">{nomeGrupo}</h1>
                            <p className="exercicio-sub">
                                {indiceAtual === 0 ? 'Lista de exercícios programados para agora:' : 'Progresso da sua sessão:'}
                            </p>
                        </div>
                        
                        <div className="preparo-box" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filaTreinos.map((t, idx) => {
                                    let icone = '⏳';
                                    let corFundo = 'white';
                                    let corTexto = '#64748b';
                                    let opacidade = 1;
                                    
                                    if (idx < indiceAtual) { icone = '✅'; corFundo = '#dcfce7'; corTexto = '#166534'; } 
                                    else if (idx === indiceAtual) { icone = '▶️'; corFundo = '#eff6ff'; corTexto = '#1d4ed8'; } 
                                    else { opacidade = 0.5; }

                                    return (
                                        <div key={t.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: corFundo, border: '1px solid #e2e8f0', color: corTexto, opacity: opacidade, transition: 'all 0.3s' }}>
                                            <span style={{ fontSize: '1.25rem' }}>{icone}</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: idx === indiceAtual ? 'bold' : '600' }}>{idx + 1}. {t.titulo}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button onClick={() => setFase(1)} className="btn-gigante btn-verde" style={{ marginTop: '1rem' }}>
                            <PlayCircle size={28} /> {indiceAtual === 0 ? 'Começar Primeiro Exercício' : 'Continuar Próximo Exercício'}
                        </button>
                    </div>
                )}

                {/* FASE 1: EXECUÇÃO DO EXERCÍCIO */}
                {fase === 1 && (
                    <div className="text-center fade-in">
                        <h2 className="exercicio-titulo">{treinoPrescrito.titulo}</h2>
                        
                        {treinoPrescrito.gifUrl ? (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                {treinoPrescrito.gifUrl.includes('data:video') || treinoPrescrito.gifUrl.match(/\.(mp4|webm)$/i) ? (
                                    <video src={treinoPrescrito.gifUrl} autoPlay loop muted playsInline style={{ width: '100%', maxWidth: '320px', maxHeight: '260px', objectFit: 'contain' }} />
                                ) : (
                                    <img src={treinoPrescrito.gifUrl} alt={treinoPrescrito.titulo} referrerPolicy="no-referrer" style={{ width: '100%', maxWidth: '320px', maxHeight: '260px', objectFit: 'contain', backgroundColor: '#fff' }} />
                                )}
                            </div>
                        ) : (
                            <div className="video-placeholder">
                                <div className="emoji-grande">{isTempo ? '⏳' : '🔄'}</div>
                            </div>
                        )}
                        
                        {isTempo && (
                            <>
                                <p className="exercicio-sub">{treinoPrescrito.tipo === 'isometria' ? `Série ${serieAtual} de ${treinoPrescrito.series}` : 'Mantenha o ritmo suave'}</p>
                                <h2 style={{ fontSize: '4rem', margin: '0 0 1rem 0', color: '#1f2937' }}>{formatarTempo(tempo)}</h2>
                                <button onClick={() => setPausado(!pausado)} className="btn-gigante" style={{ backgroundColor: pausado ? '#059669' : '#d97706', color: 'white', marginBottom: '1rem' }}>
                                    {pausado ? <PlayCircle size={28} /> : <PauseCircle size={28} />} {pausado ? 'Retomar' : 'Pausar'}
                                </button>
                            </>
                        )}

                        {(treinoPrescrito.tipo === 'repeticao' || treinoPrescrito.tipo === 'carga') && (
                            <>
                                <p className="exercicio-sub">Faça {treinoPrescrito.repeticoes} repetições com calma.</p>
                                <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#1f2937' }}>Série {serieAtual} de {treinoPrescrito.series}</h2>
                                {treinoPrescrito.carga && <p style={{ fontWeight: 'bold', color: '#059669', marginBottom: '1rem' }}>Usando: {treinoPrescrito.carga}</p>}
                                <button onClick={concluirSerie} className="btn-gigante btn-verde" style={{ marginBottom: '1rem' }}>
                                    <CheckSquare size={28} /> Completei a Série {serieAtual}
                                </button>
                            </>
                        )}

                        {treinoPrescrito.tipo === 'meta' && (
                            <>
                                <p className="exercicio-sub">Objetivo: {treinoPrescrito.meta}</p>
                                <button onClick={() => setFase(2)} className="btn-gigante btn-verde" style={{ marginBottom: '1rem' }}>
                                    <CheckCircle2 size={28} /> Concluí a Tarefa
                                </button>
                            </>
                        )}

                        {treinoPrescrito.tipo !== 'meta' && (
                            <button onClick={handleFinalizarCedo} className="btn-voltar" style={{ width: '100%', justifyContent: 'center' }}>
                                {indiceAtual < filaTreinos.length - 1 ? 'Encerrar Sessão Antecipadamente' : 'Finalizar Exercício Agora'}
                            </button>
                        )}
                    </div>
                )}

                {/* FASE 2: AVALIAÇÃO DE FEEDBACK CLÍNICO (ESCALA 0 a 10) */}
                {fase === 2 && (
                    <div className="text-center fade-in">
                        <h2 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.6rem' }}>Qual foi o nível de esforço ou dor?</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1rem' }}>Clique num número de 0 (Nenhum) a 10 (Muito Difícil)</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nota => (
                                <button
                                    key={nota}
                                    onClick={() => setNotaEsforco(nota)}
                                    style={{
                                        width: '50px', height: '50px', 
                                        fontSize: '1.4rem', fontWeight: 'bold',
                                        backgroundColor: notaEsforco === nota ? getCorEscala(nota) : '#f8fafc',
                                        color: notaEsforco === nota ? 'white' : '#334155',
                                        border: `2px solid ${notaEsforco === nota ? getCorEscala(nota) : '#cbd5e1'}`,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: notaEsforco === nota ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    {nota}
                                </button>
                            ))}
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>
                                Aconteceu algo? Descreva abaixo (Opcional):
                            </label>
                            <textarea 
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                placeholder="Ex: Senti o meu joelho estalar na terceira repetição..."
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', resize: 'none', height: '100px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button 
                            onClick={enviarFeedback} 
                            disabled={notaEsforco === null}
                            className="btn-gigante" 
                            style={{ 
                                backgroundColor: notaEsforco === null ? '#cbd5e1' : '#2563eb', 
                                color: 'white', 
                                opacity: notaEsforco === null ? 0.6 : 1 
                            }}
                        >
                            <Send size={28} /> {notaEsforco === null ? 'Selecione uma nota acima...' : 'Confirmar e Continuar'}
                        </button>
                    </div>
                )}

                {/* FASE 3: CONCLUSÃO */}
                {fase === 3 && (
                    <div className="text-center fade-in">
                        <div className="icone-sucesso">
                            <CheckCircle2 size={64} color={sessaoEncerradaCedo ? "#f59e0b" : "#059669"} />
                        </div>
                        <h1 className="exercicio-titulo">
                            {sessaoEncerradaCedo ? 'Sessão Concluída Parcialmente!' : 'Treino Completo!'}
                        </h1>
                        <p className="exercicio-sub">
                            {sessaoEncerradaCedo 
                                ? `Você registrou ${indiceAtual + 1} de ${filaTreinos.length} exercícios em "${nomeGrupo}". O importante é respeitar os seus limites!`
                                : `Completou todos os exercícios de "${nomeGrupo}". Excelente trabalho!`
                            }
                        </p>
                        <button onClick={() => navigate('/dashboard')} className="btn-gigante btn-verde" style={{ marginTop: '2rem' }}>
                            Voltar ao Painel Principal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}