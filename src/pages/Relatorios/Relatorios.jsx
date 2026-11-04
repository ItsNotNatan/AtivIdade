import React from 'react';
import { FileText, Printer, HeartPulse } from 'lucide-react';
import './Relatorios.css';

export default function Relatorios() {
    const perfil = {
        nome: 'Natan',
        idade: 72,
        mobilidade: 'Caminho sem ajuda',
        condicoes: ['Dor nos Joelhos', 'Pressão Alta'],
        contatoEmergencia: 'João (Filho) - (11) 98888-8888'
    };

    const historico = [
        {
            id: 1,
            data: 'Hoje, 09:30',
            titulo: 'Alongamento Matinal Suave',
            duracao: '10 min',
            icone: '🧘‍♀️',
            feedback: 'Na medida certa',
            tipoFeedback: 'bom'
        },
        {
            id: 2,
            data: 'Ontem, 16:00',
            titulo: 'Exercício Sentado para Braços',
            duracao: '12 min',
            icone: '🪑',
            feedback: 'Foi fácil',
            tipoFeedback: 'facil'
        },
        {
            id: 3,
            data: '3 dias atrás, 10:15',
            titulo: 'Caminhada Leve e Respiração',
            duracao: '15 min',
            icone: '🚶',
            feedback: 'Muito difícil',
            tipoFeedback: 'dificil'
        }
    ];

    const imprimirRelatorio = () => {
        window.print();
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
                    <Printer size={22} /> Imprimir / Guardar em PDF
                </button>
            </header>

            <section className="resumo-medico-card">
                <div className="resumo-medico-topo">
                    <HeartPulse size={26} strokeWidth={2.5} />
                    <h2>Ficha de Acompanhamento — {perfil.nome} ({perfil.idade} anos)</h2>
                </div>
                
                <p style={{ margin: '0 0 0.75rem 0', color: '#4b5563', fontSize: '1.05rem' }}>
                    <strong>Contacto de Emergência:</strong> {perfil.contatoEmergencia}
                </p>

                <div className="resumo-tags">
                    <span className="tag-mobilidade">Mobilidade: {perfil.mobilidade}</span>
                    {perfil.condicoes.map((cond, idx) => (
                        <span key={idx} className="tag-condicao">Atenção: {cond}</span>
                    ))}
                </div>
            </section>

            <h2 className="secao-historico-titulo">Histórico Recente</h2>
            <div className="lista-atividades">
                {historico.map((item) => (
                    <article key={item.id} className="atividade-item">
                        <div className="atividade-info-principal">
                            <div className="atividade-icone">{item.icone}</div>
                            <div className="atividade-detalhes">
                                <h3>{item.titulo}</h3>
                                <p>{item.data} • {item.duracao}</p>
                            </div>
                        </div>

                        <div className="atividade-status">
                            <span className={`badge-feedback badge-${item.tipoFeedback}`}>
                                {item.feedback}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}