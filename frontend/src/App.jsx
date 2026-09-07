import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import AddPayment from './pages/AddPayment';
import EditPayment from './pages/EditPayment';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';

import './styles/App.css';
import './styles/components.css';

// Responsive App Shell
const AppShell = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showBack =
    location.pathname.startsWith('/payments/add') ||
    location.pathname.startsWith('/payments/edit') ||
    location.pathname.startsWith('/admin/payments');

  return (
    <div className="app-wrapper">
      <Navbar showBack={showBack} />

      <main className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/payments" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/payments" replace /> : <Register />}
          />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/add" element={<AddPayment />} />
            <Route path="/payments/edit/:id" element={<EditPayment />} />
          </Route>

          {/* Admin Only Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
          </Route>

          {/* Fallback Redirects */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/payments' : '/login'} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/payments' : '/login'} replace />}
          />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile/tablet screens only) */}
      {isAuthenticated && !isAuthPage && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
