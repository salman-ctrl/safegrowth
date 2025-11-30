import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const ProtectedRoute = ({ children }) => {
    const isAuth = authService.isAuthenticated();

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;