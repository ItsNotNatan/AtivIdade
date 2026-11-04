import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PhoneCall, PlayCircle, CheckCircle2, PauseCircle } from 'lucide-react';
import './Exercicio.css';

export default function Exercicio() {
    const navigate = useNavigate();
    
    // Fases: 0 (Preparo), 1 (Treino), 2 (Feedback), 3 (Conclusão)
    const [fase, setFase] = useState(0); 
    const [tempo, setTempo] = useState(600); // 10 minutos em segundos
    const [pausado, setPausado] = useState(false);

    const contatoEmergenciaTel = "11999999999";

    useEffect(() => {
        let intervalo;
        if (fase === 1 && !pausado && tempo > 0) {
            intervalo = setInterval(() => setTempo((t) => t - 1), 1000);
        } else if (tempo === 0 && fase === 1) {
            setFase(2);
        }
        return () => clearInterval(intervalo);
    }, [fase, pausado, tempo]);

    const formatarTempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${min}:${seg < 10 ? '0' : ''}${seg}`;
    };

    return (
        <div className="exercicio-layout fade-in">
            <a href={`tel:${contatoEmergenciaTel}`} className="btn-sos" aria-label="Ligar para emergência">
                <PhoneCall size={32} className="icone-telefone" />
            </a>

            <div className="exercicio-card">
                {fase < 3 && (
                    <button onClick={() => navigate(-1)} className="btn-voltar">
                        <ArrowLeft size={24} /> Voltar
                    </button>
                )}

                {fase === 0 && (
                    <>
                        <div className="text-center">
                            <h1 className="exercicio-titulo">Alongamento Matinal</h1>
                            <p className="exercicio-sub">10 minutos • Sentado</p>
                        </div>
                        <div className="preparo-box">
                            <h3>O que vai precisar:</h3>
                            <ul>
                                <li>Uma cadeira firme</li>
                                <li>Um copo de água por perto</li>
                            </ul>
                        </div>
                        <button onClick={() => setFase(1)} className="btn-gigante btn-verde">
                            <PlayCircle size={28} /> Iniciar Treino
                        </button>
                    </>
                )}

                {fase === 1 && (
                    <div className="text-center fade-in">
                        <h2 className="exercicio-titulo">Rotação de Ombros</h2>
                        <p className="exercicio-sub">Mantenha a respiração suave</p>
                        
                        <div className="video-placeholder">
                            <div className="emoji-grande">🔄</div>
                            <h2 style={{ fontSize: '3rem', margin: 0, color: '#1f2937' }}>
                                {formatarTempo(tempo)}
                            </h2>
                        </div>

                        <button 
                            onClick={() => setPausado(!pausado)} 
                            className="btn-gigante"
                            style={{ backgroundColor: pausado ? '#059669' : '#d97706', color: 'white', marginBottom: '1rem' }}
                        >
                            {pausado ? <PlayCircle size={28} /> : <PauseCircle size={28} />}
                            {pausado ? 'Retomar' : 'Pausar'}
                        </button>
                        
                        <button onClick={() => setFase(2)} className="btn-voltar" style={{ width: '100%', justifyContent: 'center' }}>
                            Terminar mais cedo
                        </button>
                    </div>
                )}

                {fase === 2 && (
                    <div className="text-center fade-in">
                        <h2 className="pergunta-feedback">Como sentiu o exercício de hoje?</h2>
                        <div className="feedback-botoes">
                            <button onClick={() => setFase(3)} className="btn-feedback btn-facil">
                                😃 Foi fácil
                            </button>
                            <button onClick={() => setFase(3)} className="btn-feedback btn-bom">
                                🙂 Na medida certa
                            </button>
                            <button onClick={() => setFase(3)} className="btn-feedback btn-dificil">
                                🥵 Muito difícil
                            </button>
                        </div>
                    </div>
                )}

                {fase === 3 && (
                    <div className="text-center fade-in">
                        <div className="icone-sucesso">
                            <CheckCircle2 size={64} color="#059669" />
                        </div>
                        <h1 className="exercicio-titulo">Parabéns!</h1>
                        <p className="exercicio-sub">Concluiu o seu treino de hoje.</p>
                        
                        <div className="stats-recompensa">
                            +10 Minutos de Movimento
                        </div>

                        <button onClick={() => navigate('/dashboard')} className="btn-gigante btn-verde" style={{ marginTop: '2rem' }}>
                            Voltar ao Início
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}