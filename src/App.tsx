import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { RequestTrip } from './pages/RequestTrip';
import { DriverDashboard } from './pages/DriverDashboard';
import { TripDetail } from './pages/TripDetail';
import { History } from './pages/History';

/** Sends the user to the dashboard that matches their role. */
function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center muted">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RoleHome />} />

            <Route
              path="/passenger"
              element={
                <ProtectedRoute role="PASSENGER">
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request"
              element={
                <ProtectedRoute role="PASSENGER">
                  <RequestTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver"
              element={
                <ProtectedRoute role="DRIVER">
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <TripDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
