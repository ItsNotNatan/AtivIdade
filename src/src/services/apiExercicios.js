// src/services/apiExercicios.js

const catalogoGarantido = {
    'chest': [
        { id: 'c1', name: 'Flexão de Braços', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' },
        { id: 'c2', name: 'Supino Reto com Halteres', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif' }
    ],
    'front-deltoids': [
        { id: 'o1', name: 'Desenvolvimento de Ombros', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
        { id: 'o2', name: 'Elevação Lateral', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif' }
    ],
    'back-deltoids': [
        { id: 'od1', name: 'Crucifixo Invertido', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif' }
    ],
    'biceps': [
        { id: 'b1', name: 'Rosca Direta', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif' },
        { id: 'b2', name: 'Rosca Martelo', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif' }
    ],
    'triceps': [
        { id: 't1', name: 'Mergulho no Banco / Cadeira', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif' },
        { id: 't2', name: 'Extensão Tríceps (Coice)', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Kickback.gif' }
    ],
    'upper-back': [
        { id: 'ub1', name: 'Remada Sentada', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif' },
        { id: 'ub2', name: 'Puxada Alta', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif' }
    ],
    'lower-back': [
        { id: 'lb1', name: 'Extensão Lombar Suave', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Back-extension.gif' }
    ],
    'abs': [
        { id: 'ab1', name: 'Abdominal Tradicional', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif' },
        { id: 'ab2', name: 'Elevação de Pernas', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Raises.gif' }
    ],
    'obliques': [
        { id: 'ob1', name: 'Torção de Tronco Sentado', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif' }
    ],
    'quadriceps': [
        { id: 'q1', name: 'Agachamento Livre com Apoio', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif' },
        { id: 'q2', name: 'Extensão de Joelhos na Cadeira', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Extension.gif' }
    ],
    'hamstring': [
        { id: 'h1', name: 'Flexão de Pernas (Posterior)', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif' }
    ],
    'gluteal': [
        { id: 'g1', name: 'Elevação Pélvica (Ponte)', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge.gif' },
        { id: 'g2', name: 'Quatro Apoios (Glúteos)', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Donkey-Kicks.gif' }
    ],
    'calves': [
        { id: 'cal1', name: 'Elevação de Calcanhares', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Calf-Raises.gif' }
    ],
    'trapezius': [
        { id: 'tr1', name: 'Encolhimento de Ombros', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shrug.gif' }
    ]
};

const mapaWger = {
    'chest': 4, 'front-deltoids': 2, 'back-deltoids': 13, 'biceps': 1, 'triceps': 5,
    'abs': 6, 'obliques': 14, 'upper-back': 12, 'lower-back': 15, 'gluteal': 8,
    'quadriceps': 10, 'hamstring': 11, 'calves': 7, 'trapezius': 9
};

export const buscarExerciciosAPI = async (musculo) => {
    if (!musculo) return [];
    const principal = musculo.split(',')[0].trim();
    const backup = catalogoGarantido[principal] || [];

    const wgerId = mapaWger[principal];
    if (!wgerId) return backup;

    try {
        const url = `https://wger.de/api/v2/exerciseinfo/?muscles=${wgerId}&language=2&limit=30`;
        const response = await fetch(url);
        if (!response.ok) return backup;

        const data = await response.json();
        const comImagem = (data.results || []).filter(ex => ex.images && ex.images.length > 0);

        if (comImagem.length === 0) return backup;

        const formatados = comImagem.map(ex => {
            let imgUrl = ex.images[0].image;
            if (imgUrl && !imgUrl.startsWith('http')) {
                imgUrl = `https://wger.de${imgUrl}`;
            }
            return {
                id: String(ex.id),
                name: ex.name,
                gifUrl: imgUrl
            };
        });

        return [...formatados, ...backup];
    } catch (error) {
        return backup;
    }
};