// src/utils/formatadores.js

/**
 * Aplica a máscara de moeda brasileira (R$) enquanto o utilizador digita.
 * Remove letras, simula as casas decimais e adiciona os pontos de milhar.
 * Exemplo de entrada "1000" -> Saída "10,00"
 * 
 * @param {string|number} valor - O valor bruto digitado
 * @returns {string} Valor formatado como dinheiro
 */
export const formatarMoeda = (valor) => {
    if (!valor) return '';

    // 1. Remove tudo o que não for número
    let v = valor.toString().replace(/\D/g, '');

    if (v === '') return '';

    // 2. Divide por 100 para criar os cêntimos/centavos
    v = (parseInt(v, 10) / 100).toFixed(2);

    // 3. Troca o ponto por vírgula e adiciona os pontos divisores de milhares
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

    return v;
};

/**
 * Aplica a máscara de telefone (Fixo ou Telemóvel).
 * Limita o tamanho a 11 números e ajusta a posição do traço dinamicamente.
 * Exemplo de entrada "11987654321" -> Saída "(11) 98765-4321"
 * 
 * @param {string} valor - O número de telefone bruto
 * @returns {string} Telefone formatado com parênteses e traço
 */
export const formatarTelefone = (valor) => {
    if (!valor) return '';

    // 1. Remove tudo o que não for número
    let v = valor.toString().replace(/\D/g, '');

    // 2. Limita o tamanho máximo a 11 dígitos (2 do DDD + 9 do número)
    if (v.length > 11) v = v.substring(0, 11);

    // 3. Aplica a máscara dependendo da quantidade de dígitos
    if (v.length <= 10) {
        // Formato para telefone fixo: (XX) XXXX-XXXX
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        // Formato para telemóvel: (XX) XXXXX-XXXX
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }

    return v;
};