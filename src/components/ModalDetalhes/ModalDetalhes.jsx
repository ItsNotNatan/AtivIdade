// =================================================================
// ARQUIVO: src/components/ModalDetalhes/ModalDetalhes.jsx
// DESCRIÇÃO: Componente de janela flutuante utilizando o módulo FundoEscuro
// =================================================================
import React from 'react';
import { X, Check, Calendar, User } from 'lucide-react';

// 1. Importamos o nosso novo componente modular (Certifica-te que o caminho está correto)
import FundoEscuro from '../FundoEscuro/FundoEscuro';

// Importação das Fases (Ajusta o caminho consoante a organização das tuas pastas)
import Fase1 from '../../pages/Fases/Fase1/Fase1';
import Fase2 from '../../pages/Fases/Fase2/Fase2';
import Fase3 from '../../pages/Fases/Fase3/Fase3';
import './ModalDetalhes.css';

export default function ModalDetalhes({ item, aoFechar }) {
    // Segurança: se não houver item selecionado, não desenha nada
    if (!item) return null;

    // Lógicas de fallback caso os dados da data não venham da API ainda
    const dataPrevistaExibicao = item.dataPrevista || '15/10/2026';
    const autorDataExibicao = item.autorDataPrevista || 'Equipa de Planejamento';

    // A Lógica da Linha do Tempo (Tracker)
    const renderizarTracker = (faseAtual) => {
        const fases = [
            { numero: 1, nome: 'Fase 1: Orçamento' },
            { numero: 2, nome: 'Fase 2: Planejamento' },
            { numero: 3, nome: 'Fase 3: Manufatura' }
        ];

        return (
            <div className="tracker-container">
                <div className="tracker-linha-fundo"></div>
                {fases.map((fase) => {
                    const concluida = faseAtual > fase.numero;
                    const ativa = faseAtual === fase.numero;

                    let classePasso = 'passo-futuro';
                    if (concluida) classePasso = 'passo-concluido';
                    if (ativa) classePasso = 'passo-ativo';

                    return (
                        <div key={fase.numero} className={`tracker-passo ${classePasso}`}>
                            <div className="tracker-bolinha">
                                {concluida ? <Check size={18} /> : fase.numero}
                            </div>
                            <span className="tracker-texto">{fase.nome}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 2. Substituímos o createPortal e a div.modal-overlay pelo componente <FundoEscuro>
    return (
        <FundoEscuro aoFechar={aoFechar} zIndex={1000} opacidade={0.6}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Cabeçalho do Modal */}
                <div className="modal-header">

                    {/* ZONA ESQUERDA: Informações do Projeto */}
                    <div className="modal-header-left">
                        <h2>{item.id}</h2>
                        <span className="modal-meta">
                            SCL: {item.scl || item.solicitante} | C.C: {item.centroCusto || 'N/A'}
                        </span>
                    </div>

                    {/* ZONA CENTRAL: Data Prevista e Autor */}
                    <div className="modal-header-center">
                        <div className="data-prevista-badge">
                            <Calendar size={14} />
                            <span>Entrega Prevista: <strong>{dataPrevistaExibicao}</strong></span>
                        </div>
                        <div className="data-autor-info">
                            <User size={12} /> Definido por: {autorDataExibicao}
                        </div>
                    </div>

                    {/* ZONA DIREITA: Botão X para fechar */}
                    <button className="btn-fechar-modal" onClick={aoFechar} title="Fechar (ESC)">
                        <X size={24} />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className="modal-body">
                    {/* Renderiza a Linha do Tempo visual */}
                    {renderizarTracker(item.faseAtual)}

                    {/* Renderiza a Fase correspondente ao projeto */}
                    <div style={{ marginTop: '2rem' }}>
                        {item.faseAtual === 1 && <Fase1 />}
                        {item.faseAtual === 2 && <Fase2 />}
                        {item.faseAtual === 3 && <Fase3 />}
                    </div>
                </div>

            </div>
        </FundoEscuro>
    );
}