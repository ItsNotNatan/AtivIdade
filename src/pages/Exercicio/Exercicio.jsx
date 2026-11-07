// src/pages/Exercicio/Exercicio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, PhoneCall, PlayCircle, CheckCircle2, PauseCircle, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Exercicio.css';

export default function Exercicio() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario } = useAuthStore();
    
    const treinoPrescrito = location.state?.treino || { 
        titulo: 'Movimento Livre', tipo: 'tempo', duracaoMinutos: 5 
    };
    
    const isTempo = treinoPrescrito.tipo === 'tempo' || treinoPrescrito.tipo === 'isometria';
    
    const [fase, setFase] = useState(0); 
    const [tempo, setTempo] = useState(treinoPrescrito.duracaoMinutos ? treinoPrescrito.duracaoMinutos * 60 : 0);
    const [pausado, setPausado] = useState(false);
    
    // Controlador para treinos de Série/Repetição
    const [serieAtual, setSerieAtual] = useState(1);

    const contatoEmergenciaTel = "11988888888";

    useEffect(() => {
        let intervalo;
        if (fase === 1 && isTempo && !pausado && tempo > 0) {
            intervalo = setInterval(() => setTempo((t) => t - 1), 1000);
        } else if (fase === 1 && isTempo && tempo === 0 && treinoPrescrito.tipo === 'tempo') {
            setFase(2);
        } else if (fase === 1 && isTempo && tempo === 0 && treinoPrescrito.tipo === 'isometria') {
            concluirSerie(); // Para isometria, o tempo acabar significa fim de 1 série
        }
        return () => clearInterval(intervalo);
    }, [fase, pausado, tempo, isTempo]);

    const formatarTempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg < 10 ? '0' : ''}${seg}`;
    };

    const concluirSerie = () => {
        if (serieAtual < treinoPrescrito.series) {
            setSerieAtual(s => s + 1);
            if (treinoPrescrito.tipo === 'isometria') setTempo(treinoPrescrito.duracaoMinutos); // Reseta o relógio para a próx série
        } else {
            setFase(2); // Terminou todas as séries
        }
    };

    const lidarComSos = async () => {
        if (!usuario) return;
        try {
            await fetch('http://localhost:3001/api/alertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuario.id, tipo: 'sos', mensagem: 'Paciente acionou SOS no meio do exercício.' })
            });
        } catch (error) { console.error(error); }
    };

    const lidarComFeedback = async (tipoFeedback) => {
        setFase(3); 
        if (!usuario) return;

        if (tipoFeedback === 'dificil') {
            try {
                await fetch('http://localhost:3001/api/alertas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuarioId: usuario.id, tipo: 'dificuldade', mensagem: `Relatou que o exercício (${treinoPrescrito.titulo}) foi muito difícil.` })
                });
            } catch (err) { console.error(err); }
        }

        try {
            // Mandamos o objeto do treino inteiro, adicionando apenas o feedback do paciente
            const payload = { ...treinoPrescrito, feedback: tipoFeedback };
            
            await fetch('http://localhost:3001/api/atividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (treinoPrescrito.id) {
                await fetch(`http://localhost:3001/api/prescricoes/${treinoPrescrito.id}`, { method: 'DELETE' });
            }
        } catch (error) { console.error(error); }
    };

    const renderDetalhesFase0 = () => {
        switch(treinoPrescrito.tipo) {
            case 'tempo': return <p className="exercicio-sub">Contínuo por {treinoPrescrito.duracaoMinutos} minutos</p>;
            case 'repeticao': return <p className="exercicio-sub">Faça {treinoPrescrito.series} séries de {treinoPrescrito.repeticoes} repetições</p>;
            case 'isometria': return <p className="exercicio-sub">{treinoPrescrito.series} séries sustentando por {treinoPrescrito.duracaoMinutos} segundos</p>;
            case 'carga': return <p className="exercicio-sub">{treinoPrescrito.series}x{treinoPrescrito.repeticoes} usando: <strong>{treinoPrescrito.carga}</strong></p>;
            case 'meta': return <p className="exercicio-sub">Sua Meta: <strong>{treinoPrescrito.meta}</strong></p>;
            default: return null;
        }
    };

    return (
        <div className="exercicio-layout fade-in">
            <a href={`tel:${contatoEmergenciaTel}`} onClick={lidarComSos} className="btn-sos" aria-label="Ligar para emergência">
                <PhoneCall size={32} className="icone-telefone" />
            </a>

            <div className="exercicio-card">
                {fase < 3 && (
                    <button onClick={() => navigate(-1)} className="btn-voltar">
                        <ArrowLeft size={24} /> Cancelar Treino
                    </button>
                )}

                {/* FASE 0: PREPARAÇÃO */}
                {fase === 0 && (
                    <>
                        <div className="text-center">
                            <h1 className="exercicio-titulo">{treinoPrescrito.titulo}</h1>
                            {renderDetalhesFase0()}
                        </div>
                        <div className="preparo-box">
                            <h3>Lembrete do Profissional:</h3>
                            <ul>
                                <li>Faça no seu ritmo</li>
                                <li>Pare se sentir qualquer dor</li>
                            </ul>
                        </div>
                        <button onClick={() => setFase(1)} className="btn-gigante btn-verde">
                            <PlayCircle size={28} /> Iniciar Agora
                        </button>
                    </>
                )}

                {/* FASE 1: EXECUÇÃO DINÂMICA */}
                {fase === 1 && (
                    <div className="text-center fade-in">
                        <h2 className="exercicio-titulo">{treinoPrescrito.titulo}</h2>
                        
                        {/* Se for Tempo ou Isometria (Cronômetro) */}
                        {isTempo && (
                            <>
                                <p className="exercicio-sub">{treinoPrescrito.tipo === 'isometria' ? `Série ${serieAtual} de ${treinoPrescrito.series}` : 'Mantenha o ritmo suave'}</p>
                                <div className="video-placeholder">
                                    <div className="emoji-grande">⏳</div>
                                    <h2 style={{ fontSize: '4rem', margin: 0, color: '#1f2937' }}>{formatarTempo(tempo)}</h2>
                                </div>
                                <button onClick={() => setPausado(!pausado)} className="btn-gigante" style={{ backgroundColor: pausado ? '#059669' : '#d97706', color: 'white', marginBottom: '1rem' }}>
                                    {pausado ? <PlayCircle size={28} /> : <PauseCircle size={28} />} {pausado ? 'Retomar' : 'Pausar'}
                                </button>
                            </>
                        )}

                        {/* Se for Repetição ou Carga (Contador Manual) */}
                        {(treinoPrescrito.tipo === 'repeticao' || treinoPrescrito.tipo === 'carga') && (
                            <>
                                <p className="exercicio-sub">Faça {treinoPrescrito.repeticoes} repetições com calma.</p>
                                <div className="video-placeholder">
                                    <div className="emoji-grande">🔄</div>
                                    <h2 style={{ fontSize: '3rem', margin: 0, color: '#1f2937' }}>Série {serieAtual} de {treinoPrescrito.series}</h2>
                                    {treinoPrescrito.carga && <p style={{ fontWeight: 'bold', color: '#059669' }}>Usando: {treinoPrescrito.carga}</p>}
                                </div>
                                <button onClick={concluirSerie} className="btn-gigante btn-verde" style={{ marginBottom: '1rem' }}>
                                    <CheckSquare size={28} /> Completei a Série {serieAtual}
                                </button>
                            </>
                        )}

                        {/* Se for Meta (Apenas Check) */}
                        {treinoPrescrito.tipo === 'meta' && (
                            <>
                                <p className="exercicio-sub">Objetivo: {treinoPrescrito.meta}</p>
                                <div className="video-placeholder" style={{ backgroundColor: '#f0fdf4', border: '2px dashed #059669' }}>
                                    <div className="emoji-grande">🚶</div>
                                    <h2 style={{ fontSize: '2rem', margin: 0, color: '#166534', padding: '0 1rem' }}>Ao terminar a meta, clique no botão abaixo.</h2>
                                </div>
                                <button onClick={() => setFase(2)} className="btn-gigante btn-verde" style={{ marginBottom: '1rem' }}>
                                    <CheckCircle2 size={28} /> Concluí a Tarefa
                                </button>
                            </>
                        )}

                        {treinoPrescrito.tipo !== 'meta' && (
                            <button onClick={() => setFase(2)} className="btn-voltar" style={{ width: '100%', justifyContent: 'center' }}>
                                Finalizar Treino Agora
                            </button>
                        )}
                    </div>
                )}

                {/* FASE 2: FEEDBACK */}
                {fase === 2 && (
                    <div className="text-center fade-in">
                        <h2 className="pergunta-feedback">Como sentiu o exercício?</h2>
                        <div className="feedback-botoes">
                            <button onClick={() => lidarComFeedback('facil')} className="btn-feedback btn-facil">😃 Foi fácil</button>
                            <button onClick={() => lidarComFeedback('bom')} className="btn-feedback btn-bom">🙂 Na medida certa</button>
                            <button onClick={() => lidarComFeedback('dificil')} className="btn-feedback btn-dificil">🥵 Muito difícil</button>
                        </div>
                    </div>
                )}

                {/* FASE 3: SUCESSO */}
                {fase === 3 && (
                    <div className="text-center fade-in">
                        <div className="icone-sucesso">
                            <CheckCircle2 size={64} color="#059669" />
                        </div>
                        <h1 className="exercicio-titulo">Muito Bem!</h1>
                        <p className="exercicio-sub">Prescrição concluída e enviada ao profissional.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn-gigante btn-verde" style={{ marginTop: '2rem' }}>
                            Voltar ao Painel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}