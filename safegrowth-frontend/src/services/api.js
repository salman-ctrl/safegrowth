import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const reportService = {
    getAll: async () => {
        const response = await api.get('/reports');
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/reports/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    },

    addValidation: async (data) => {
        const response = await api.post('/validations', data);
        return response.data;
    }
};

export const getImageUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}/${path}`;
};

export default api;