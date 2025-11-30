import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const authService = {
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            if (response.data.success) {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
    },

    isAuthenticated: () => {
        return localStorage.getItem('isAdmin') === 'true';
    }
};