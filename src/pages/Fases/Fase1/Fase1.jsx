// =================================================================
// ARQUIVO: src/pages/Fases/Fase1/Fase1.jsx
// DESCRIÇÃO: Fase 1 com controlo de datas, campos originais e tabelas MFG
// =================================================================
import React, { useState } from 'react';
import {
    Clock, AlertCircle, UploadCloud, ArrowRight, Calculator,
    Send, CheckCircle, XCircle, Lock, Calendar, Box
} from 'lucide-react';
import { useAuthStore } from '../../../contexts/authStore';
import './Fase1.css';

export default function Fase1() {
    const { usuario } = useAuthStore();

    // Regra de Permissão: Apenas área_id === 1 (Orçamento) pode editar
    const podeEditar = usuario?.area_id === 1;

    // Estados de visibilidade das secções originais
    const [mostrarTL, setMostrarTL] = useState(true);
    const [mostrarOrcamento, setMostrarOrcamento] = useState(true);
    const [mostrarSCL, setMostrarSCL] = useState(true);

    // Datas originais
    const [dataPrevistaJzep, setDataPrevistaJzep] = useState('2026-10-10');
    const [dataPrevistaOrcamento, setDataPrevistaOrcamento] = useState('2026-10-14');

    const lidarComAcao = (setEstado, mensagem) => {
        if (!podeEditar) {
            alert("Ação não permitida: Apenas a equipa de Orçamento pode alterar esta fase.");
            return;
        }
        alert(mensagem);
        setEstado(false);
    };

    // Dados injetados da Tabela 1: COMPOSIÇÃO ESCOPO MFG
    const composicaoEscopoMFG = {
        teraMontagem: false,
        teraMedicao3D: false,
        teraBordomaquina: false,
        teraDesmontagem: false,
        construcaoMFG: false,
        tipoEstrutura: "Gripper EGT",
        porteEstrutura: "Grande",
        localMontagem: "MG",
        tipoEmbalagem: "N/A"
    };

    return (
        <div className="fase-container fade-in">
            <div className="fase-header">
                <h1 className="fase-title">Fase 1: Orçamento</h1>
                <p className="fase-subtitle">Solicitação, Engenharia (JZEP) e Gestão de Custos.</p>
            </div>

            {/* AVISO DE MODO DE LEITURA */}
            {!podeEditar && (
                <div style={{
                    backgroundColor: '#fffbe3', border: '1px solid #fde68a', color: '#92400e',
                    padding: '0.8rem 1.2rem', borderRadius: '0.5rem', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600'
                }}>
                    <Lock size={18} />
                    <span>Modo de Leitura: Apenas colaboradores da área de <strong>Orçamento</strong> podem preencher e aprovar esta fase.</span>
                </div>
            )}

            {/* ==========================================
                NOVO BLOCO: ESCOPO DE MANUFATURA (Tabelas 1 e 3)
                ========================================== */}
            <div className="fase-card">
                <div className="fase-flex-between">
                    <div>
                        <span className="badge-blue">Transmissão REQ-2023-112</span>
                        <h3 className="fase-item-title">Escopo MFG: {composicaoEscopoMFG.tipoEstrutura} ({composicaoEscopoMFG.porteEstrutura})</h3>
                        <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>
                            Local de Montagem: {composicaoEscopoMFG.localMontagem} | Embalagem: {composicaoEscopoMFG.tipoEmbalagem} | Qtd Transmissão: 0
                        </p>
                    </div>
                    <span className="badge-amber"><Box size={14} /> Escopo e Apontamentos</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.4rem' }}>
                        Montagem: <strong>{composicaoEscopoMFG.teraMontagem ? 'TRUE' : 'FALSE'}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.4rem' }}>
                        Medição 3D: <strong>{composicaoEscopoMFG.teraMedicao3D ? 'TRUE' : 'FALSE'}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.4rem' }}>
                        Bordomáquina: <strong>{composicaoEscopoMFG.teraBordomaquina ? 'TRUE' : 'FALSE'}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.4rem' }}>
                        Desmontagem: <strong>{composicaoEscopoMFG.teraDesmontagem ? 'TRUE' : 'FALSE'}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '0.4rem' }}>
                        Construção MFG: <strong>{composicaoEscopoMFG.construcaoMFG ? 'TRUE' : 'FALSE'}</strong>
                    </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.8rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.4rem' }}>
                    <strong>*Nota de Engenharia (Estrutura):</strong> 18 itens no total apontados, com 2 horas alocadas para Medição 3D e restante zerado.
                </div>
            </div>

            {/* ==========================================
                1. AÇÃO: TL Engenharia (Desenhos Técnicos) - ORIGINAL MANTIDO
                ========================================== */}
            {mostrarTL && (
                <div className="fase-card">
                    <div className="fase-flex-between">
                        <div>
                            <h3 className="fase-item-title">Desenhos Técnicos (JZEP)</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.4rem' }}>
                                <Calendar size={14} />
                                Prazo de Entrega dos Desenhos: {dataPrevistaJzep ? new Date(dataPrevistaJzep).toLocaleDateString('pt-PT') : 'Não definido'}
                            </div>
                        </div>
                        <span className="badge-amber">
                            <AlertCircle size={14} /> Ação Requerida (TL Eng)
                        </span>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); lidarComAcao(setMostrarTL, 'Informações JZEP enviadas.'); }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            {/* CAMPO ORIGINAL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Tipo de Orçamento</label>
                                <select className="fase1-select" disabled={!podeEditar} required style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1' }}>
                                    <option value="">Selecione...</option>
                                    <option value="construtivos">Orçar Construtivos (Materiais)</option>
                                    <option value="servicos">Orçar Serviços de Manufatura</option>
                                </select>
                            </div>

                            {/* CAMPO ORIGINAL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Atualizar Prazo (JZEP)</label>
                                <input
                                    type="date"
                                    disabled={!podeEditar}
                                    value={dataPrevistaJzep}
                                    onChange={(e) => setDataPrevistaJzep(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* CAMPO ORIGINAL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Anexar Desenhos (JZEP)</label>
                                <label className="upload-box" style={{ opacity: podeEditar ? 1 : 0.6, cursor: podeEditar ? 'pointer' : 'not-allowed', padding: '1rem', display: 'block', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '0.4rem' }}>
                                    <UploadCloud size={20} color="#94a3b8" style={{ margin: '0 auto' }} />
                                    <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>Fazer upload de arquivos</span>
                                    <input type="file" style={{ display: 'none' }} disabled={!podeEditar} multiple />
                                </label>
                            </div>
                        </div>
                        {podeEditar && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ background: '#2563eb', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.4rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Concluir Etapa de Desenhos <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* ==========================================
                2. AÇÃO: Gestão de Orçamentos (Campos Originais + Novos)
                ========================================== */}
            {mostrarOrcamento && (
                <div className="fase-card">
                    <div className="fase-flex-between">
                        <div>
                            <span className="badge-blue">Financeiro</span>
                            <h3 className="fase-item-title">Orçamento da Manufatura</h3>

                            {/* CAMPO ORIGINAL */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.4rem' }}>
                                <Calendar size={14} />
                                Prazo de Fecho do Orçamento: {dataPrevistaOrcamento ? new Date(dataPrevistaOrcamento).toLocaleDateString('pt-PT') : 'Não definido'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Taxa Base Identificada: ~R$ 91,94/h | Rastreamento: REV00 a REV15</div>
                        </div>
                        <span className="badge-amber">
                            <Calculator size={14} /> Ação Requerida (Orçamento)
                        </span>
                    </div>

                    {/* CAMPO ORIGINAL */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Atualizar Prazo de Fecho</label>
                        <input
                            type="date"
                            disabled={!podeEditar}
                            value={dataPrevistaOrcamento}
                            onChange={(e) => setDataPrevistaOrcamento(e.target.value)}
                            style={{ width: '200px', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* GRELHA HÍBRIDA */}
                    <div className="budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        
                        {/* 2 CAMPOS ORIGINAIS */}
                        <div>
                            <div className="budget-label" style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Databook (Original)</div>
                            <div className="input-group">
                                <input type="number" defaultValue="500" disabled={!podeEditar} style={{ padding: '0.5rem', width: '100%', borderRadius: '0.3rem', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                        <div>
                            <div className="budget-label" style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Cotação Fornecedores</div>
                            <div className="input-group">
                                <input type="number" defaultValue="800" disabled={!podeEditar} style={{ padding: '0.5rem', width: '100%', borderRadius: '0.3rem', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>

                        {/* NOVOS CAMPOS TABELA 4 E 5 */}
                        {[
                            { label: 'Recebimento (1h)', val: 91.94 },
                            { label: 'Inspeção (2h)', val: 183.88 },
                            { label: 'Liberação (1h)', val: 91.94 },
                            { label: 'Data Book (Extra)', val: 91.94 },
                            { label: 'Gestão Técnica (1h)', val: 91.94 },
                            { label: 'Relatórios (1h)', val: 91.94 },
                            { label: 'Srv. Externo (Transm.)', val: 0.00 }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="budget-label" style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{item.label}</div>
                                <div className="input-group">
                                    <input type="number" defaultValue={item.val} disabled={!podeEditar} style={{ padding: '0.5rem', width: '100%', borderRadius: '0.3rem', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} step="0.01" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                        {/* TOTAL COMBINADO: 1.300 (Antigos) + 643,58 (Novos) */}
                        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>Total Calculado: <span style={{ color: '#1d4ed8' }}>R$ 1.943,58</span></div>
                        {podeEditar && (
                            <button onClick={() => lidarComAcao(setMostrarOrcamento, 'Enviado para SCL.')} className="btn btn-success" style={{ background: '#059669', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.4rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                Enviar para Avaliação Final <Send size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ==========================================
                3. AÇÃO: Decisão Final - ORIGINAL MANTIDO
                ========================================== */}
            {mostrarSCL && (
                <div className="fase-card">
                    <div className="fase-flex-between">
                        <div>
                            <h3 className="fase-item-title">Aprovação do Valor Final (PM/SCL)</h3>
                            <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Avaliação do cálculo gerado pela equipa de Orçamento.</p>
                        </div>
                        <span className="badge-amber"><AlertCircle size={14} /> Avaliação</span>
                    </div>

                    <div className="btn-group" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={() => lidarComAcao(setMostrarSCL, 'Aprovado!')} disabled={!podeEditar} className="btn btn-success" style={{ opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed', background: '#10b981', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', flex: 1, display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                            <CheckCircle size={18} /> APROVAR
                        </button>
                        <button onClick={() => lidarComAcao(setMostrarSCL, 'Reprovado.')} disabled={!podeEditar} className="btn btn-danger" style={{ opacity: podeEditar ? 1 : 0.5, cursor: podeEditar ? 'pointer' : 'not-allowed', background: '#f43f5e', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', flex: 1, display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                            <XCircle size={18} /> REPROVAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}