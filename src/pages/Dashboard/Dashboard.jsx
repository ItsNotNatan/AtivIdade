import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, PlayCircle, Activity, Award, Calendar, FileText } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();

    // Num cenário real, estes dados viriam do authStore e da API
    const estatisticas = {
        diasSeguidos: 3,
        minutosSemana: 45,
        treinosMes: 12
    };

    return (
        <div className="dashboard-container fade-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Olá, Natan! 👋</h1>
                    <p className="dash-subtitle">Aqui está o seu progresso. Vamos manter o ritmo?</p>
                </div>
            </header>

            {/* Estatísticas Principais */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-bg"><Award size={28} color="#059669" /></div>
                    <div className="stat-info">
                        <span className="stat-value">{estatisticas.diasSeguidos}</span>
                        <span className="stat-label">Dias seguidos</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-bg"><Activity size={28} color="#059669" /></div>
                    <div className="stat-info">
                        <span className="stat-value">{estatisticas.minutosSemana}</span>
                        <span className="stat-label">Minutos na semana</span>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/relatorios')} style={{ cursor: 'pointer', borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}>
                    <div className="stat-icon-bg" style={{ backgroundColor: '#bfdbfe' }}><FileText size={28} color="#1d4ed8" /></div>
                    <div className="stat-info">
                        <span className="stat-value" style={{ color: '#1d4ed8' }}>{estatisticas.treinosMes}</span>
                        <span className="stat-label" style={{ color: '#1e40af' }}>Ver Relatório</span>
                    </div>
                </div>
            </div>

            {/* Destaque do Dia Seguro */}
            <section className="daily-highlight">
                <div className="daily-content">
                    <div className="daily-badge">
                        <Sun size={18} /> Recomendado para si (Cadeira)
                    </div>
                    <h2 className="daily-title">Alongamento Matinal Suave</h2>
                    <p className="daily-desc">10 minutos para soltar as articulações. Totalmente sentado e sem impacto nos joelhos.</p>

                    <button onClick={() => navigate('/exercicio')} className="btn-start">
                        <PlayCircle size={24} /> Começar Exercício
                    </button>
                </div>
                <div className="daily-image">
                    <div className="image-placeholder">🧘‍♀️</div>
                </div>
            </section>

            {/* Acesso Rápido a Categorias */}
            <h3 className="section-title">Escolher outra atividade</h3>
            <div className="categories-grid">
                <button className="category-card">
                    <div className="cat-icon flex-center">🪑</div>
                    <span>Exercícios Sentado</span>
                </button>
                <button className="category-card">
                    <div className="cat-icon flex-center">🚶</div>
                    <span>Caminhada Leve</span>
                </button>
                <button className="category-card">
                    <div className="cat-icon flex-center">🧘‍♂️</div>
                    <span>Respiração</span>
                </button>
            </div>
        </div>
    );
}