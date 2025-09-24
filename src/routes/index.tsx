import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardLayout from '@layouts/DashboardLayout';
import LoginPage from '@features/auth/LoginPage';
import DashboardPage from '@features/dashboard/DashboardPage';
import { useAppSelector } from '@store/hooks';

export function AppRoutes() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={isAuthed ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthed ? '/' : '/login'} replace />} />
    </Routes>
  );
}
