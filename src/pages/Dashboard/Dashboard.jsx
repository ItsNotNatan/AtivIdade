// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Sun, PlayCircle, Activity, Award, FileText, 
    Users, AlertTriangle, Building, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { usuario } = useAuthStore();

    const tipoPerfil = usuario?.tipo || 'idoso';

    // ==========================================
    // 1. VISÃO DO GESTOR INSTITUCIONAL
    // ==========================================
    if (tipoPerfil === 'gestor') {
        return (
            <div className="dashboard-container fade-in">
                <header className="dash-header">
                    <div>
                        <h1 className="dash-title">Painel de Coordenação Geral 🏛️</h1>
                        <p className="dash-subtitle">
                            Instituição: <strong>{usuario.instituicao}</strong> • Responsável: {usuario.nome}
                        </p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-bg" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            <Users size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">48</span>
                            <span className="stat-label">Idosos inscritos</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-bg" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">84%</span>
                            <span className="stat-label">Taxa de assiduidade</span>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
                        <div className="stat-icon-bg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                            <ShieldAlert size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: '#dc2626' }}>2</span>
                            <span className="stat-label" style={{ color: '#991b1b' }}>Alertas de queixa</span>
                        </div>
                    </div>
                </div>

                <h3 className="section-title">Turmas em Andamento</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1f2937' }}>Turma Cadeira & Alongamento</h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>Profissional: Dra. Camila</p>
                        <p style={{ margin: '0.25rem 0 1rem 0', color: '#6b7280', fontSize: '0.95rem' }}>16 Participantes • 1 Queixa de dor</p>
                        <button onClick={() => navigate('/turma')} className="btn-editar" style={{ margin: 0 }}>
                            Auditar Turma
                        </button>
                    </div>

                    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1f2937' }}>Turma Caminhada & Equilíbrio</h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>Profissional: Dr. Marcos</p>
                        <p style={{ margin: '0.25rem 0 1rem 0', color: '#6b7280', fontSize: '0.95rem' }}>18 Participantes • Todos em dia</p>
                        <button onClick={() => navigate('/turma')} className="btn-editar" style={{ margin: 0 }}>
                            Auditar Turma
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // 2. VISÃO DO PROFISSIONAL (FISIOTERAPEUTA)
    // ==========================================
    if (tipoPerfil === 'profissional') {
        return (
            <div className="dashboard-container fade-in">
                <header className="dash-header">
                    <div>
                        <h1 className="dash-title">Olá, {usuario.nome}! 🩺</h1>
                        <p className="dash-subtitle">
                            Área: {usuario.especialidade} • Supervisão diária dos alunos.
                        </p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-bg"><Award size={28} color="#059669" /></div>
                        <div className="stat-info">
                            <span className="stat-value">12</span>
                            <span className="stat-label">Concluíram hoje</span>
                        </div>
                    </div>
                    <div className="stat-card" style={{ borderColor: '#fca5a5' }}>
                        <div className="stat-icon-bg" style={{ backgroundColor: '#fee2e2' }}><AlertTriangle size={28} color="#dc2626" /></div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: '#dc2626' }}>1</span>
                            <span className="stat-label" style={{ color: '#991b1b' }}>Relatou dificuldade</span>
                        </div>
                    </div>
                </div>

                <section className="daily-highlight" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                    <div className="daily-content">
                        <h2 className="daily-title">Acompanhar Minha Turma</h2>
                        <p className="daily-desc">Consulte a assiduidade, contactos de emergência e histórico de treinos dos seus alunos.</p>
                        <button onClick={() => navigate('/turma')} className="btn-start" style={{ color: '#1d4ed8' }}>
                            <Users size={24} /> Abrir Lista de Alunos
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    // ==========================================
    // 3. VISÃO DO IDOSO (PADRÃO)
    // ==========================================
    return (
        <div className="dashboard-container fade-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Olá, {usuario?.nome || 'Natan'}! 👋</h1>
                    <p className="dash-subtitle">Pronto para o movimento de hoje?</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-bg"><Award size={28} color="#059669" /></div>
                    <div className="stat-info">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Dias seguidos</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-bg"><Activity size={28} color="#059669" /></div>
                    <div className="stat-info">
                        <span className="stat-value">45</span>
                        <span className="stat-label">Minutos na semana</span>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/relatorios')} style={{ cursor: 'pointer', borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}>
                    <div className="stat-icon-bg" style={{ backgroundColor: '#bfdbfe' }}><FileText size={28} color="#1d4ed8" /></div>
                    <div className="stat-info">
                        <span className="stat-value" style={{ color: '#1d4ed8' }}>12</span>
                        <span className="stat-label" style={{ color: '#1e40af' }}>Ver Relatório</span>
                    </div>
                </div>
            </div>

            <section className="daily-highlight">
                <div className="daily-content">
                    <div className="daily-badge">
                        <Sun size={18} /> Sugestão de Hoje (Cadeira)
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
        </div>
    );
}