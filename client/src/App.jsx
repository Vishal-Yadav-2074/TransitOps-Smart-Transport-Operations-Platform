import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';
import { ToastProvider } from './contexts/ToastContext';

// Lazy loaded page components (Phase 14 Optimization)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Drivers = lazy(() => import('./pages/Drivers'));
const Trips = lazy(() => import('./pages/Trips'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const FuelExpenses = lazy(() => import('./pages/FuelExpenses'));
const Reports = lazy(() => import('./pages/Reports'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const Settings = lazy(() => import('./pages/Settings'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Authorization protector wrapping layout paths
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<Loader fullPage />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Layout and Sub-Pages */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="trips" element={<Trips />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="expenses" element={<FuelExpenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;
