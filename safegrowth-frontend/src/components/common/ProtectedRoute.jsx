import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const ProtectedRoute = ({ children }) => {
    // Tanya service auth: "User ini login gak?"
    const isAuth = authService.isAuthenticated();

    if (!isAuth) {
        // Kalau tidak, tendang ke /login
        return <Navigate to="/login" replace />;
    }

    // Kalau iya, izinkan masuk (render komponen anak)
    return children;
};

export default ProtectedRoute;