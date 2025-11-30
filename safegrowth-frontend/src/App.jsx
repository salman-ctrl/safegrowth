import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute'; 

import LandingPage from './pages/user/LandingPage';
import MapPage from './pages/user/MapPage';
import ReportPage from './pages/user/ReportPage';
import RoutePage from './pages/user/RoutePage';

import LoginPage from './pages/admin/LoginPage'; 
import Dashboard from './pages/admin/Dashboard';
import ReportsAdmin from './pages/admin/ReportsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<UserLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="route" element={<RoutePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

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
        
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;