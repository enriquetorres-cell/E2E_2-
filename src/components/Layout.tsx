import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          🚕 E2E Rides
        </Link>
        {user && (
          <nav className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/history">Historial</Link>
            <span className="nav-user">
              {user.firstName} · <span className="nav-role">{user.role}</span>
            </span>
            <button className="btn btn--ghost" onClick={handleLogout}>
              Salir
            </button>
          </nav>
        )}
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
