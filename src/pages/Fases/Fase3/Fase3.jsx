// src/pages/Fases/Fase3.jsx
import React from 'react';
import { Check, Settings, Ruler, Search, RotateCcw, Info } from 'lucide-react';
import './Fase3.css'; // O nosso CSS puro e independente

export default function Fase3() {
    return (
        <div className="fase3-container fade-in">
            <div className="fase3-header">
                <h1 className="fase3-title">Fase 3: Manufatura</h1>
                <p className="fase3-subtitle">Acompanhamento da produção e controlo de qualidade em tempo real.</p>
            </div>

            <div>
                {/* Cartão 1: Item Em Produção */}
                <div className="fase3-card">
                    <div className="fase3-flex-between">
                        <div>
                            <h3 className="fase3-item-title">Transmissão REQ-2023-040 - Módulo Hidráulico Beta</h3>
                            <p className="fase3-item-meta">Iniciado em 01/Out/2026</p>
                        </div>
                        <span className="fase3-badge-emerald">
                            <span className="fase3-pulse-dot"></span> Em Execução (Fábrica)
                        </span>
                    </div>

                    <div className="fase3-progress-container">
                        <div className="fase3-progress-bar-bg">
                            {/* Ajusta a largura desta div para simular o progresso (ex: 45%) */}
                            <div className="fase3-progress-bar-fill" style={{ width: '45%' }}></div>
                        </div>

                        <div className="fase3-timeline">
                            {/* Etapa 1: Concluída */}
                            <div className="fase3-step">
                                <div className="fase3-step-icon icon-done"><Check size={18} /></div>
                                <div className="fase3-step-title">Construção</div>
                                <div className="fase3-step-desc">Separar & Construir</div>
                            </div>

                            {/* Etapa 2: Em Curso */}
                            <div className="fase3-step">
                                <div className="fase3-step-connector connector-emerald"></div>
                                <div className="fase3-step-icon icon-current"><Settings size={18} /></div>
                                <div className="fase3-step-title title-blue">Montagem</div>
                                <div className="fase3-step-desc desc-blue">Pré-montar & Montar</div>
                            </div>

                            {/* Etapa 3: Pendente */}
                            <div className="fase3-step">
                                <div className="fase3-step-connector connector-slate"></div>
                                <div className="fase3-step-icon icon-pending"><Ruler size={18} /></div>
                                <div className="fase3-step-title">Ajustes & Checklists</div>
                                <div className="fase3-step-desc">Medição 3D</div>
                            </div>

                            {/* Etapa 4: Pendente */}
                            <div className="fase3-step">
                                <div className="fase3-step-connector connector-slate"></div>
                                <div className="fase3-step-icon icon-pending"><Search size={18} /></div>
                                <div className="fase3-step-title">Qualidade & Fim</div>
                                <div className="fase3-step-desc">Avaliação Final</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cartão 2: Item em Retrabalho */}
                <div className="fase3-card fase3-rework-card">
                    <div className="fase3-rework-bg"></div>
                    <div className="fase3-rework-content">
                        <div className="fase3-flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 className="fase3-item-title">Eventual 2005 - Suporte Sensor V2</h3>
                            <span className="fase3-badge-rose">
                                <RotateCcw size={14} style={{ marginRight: '0.4rem' }} /> Retrabalho (Qualidade)
                            </span>
                        </div>
                        <div className="fase3-rework-alert">
                            <Info size={24} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <div>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>Status de Controlo:</p>
                                <p>A etapa "Avaliar qualidade" gerou uma <strong>Reprovação</strong>. A peça retornou para a fase de "Retrabalhar" na manufatura.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}