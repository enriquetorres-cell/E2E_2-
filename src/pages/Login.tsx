import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../api/client';
import type { Role } from '../api/types';

type Mode = 'login' | 'register';

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goByRole = (userRole: Role) => {
    navigate(userRole === 'DRIVER' ? '/driver' : '/passenger', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user =
        mode === 'login'
          ? await login({ email, password })
          : await register({ firstName, lastName, email, password, role });
      goByRole(user.role);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo autenticar'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card card">
      <div className="tabs">
        <button
          className={`tab ${mode === 'login' ? 'tab--active' : ''}`}
          onClick={() => setMode('login')}
          type="button"
        >
          Iniciar sesión
        </button>
        <button
          className={`tab ${mode === 'register' ? 'tab--active' : ''}`}
          onClick={() => setMode('register')}
          type="button"
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {mode === 'register' && (
          <>
            <label className="field">
              <span>Nombre</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Apellido</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {mode === 'register' && (
          <label className="field">
            <span>Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="PASSENGER">Pasajero</option>
              <option value="DRIVER">Conductor</option>
            </select>
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <p className="hint">
        Datos de prueba: <code>ana@uber.com</code> / <code>pass123</code> (pasajero) ·{' '}
        <code>carlos@uber.com</code> / <code>pass123</code> (conductor)
      </p>
    </div>
  );
}
