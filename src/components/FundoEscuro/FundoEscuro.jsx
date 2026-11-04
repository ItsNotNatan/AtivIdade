// =================================================================
// ARQUIVO: src/components/FundoEscuro/FundoEscuro.jsx
// DESCRIÇÃO: Componente modular para escurecer o ecrã (React Portal)
// =================================================================
import React from 'react';
import { createPortal } from 'react-dom';
import './FundoEscuro.css';

/**
 * @param {ReactNode} children - O conteúdo que vai ficar por cima do fundo escuro (ex: a caixa do modal).
 * @param {Function} aoFechar - A função disparada quando o utilizador clica na área escura.
 * @param {number} zIndex - O nível de profundidade (para garantir que fica por cima de tudo).
 * @param {number} opacidade - O nível de transparência do escuro (0.1 a 1.0).
 */
export default function FundoEscuro({ children, aoFechar, zIndex = 1000, opacidade = 0.6 }) {
    return createPortal(
        <div
            className="fundo-escuro-overlay"
            style={{
                zIndex: zIndex,
                backgroundColor: `rgba(15, 23, 42, ${opacidade})`
            }}
            onClick={aoFechar} // Quando clica no escuro, fecha a janela
        >
            {/* 
                O children é o que colocarmos "dentro" da tag <FundoEscuro> noutros ficheiros.
                A função stopPropagation impede que clicar na caixa branca feche o modal acidentalmente.
            */}
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'contents' }}>
                {children}
            </div>
        </div>,
        document.body
    );
}