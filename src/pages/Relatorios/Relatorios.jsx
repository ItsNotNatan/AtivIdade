// src/pages/Relatorios/Relatorios.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Printer, HeartPulse, Activity } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { API_URL } from '../../config';
import './Relatorios.css';

export default function Relatorios() {
    const { usuario } = useAuthStore();
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Busca o histórico real de atividades do banco de dados quando a página carrega
    useEffect(() => {
        if (usuario?.id) {
            buscarHistorico();
        }
    }, [usuario]);

    const buscarHistorico = async () => {
        setCarregando(true);
        try {
            const resposta = await fetch(`${API_URL}/api/atividades/${usuario.id}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setHistorico(dados);
            }
        } catch (erro) {
            console.error("Erro ao buscar histórico de exercícios:", erro);
        } finally {
            setCarregando(false);
        }
    };

    const imprimirRelatorio = () => {
        window.print();
    };

    // Formata a data e hora retornada pelo SQLite para o padrão brasileiro
    const formatarData = (dataIso) => {
        if (!dataIso) return '';
        const data = new Date(dataIso);
        return data.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Mapeia o feedback para textos e emojis amigáveis
    const formatarFeedback = (feedback) => {
        switch(feedback) {
            case 'facil': return '😃 Fácil';
            case 'bom': return '🙂 Na medida';
            case 'dificil': return '🥵 Muito difícil';
            default: return '✅ Concluído';
        }
    };

    // Prepara os dados do perfil do Idoso a partir da store
    const perfil = {
        nome: usuario?.nome || 'Paciente',
        idade: usuario?.idade || '--',
        mobilidade: usuario?.mobilidade || 'Não informada',
        condicoes: usuario?.condicoes ? usuario.condicoes.split(',').map(c => c.trim()).filter(Boolean) : [],
        contatoEmergencia: `${usuario?.contatoEmergenciaNome || ''} - ${usuario?.contatoEmergenciaTel || ''}`
    };

    return (
        <div className="relatorios-container fade-in">
            <header className="relatorios-header">
                <div>
                    <h1 className="relatorios-title">Relatório de Progresso</h1>
                    <p className="relatorios-subtitle">
                        Acompanhamento das atividades físicas para consulta própria ou médica.
                    </p>
                </div>
                <button onClick={imprimirRelatorio} className="btn-imprimir">
                    <Printer size={22} /> Imprimir / PDF
                </button>
            </header>

            {/* RESUMO CLÍNICO DO PACIENTE */}
            <section className="resumo-medico-card">
                <div className="resumo-medico-topo">
                    <HeartPulse size={26} strokeWidth={2.5} />
                    <h2>Ficha de Acompanhamento — {perfil.nome} ({perfil.idade} anos)</h2>
                </div>
                
                <p style={{ margin: '0 0 0.75rem 0', color: '#4b5563', fontSize: '1.05rem' }}>
                    <strong>Contato de Emergência:</strong> {perfil.contatoEmergencia}
                </p>

                <div className="resumo-tags">
                    <span className="tag-mobilidade">Mobilidade: {perfil.mobilidade}</span>
                    {perfil.condicoes.map((cond, idx) => (
                        <span key={idx} className="tag-condicao">Atenção: {cond}</span>
                    ))}
                </div>
            </section>

            {/* LISTA DE HISTÓRICO REAL */}
            <h2 className="secao-historico-titulo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={24} color="#059669" /> Histórico Recente de Treinos
            </h2>
            
            <div className="lista-atividades">
                {carregando ? (
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Buscando registros...</p>
                ) : historico.length === 0 ? (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Nenhum exercício registrado ainda. Quando completar um treino, ele aparecerá aqui.</p>
                    </div>
                ) : (
                    historico.map((item) => (
                        <article key={item.id} className="atividade-item fade-in">
                            <div className="atividade-info-principal">
                                <div className="atividade-icone">
                                    {/* Icone muda com base no tipo de exercício */}
                                    {item.tipo === 'tempo' || item.tipo === 'isometria' ? '⏳' : 
                                     item.tipo === 'carga' ? '🏋️' : '🔄'}
                                </div>
                                <div className="atividade-detalhes">
                                    <h3>{item.titulo}</h3>
                                    <p>{formatarData(item.dataCriacao)} • {item.grupo || 'Exercício'}</p>
                                </div>
                            </div>

                            <div className="atividade-status">
                                <span className={`badge-feedback badge-${item.feedback}`}>
                                    {formatarFeedback(item.feedback)}
                                </span>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}