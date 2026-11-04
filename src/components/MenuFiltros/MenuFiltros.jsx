// =================================================================
// ARQUIVO: src/components/MenuFiltros/MenuFiltros.jsx
// DESCRIÇÃO: Componente modal central para gerir a caixa de filtros
// =================================================================
import React from 'react';
import { X, Filter, Check } from 'lucide-react';
import FundoEscuro from '../FundoEscuro/FundoEscuro';
import './MenuFiltros.css';

export default function MenuFiltros({
    mostrar,
    aoFechar,
    filtroFase, setFiltroFase,
    filtroStatus, setFiltroStatus,
    filtroScl, setFiltroScl,
    filtroCc, setFiltroCc,
    filtroData, setFiltroData, // ✨ Novo Estado Recebido
    responsaveisUnicos,
    centrosCustoUnicos,
    datasUnicas, // ✨ Nova Lista de Datas Recebida
    limparFiltros
}) {
    if (!mostrar) return null;

    return (
        <FundoEscuro aoFechar={aoFechar} zIndex={1000} opacidade={0.6}>
            <div className="filtro-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* CABEÇALHO DO MODAL */}
                <div className="filtro-modal-header">
                    <h2 className="filtro-modal-title">
                        <Filter size={20} color="#2563eb" />
                        Filtros de Pesquisa
                    </h2>
                    <button className="btn-fechar-modal" onClick={aoFechar}>
                        <X size={20} />
                    </button>
                </div>

                {/* CORPO COM AS OPÇÕES */}
                <div className="filtro-modal-body">

                    {/* ✨ NOVO FILTRO: Data de Solicitação */}
                    <div className="filter-group">
                        <label>Data de Solicitação</label>
                        <select className="filter-select" value={filtroData} onChange={(e) => setFiltroData(e.target.value)}>
                            <option value="todas">Todas as Datas</option>
                            {datasUnicas.map((data, index) => (
                                <option key={index} value={data}>{data}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Fase do Projeto</label>
                        <select className="filter-select" value={filtroFase} onChange={(e) => setFiltroFase(e.target.value)}>
                            <option value="todas">Todas as Fases</option>
                            <option value="1">Fase 1: Orçamento</option>
                            <option value="2">Fase 2: Planejamento</option>
                            <option value="3">Fase 3: Manufatura</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status Geral</label>
                        <select className="filter-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Todos os Status</option>
                            <option value="ativos">Apenas Ativos (Em Andamento)</option>
                            <option value="concluido">Apenas Concluídos (100%)</option>
                            <option value="cancelado">Apenas Cancelados</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Responsável (SCL)</label>
                        <select className="filter-select" value={filtroScl} onChange={(e) => setFiltroScl(e.target.value)}>
                            <option value="todos">Todos os SCLs</option>
                            {responsaveisUnicos.map((resp, index) => (
                                <option key={index} value={resp}>{resp}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Centro de Custo</label>
                        <select className="filter-select" value={filtroCc} onChange={(e) => setFiltroCc(e.target.value)}>
                            <option value="todos">Todos os Centros de Custo</option>
                            {centrosCustoUnicos.map((cc, index) => (
                                <option key={index} value={cc}>{cc}</option>
                            ))}
                        </select>
                    </div>

                    {/* RODAPÉ DO MODAL */}
                    <div className="filtro-modal-footer">
                        <button className="btn-limpar-filtros" onClick={limparFiltros}>
                            Limpar Filtros
                        </button>
                        <button
                            onClick={aoFechar}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: '#2563eb', color: 'white', border: 'none',
                                padding: '0.6rem 1.2rem', borderRadius: '0.5rem',
                                fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            <Check size={16} /> Aplicar
                        </button>
                    </div>
                </div>

            </div>
        </FundoEscuro>
    );
}