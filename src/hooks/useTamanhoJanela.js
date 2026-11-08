// src/hooks/useTamanhoJanela.js
import { useState, useEffect } from 'react';

export function useTamanhoJanela() {
    const [tamanho, setTamanho] = useState({
        largura: typeof window !== 'undefined' ? window.innerWidth : 1200,
        altura: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    useEffect(() => {
        const lidarComResize = () => {
            setTamanho({
                largura: window.innerWidth,
                altura: window.innerHeight,
            });
        };

        window.addEventListener('resize', lidarComResize);
        return () => window.removeEventListener('resize', lidarComResize);
    }, []);

    return tamanho;
}