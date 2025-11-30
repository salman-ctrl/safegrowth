import axios from 'axios';

// Pastikan port sesuai backend Anda
const API_URL = 'http://localhost:3000/api';

export const authService = {
    // Fungsi Login
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            if (response.data.success) {
                // Simpan "bukti" login di LocalStorage
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Fungsi Logout
    logout: () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        // Redirect manual ke login page
        window.location.href = '/login';
    },

    // Cek apakah sedang login?
    isAuthenticated: () => {
        return localStorage.getItem('isAdmin') === 'true';
    }
};