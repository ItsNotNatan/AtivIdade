// =================================================================
// ARQUIVO: src/pages/Acompanhamento/Acompanhamento.jsx
// DESCRIÇÃO: Painel com Filtros Dinâmicos modulares, Paginação e Data de Solicitação
// =================================================================
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Briefcase, LayoutDashboard,
    TrendingUp, CheckCircle2, Factory, Calculator, CalendarCheck, XCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react';

import ModalDetalhes from '../../components/ModalDetalhes/ModalDetalhes';
import MenuFiltros from '../../components/MenuFiltros/MenuFiltros';
import './Acompanhamento.css';

export default function Acompanhamento() {
    const [pesquisa, setPesquisa] = useState('');
    const [itemSelecionado, setItemSelecionado] = useState(null);

    // ✨ ESTADOS DOS FILTROS (Adicionado o filtroData)
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtroFase, setFiltroFase] = useState('todas');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroScl, setFiltroScl] = useState('todos');
    const [filtroCc, setFiltroCc] = useState('todos');
    const [filtroData, setFiltroData] = useState('todas');

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    const [solicitacoes] = useState([
        { id: 'VW427-PATAGONIA-0041-2025', scl: 'João Silva', centroCusto: 'BRBCBBA47', nomeCentroCusto: 'GM_SPIN_MCM2_CLOSURES', status: 'pendente', faseAtual: 1, progresso: 50, dataSolicitacao: '10/09/2026' },
        { id: 'BB37-VW-ANCH-UB2-0003-2025', scl: 'Maria Costa', centroCusto: 'BRBCBBA48', nomeCentroCusto: 'SHUTTLE MODELO X1H', status: 'transito', faseAtual: 2, progresso: 30, dataSolicitacao: '12/09/2026' },
        { id: 'VW-B38-ANCHIETA-0006-2025', scl: 'Carlos Souza', centroCusto: 'BRBCBBA49', nomeCentroCusto: 'RETOOLING JEEP SUSP 291', status: 'concluido', faseAtual: 3, progresso: 80, dataSolicitacao: '05/09/2026' },
        { id: 'EV1322-SUPORTE-SENSOR-V2', scl: 'Ana Costa', centroCusto: 'BRBCBBA51', nomeCentroCusto: 'GM GMI MCM - Closures', status: 'concluido', faseAtual: 3, progresso: 100, dataSolicitacao: '01/09/2026' },
        { id: 'EV1400-ESTRUTURA-BASE-A', scl: 'Tiago Mendes', centroCusto: 'BRBCBBA60', nomeCentroCusto: 'NOVO CHASSI JEEP', status: 'cancelado', faseAtual: 1, progresso: 15, dataSolicitacao: '20/09/2026' },
        { id: 'VW200-PORTA-TRAS-0021-2026', scl: 'Luísa Marques', centroCusto: 'BRBCBBA61', nomeCentroCusto: 'VW POLO PORTAS', status: 'cancelado', faseAtual: 2, progresso: 40, dataSolicitacao: '22/09/2026' },
        { id: 'VW427-PATAGONIA-0042-2025', scl: 'João Silva', centroCusto: 'BRBCBBA47', nomeCentroCusto: 'GM_SPIN_MCM2_CLOSURES', status: 'pendente', faseAtual: 1, progresso: 20, dataSolicitacao: '25/09/2026' },
        { id: 'VW427-PATAGONIA-0043-2025', scl: 'João Silva', centroCusto: 'BRBCBBA47', nomeCentroCusto: 'GM_SPIN_MCM2_CLOSURES', status: 'pendente', faseAtual: 1, progresso: 90, dataSolicitacao: '26/09/2026' },
        { id: 'BB37-VW-ANCH-UB2-0004-2025', scl: 'Maria Costa', centroCusto: 'BRBCBBA48', nomeCentroCusto: 'SHUTTLE MODELO X1H', status: 'transito', faseAtual: 2, progresso: 10, dataSolicitacao: '27/09/2026' },
        { id: 'EV1323-SUPORTE-SENSOR-V3', scl: 'Ana Costa', centroCusto: 'BRBCBBA51', nomeCentroCusto: 'GM GMI MCM - Closures', status: 'concluido', faseAtual: 3, progresso: 60, dataSolicitacao: '18/09/2026' },
        { id: 'EV1500-MAQUINA-TESTE-B', scl: 'Carlos Souza', centroCusto: 'BRBCBBA49', nomeCentroCusto: 'RETOOLING JEEP SUSP 291', status: 'pendente', faseAtual: 1, progresso: 5, dataSolicitacao: '28/09/2026' },
    ]);

    // Extração dinâmica de opções
    const responsaveisUnicos = [...new Set(solicitacoes.map(item => item.scl))].sort();
    const centrosCustoUnicos = [...new Set(solicitacoes.map(item => item.centroCusto))].sort();

    // ✨ Extração e ordenação de datas (da mais recente para a mais antiga)
    const datasUnicas = [...new Set(solicitacoes.map(item => item.dataSolicitacao))].sort((a, b) => {
        const [diaA, mesA, anoA] = a.split('/');
        const [diaB, mesB, anoB] = b.split('/');
        return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
    });

    useEffect(() => {
        setPaginaAtual(1);
    }, [pesquisa, filtroFase, filtroStatus, filtroScl, filtroCc, filtroData]);

    const getStatusInfo = (faseAtual, progresso, statusGeral) => {
        if (statusGeral === 'cancelado') return { classe: 'status-cancelado', texto: 'Cancelado', icone: <XCircle size={14} /> };
        if (faseAtual === 3 && progresso === 100) return { classe: 'status-concluido', texto: 'Projeto Concluído', icone: <CheckCircle2 size={14} /> };
        if (faseAtual === 1) return { classe: 'status-pendente', texto: 'Em Orçamento', icone: <Calculator size={14} /> };
        if (faseAtual === 2) return { classe: 'status-transito', texto: 'Em Planejamento', icone: <CalendarCheck size={14} /> };
        if (faseAtual === 3) return { classe: 'status-concluido', texto: 'Em Manufatura', icone: <Factory size={14} /> };
        return { classe: 'status-pendente', texto: 'Desconhecido', icone: <Briefcase size={14} /> };
    };

    const getProgressoSegmento = (faseDoSegmento, faseAtual, progressoNaFaseAtual) => {
        if (faseAtual > faseDoSegmento) return 100;
        if (faseAtual === faseDoSegmento) return progressoNaFaseAtual;
        return 0;
    };

    const getCorSegmento = (faseDoSegmento, item) => {
        if (item.status === 'cancelado' && item.faseAtual === faseDoSegmento) return '#ef4444';
        if (faseDoSegmento === 1) return '#3b82f6';
        if (faseDoSegmento === 2) return '#f59e0b';
        if (faseDoSegmento === 3) return '#10b981';
        return '#cbd5e1';
    };

    const calcularProgressoGlobal = (faseAtual, progressoAtual) => {
        const progressoTotal = ((faseAtual - 1) * 100 + progressoAtual) / 3;
        return Math.round(progressoTotal);
    };

    const limparFiltros = () => {
        setFiltroFase('todas');
        setFiltroStatus('todos');
        setFiltroScl('todos');
        setFiltroCc('todos');
        setFiltroData('todas'); // ✨ Reseta também o filtro de data
        setMostrarFiltros(false);
    };

    const solicitacoesFiltradas = solicitacoes.filter(item => {
        const matchPesquisa = item.id.toLowerCase().includes(pesquisa.toLowerCase()) ||
            item.scl.toLowerCase().includes(pesquisa.toLowerCase()) ||
            item.centroCusto.toLowerCase().includes(pesquisa.toLowerCase());

        const matchFase = filtroFase === 'todas' || item.faseAtual.toString() === filtroFase;
        const matchScl = filtroScl === 'todos' || item.scl === filtroScl;
        const matchCc = filtroCc === 'todos' || item.centroCusto === filtroCc;

        // ✨ Verificação da Data de Solicitação
        const matchData = filtroData === 'todas' || item.dataSolicitacao === filtroData;

        let matchStatus = true;
        if (filtroStatus === 'cancelado') matchStatus = item.status === 'cancelado';
        else if (filtroStatus === 'concluido') matchStatus = item.status !== 'cancelado' && item.faseAtual === 3 && item.progresso === 100;
        else if (filtroStatus === 'ativos') matchStatus = item.status !== 'cancelado' && !(item.faseAtual === 3 && item.progresso === 100);

        return matchPesquisa && matchFase && matchStatus && matchScl && matchCc && matchData;
    });

    const indiceUltimoItem = paginaAtual * itensPorPagina;
    const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
    const itensAtuais = solicitacoesFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);
    const totalPaginas = Math.ceil(solicitacoesFiltradas.length / itensPorPagina);

    const mudarPagina = (numeroPagina) => {
        if (numeroPagina > 0 && numeroPagina <= totalPaginas) setPaginaAtual(numeroPagina);
    };

    const totalPedidos = solicitacoes.length;
    const emProgresso = solicitacoes.filter(s => s.faseAtual < 3 && s.status !== 'cancelado').length;
    const emManufatura = solicitacoes.filter(s => s.faseAtual === 3 && s.status !== 'cancelado').length;

    // ✨ Atualizamos a variável para incluir o filtroData no brilho azul do botão
    const temFiltroAtivo = filtroFase !== 'todas' || filtroStatus !== 'todos' || filtroScl !== 'todos' || filtroCc !== 'todos' || filtroData !== 'todas';

    return (
        <div className="acompanhamento-container">
            <div className="acompanhamento-header">
                <div>
                    <h2 className="acompanhamento-title">
                        <LayoutDashboard color="#2563eb" size={28} />
                        Acompanhamento de Processos
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                        Dê um duplo clique numa linha para abrir os detalhes da transmissão e interagir com o fluxo.
                    </p>
                </div>
            </div>

            <div className="kpi-wrapper">
                <div className="kpi-card">
                    <div className="kpi-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="kpi-details">
                        <h4>Total de Projetos</h4>
                        <span>{totalPedidos}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-box" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-details">
                        <h4>Em Preparação (Ativos)</h4>
                        <span>{emProgresso}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <Factory size={24} />
                    </div>
                    <div className="kpi-details">
                        <h4>Em Manufatura (Ativos)</h4>
                        <span>{emManufatura}</span>
                    </div>
                </div>
            </div>

            <div className="acompanhamento-actions">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por Transmissão, SCL ou Centro de Custo..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                    />
                </div>

                <div className="filter-container" style={{ position: 'relative', zIndex: mostrarFiltros ? 50 : 1 }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setMostrarFiltros(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff',
                            border: `1px solid ${temFiltroAtivo ? '#3b82f6' : '#cbd5e1'}`,
                            padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer',
                            fontWeight: 'bold', color: temFiltroAtivo ? '#2563eb' : '#334155'
                        }}
                    >
                        <Filter size={18} />
                        Filtros {temFiltroAtivo && '(Ativos)'}
                    </button>

                    {/* ✨ Componente MenuFiltros com as novas propriedades de Data passadas para ele */}
                    <MenuFiltros
                        mostrar={mostrarFiltros}
                        aoFechar={() => setMostrarFiltros(false)}
                        filtroFase={filtroFase} setFiltroFase={setFiltroFase}
                        filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
                        filtroScl={filtroScl} setFiltroScl={setFiltroScl}
                        filtroCc={filtroCc} setFiltroCc={setFiltroCc}
                        filtroData={filtroData} setFiltroData={setFiltroData}
                        responsaveisUnicos={responsaveisUnicos}
                        centrosCustoUnicos={centrosCustoUnicos}
                        datasUnicas={datasUnicas}
                        limparFiltros={limparFiltros}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="tracking-table">
                    <thead>
                        <tr>
                            <th>Transmissão / Eventual</th>
                            <th>SCL / Responsável</th>
                            <th>Centro de Custo</th>
                            <th>Data Solicitação</th>
                            <th>Status Geral</th>
                            <th style={{ width: '250px' }}>Evolução do Projeto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensAtuais.length > 0 ? (
                            itensAtuais.map((item) => {
                                const statusInfo = getStatusInfo(item.faseAtual, item.progresso, item.status);
                                const progressoGlobal = calcularProgressoGlobal(item.faseAtual, item.progresso);
                                const foiCancelado = item.status === 'cancelado';

                                return (
                                    <tr
                                        key={item.id}
                                        className="linha-clicavel"
                                        onDoubleClick={() => setItemSelecionado(item)}
                                        title="Abrir detalhes do projeto"
                                    >
                                        <td style={{ fontWeight: '800', color: foiCancelado ? '#94a3b8' : '#2563eb' }}>
                                            <span style={{ textDecoration: foiCancelado ? 'line-through' : 'none' }}>
                                                {item.id}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '600', color: foiCancelado ? '#94a3b8' : 'inherit' }}>{item.scl}</td>
                                        <td>
                                            <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: foiCancelado ? 0.6 : 1 }}>
                                                <Briefcase size={14} color="#64748b" /> {item.centroCusto}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', opacity: foiCancelado ? 0.6 : 1 }}>
                                                {item.nomeCentroCusto}
                                            </div>
                                        </td>

                                        <td style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', opacity: foiCancelado ? 0.6 : 1 }}>
                                            {item.dataSolicitacao}
                                        </td>

                                        <td>
                                            <span className={`status-badge ${statusInfo.classe}`}>
                                                {statusInfo.icone} {statusInfo.texto}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-wrapper">
                                                <div className="progress-labels">
                                                    {foiCancelado ? (
                                                        <span className="progress-percentage" style={{ color: '#e11d48' }}>
                                                            Cancelado na Fase {item.faseAtual}
                                                        </span>
                                                    ) : (
                                                        <span className="progress-percentage">
                                                            {item.progresso}% da Fase {item.faseAtual}
                                                        </span>
                                                    )}
                                                    <span className="progress-phase-name" style={{ color: foiCancelado ? '#ef4444' : '#2563eb' }}>
                                                        Global: {progressoGlobal}%
                                                    </span>
                                                </div>

                                                <div className="multi-progress-wrapper" style={{ opacity: foiCancelado ? 0.8 : 1 }}>
                                                    <div className="multi-progress-segment" title="Orçamento">
                                                        <div className="multi-progress-fill" style={{ width: `${getProgressoSegmento(1, item.faseAtual, item.progresso)}%`, backgroundColor: getCorSegmento(1, item) }}></div>
                                                    </div>
                                                    <div className="multi-progress-segment" title="Planejamento">
                                                        <div className="multi-progress-fill" style={{ width: `${getProgressoSegmento(2, item.faseAtual, item.progresso)}%`, backgroundColor: getCorSegmento(2, item) }}></div>
                                                    </div>
                                                    <div className="multi-progress-segment" title="Manufatura">
                                                        <div className="multi-progress-fill" style={{ width: `${getProgressoSegmento(3, item.faseAtual, item.progresso)}%`, backgroundColor: getCorSegmento(3, item) }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <Search size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                    Nenhuma transmissão encontrada com os filtros atuais.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPaginas > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Mostrando de <strong>{indicePrimeiroItem + 1}</strong> a <strong>{Math.min(indiceUltimoItem, solicitacoesFiltradas.length)}</strong> de <strong>{solicitacoesFiltradas.length}</strong> projetos
                        </div>
                        <div className="pagination-controls">
                            <button className="btn-page" onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} title="Página Anterior">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                                <button key={num} className={`btn-page ${paginaAtual === num ? 'active' : ''}`} onClick={() => mudarPagina(num)}>
                                    {num}
                                </button>
                            ))}
                            <button className="btn-page" onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} title="Próxima Página">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {itemSelecionado && (
                <ModalDetalhes item={itemSelecionado} aoFechar={() => setItemSelecionado(null)} />
            )}
        </div>
    );
}