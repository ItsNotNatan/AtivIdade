// src/services/apiExercicios.js

// Mapeamento dos nossos músculos para os IDs numéricos da Wger API
const mapaWger = {
    'chest': 4,             // Pectoralis major
    'front-deltoids': 2,    // Anterior deltoid
    'back-deltoids': 13,    // Posterior deltoid
    'biceps': 1,            // Biceps brachii
    'triceps': 5,           // Triceps brachii
    'abs': 6,               // Rectus abdominis
    'obliques': 14,         // Obliques
    'upper-back': 12,       // Latissimus dorsi (Costas)
    'lower-back': 15,       // Soleus / Lombar
    'gluteal': 8,           // Gluteus maximus
    'quadriceps': 10,       // Quadriceps
    'hamstring': 11,        // Biceps femoris (Posterior)
    'calves': 7,            // Gastrocnemius (Gémeos)
    'trapezius': 9          // Trapezius
};

export const buscarExerciciosAPI = async (musculo) => {
    if (!musculo) return [];
    
    // Pega o primeiro músculo da seleção
    const principal = musculo.split(',')[0].trim();
    const wgerId = mapaWger[principal];
    
    if (!wgerId) return [];

    // Endpoint da Wger que devolve Exercícios + Imagens (language=2 é Inglês)
    const url = `https://wger.de/api/v2/exerciseinfo/?muscles=${wgerId}&language=2&limit=40`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na API Wger');
        const data = await response.json();

        // Filtra apenas os exercícios que tenham imagens anexadas no servidor deles
        const exerciciosComImagem = data.results.filter(ex => ex.images && ex.images.length > 0);

        // Formata os dados para o nosso Modal usar (pegamos a imagem principal de cada exercício)
        return exerciciosComImagem.map(ex => ({
            id: ex.id,
            name: ex.name,
            gifUrl: ex.images[0].image // A Wger devolve fotos reais estáticas (JPG/PNG) do movimento
        })).slice(0, 15); // Retorna no máximo 15 opções para não pesar o layout

    } catch (error) {
        console.error("Erro ao buscar na Wger API:", error);
        return [];
    }
};