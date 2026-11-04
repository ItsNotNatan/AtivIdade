// src/pages/Fases/Fase2.jsx
import React, { useState } from 'react';
import { Calendar, Save, Truck, Package } from 'lucide-react';
import './Fase2.css'; // Classes específicas da tabela

export default function Fase2() {
    const [mostrarPrazos, setMostrarPrazos] = useState(true);

    return (
        <div className="fase-container">
            <div className="fase-header">
                <h1 className="fase-title">Fase 2: Planejamento</h1>
                <p className="fase-subtitle">Defina os prazos para os recursos solicitados pela Logística (PCP).</p>
            </div>

            {mostrarPrazos && (
                <div className="fase-card">
                    <div className="fase-flex-between">
                        <div>
                            <span className="badge-blue">Transmissão REQ-2023-080</span>
                            <h3 className="fase-item-title">Montagem Subconjunto Y</h3>
                        </div>
                        <span className="badge-amber"><Calendar size={16} /> Ação: SCL/TL Eng</span>
                    </div>

                    <table className="fase2-table">
                        <thead>
                            <tr>
                                <th>Recurso Solicitado pelo PCP</th>
                                <th style={{ width: '250px' }}>O Seu Prazo de Entrega</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><Package size={18} style={{ display: 'inline', marginRight: '8px', color: '#64748b' }} /> Kit Peças Cód 8899</td>
                                <td style={{ background: '#eff6ff' }}>
                                    <input type="date" defaultValue="2026-10-15" className="fase2-input-date" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ flex: 'none' }}>
                            <Truck size={18} style={{ color: '#059669' }} /> Realizar Entrega Agora
                        </button>
                        <button onClick={() => { alert('Prazos confirmados ao PCP!'); setMostrarPrazos(false); }} className="btn btn-success" style={{ flex: 'none', background: '#2563eb' }}>
                            <Save size={18} /> Confirmar Prazos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}