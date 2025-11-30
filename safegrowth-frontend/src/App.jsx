import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT LAYOUTS & AUTH ---
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute'; // Import Satpam

// --- IMPORT PAGES (USER) ---
import LandingPage from './pages/user/LandingPage';
import MapPage from './pages/user/MapPage';
import ReportPage from './pages/user/ReportPage';
import RoutePage from './pages/user/RoutePage';

// --- IMPORT PAGES (ADMIN) ---
import LoginPage from './pages/admin/LoginPage'; // Halaman Login Baru
import Dashboard from './pages/admin/Dashboard';
import ReportsAdmin from './pages/admin/ReportsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* === RUTE USER (PUBLIK - BEBAS AKSES) === */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="route" element={<RoutePage />} />
        </Route>

        {/* === RUTE LOGIN ADMIN (BEBAS AKSES) === */}
        <Route path="/login" element={<LoginPage />} />

        {/* === RUTE ADMIN (DIPROTEKSI - HARUS LOGIN) === */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<ReportsAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
        
        {/* === 404 === */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;