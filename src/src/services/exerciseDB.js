// src/services/exerciseDB.js

// Agora as chaves correspondem exatamente aos IDs do MapaMuscular
const mapaMusculosAPI = {
    'chest': 'pectorals',
    'front-deltoids': 'delts',
    'back-deltoids': 'delts',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'abs': 'abs',
    'obliques': 'abs',
    'upper-back': 'upper back',
    'lower-back': 'spine',
    'gluteal': 'glutes',
    'quadriceps': 'quads',
    'hamstring': 'hamstrings',
    'calves': 'calves',
    'trapezius': 'traps',
    'forearm': 'forearms'
};

export const buscarGifsPorMusculo = async (musculo) => {
    if (!musculo) return [];
    
    // Pega o primeiro músculo caso tenham sido selecionados vários
    const musculoPrincipal = musculo.split(',')[0].trim();
    const target = mapaMusculosAPI[musculoPrincipal];
    
    // Se não tivermos mapeamento para esse músculo, retorna vazio
    if (!target) return [];

    const url = `https://exercisedb.p.rapidapi.com/exercises/target/${target}?limit=15`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Erro na chamada da API');
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar exercícios:", error);
        return [];
    }
};