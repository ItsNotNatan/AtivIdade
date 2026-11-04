// FILE: src/services/api.js
import axios from 'axios';

const api = axios.create({
    // Adicionado o fallback para localhost:3000
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erro de comunicação com o Back-end:", error);
        return Promise.reject(error);
    }
);

export default api;