// src/components/Profissional/AbaAlertas.jsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Phone, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AbaAlertas({ alertas, onResolverAlerta }) {
    // ESTADOS PARA PESQUISA, FILTRO E PAGINAÇÃO
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState(''); // '' = Todos, 'sos' = Emergência, 'dificuldade' = Dificuldade
    const [pagina, setPagina] = useState(1);
    const alertasPorPagina = 5;

    // 1. Filtrar Alertas
    const alertasFiltrados = alertas.filter(alerta => {
        const termoBusca = busca.toLowerCase();
        
        // Verifica o nome, a mensagem ou a pasta/treino
        const bateBusca = (alerta.utenteNome && alerta.utenteNome.toLowerCase().includes(termoBusca)) ||
                          (alerta.mensagem && alerta.mensagem.toLowerCase().includes(termoBusca)) ||
                          (alerta.grupo && alerta.grupo.toLowerCase().includes(termoBusca)) ||
                          (alerta.treino && alerta.treino.toLowerCase().includes(termoBusca));
        
        // Se filtroTipo for vazio (''), aceita tudo. Se tiver valor, tem de ser igual
        const bateFiltro = filtroTipo === '' || alerta.tipo === filtroTipo;

        return bateBusca && bateFiltro;
    });

    // 2. Paginação
    const totalPaginas = Math.ceil(alertasFiltrados.length / alertasPorPagina) || 1;
    
    // Ajusta a página atual se a pesquisa reduzir as opções para menos do que a página onde estávamos
    if (pagina > totalPaginas) {
        setPagina(totalPaginas);
    }
    
    const indexInicial = (pagina - 1) * alertasPorPagina;
    const alertasPaginados = alertasFiltrados.slice(indexInicial, indexInicial + alertasPorPagina);
    const paginasNumeros = Array.from({ length: totalPaginas }, (_, i) => i + 1);

    return (
        <div className="fade-in">
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Alertas de Treino & Ocorrências</h2>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Monitorização em tempo real de queixas de esforço e solicitações de emergência.</p>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.5rem 1rem', border: '1px solid #fecaca' }}>
                    {alertas.length} ocorrência(s) pendente(s)
                </span>
            </div>

            {/* BARRA DE PESQUISA E FILTROS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por paciente, pasta, exercício ou queixa..." 
                        value={busca}
                        onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select 
                        value={filtroTipo}
                        onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}
                    >
                        <option value="">Todas as Ocorrências</option>
                        <option value="sos">Apenas Emergências (SOS)</option>
                        <option value="dificuldade">Apenas Dificuldades</option>
                    </select>
                </div>
            </div>

            {/* LISTA DE ALERTAS */}
            {alertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Tudo sob controle</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Nenhum paciente registrou queixas ou pedidos de emergência nas últimas sessões.</p>
                </div>
            ) : alertasPaginados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', border: '1px dashed #cbd5e1' }}>
                    <AlertTriangle size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Nenhum alerta encontrado</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>A sua pesquisa não retornou nenhum resultado.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {alertasPaginados.map(alerta => (
                        <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.25rem', borderLeft: `6px solid ${alerta.tipo === 'sos' ? '#ef4444' : '#f59e0b'}`, borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '280px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <strong style={{ color: '#1e293b', fontSize: '1.15rem' }}>👤 {alerta.utenteNome}</strong>
                                    <span style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem' }}>
                                        🕒 {new Date(alerta.dataCriacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: alerta.tipo === 'sos' ? '#fee2e2' : '#fef3c7', color: alerta.tipo === 'sos' ? '#991b1b' : '#92400e', padding: '0.2rem 0.5rem' }}>
                                        {alerta.tipo === 'sos' ? 'SOS Emergência' : 'Dificuldade'}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#334155', fontWeight: '500' }}>"{alerta.mensagem}"</p>
                                
                                {(alerta.grupo || alerta.treino) && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {alerta.grupo && <span style={{ fontSize: '0.85rem', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}>📁 Pasta: {alerta.grupo}</span>}
                                        {alerta.treino && <span style={{ fontSize: '0.85rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}>🏋️ Exercício: {alerta.treino}</span>}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {alerta.utenteTel && (
                                    <a href={`tel:${alerta.utenteTel}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        <Phone size={16} /> Contatar
                                    </a>
                                )}
                                <button onClick={() => onResolverAlerta(alerta.id)} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                    <CheckCircle size={18} /> Marcar como Resolvido
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CONTROLES DE PAGINAÇÃO NUMÉRICA */}
            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button 
                        onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                        disabled={pagina === 1}
                        style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === 1 ? '#f8fafc' : 'white', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={20} color={pagina === 1 ? '#94a3b8' : '#334155'} />
                    </button>
                    
                    {paginasNumeros.map(num => (
                        <button
                            key={num}
                            onClick={() => setPagina(num)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                border: '1px solid #cbd5e1',
                                backgroundColor: pagina === num ? '#059669' : 'white',
                                color: pagina === num ? 'white' : '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={pagina === totalPaginas}
                        style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === totalPaginas ? '#f8fafc' : 'white', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={20} color={pagina === totalPaginas ? '#94a3b8' : '#334155'} />
                    </button>
                </div>
            )}
        </div>
    );
}