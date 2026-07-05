import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTrips } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import type { Trip } from '../api/types';

export function PassengerDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTrips()
      .then(setTrips)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Hola, {user?.firstName} 👋</h1>
          <p className="muted">Tus viajes</p>
        </div>
        <Link to="/request" className="btn btn--primary">
          + Pedir viaje
        </Link>
      </div>

      {loading && <p className="muted">Cargando viajes…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && trips.length === 0 && (
        <div className="card empty">
          <p>Aún no tienes viajes.</p>
          <Link to="/request" className="btn btn--primary">
            Pedir tu primer viaje
          </Link>
        </div>
      )}

      <div className="stack">
        {trips.map((t) => (
          <Link to={`/trips/${t.id}`} key={t.id} className="card trip-row">
            <div className="trip-route">
              <strong>{t.pickupAddress}</strong>
              <span className="arrow">→</span>
              <strong>{t.dropoffAddress}</strong>
            </div>
            <div className="trip-meta">
              <StatusBadge status={t.status} />
              {t.driver && (
                <span className="muted">Conductor: {t.driver.firstName}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
