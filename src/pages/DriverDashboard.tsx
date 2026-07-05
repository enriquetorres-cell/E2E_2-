import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptTrip, getMyDriverTrips, getPendingTrips } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import type { Trip } from '../api/types';

export function DriverDashboard() {
  const { user, refresh } = useAuth();
  const [pending, setPending] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([getPendingTrips(), getMyDriverTrips()]);
      setPending(p);
      setMyTrips(m);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = myTrips.find((t) => t.status === 'IN_PROGRESS');

  const handleAccept = async (id: number) => {
    setError('');
    setAcceptingId(id);
    try {
      await acceptTrip(id);
      await Promise.all([load(), refresh()]);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo aceptar el viaje'));
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Hola, {user?.firstName} 🚗</h1>
          <p className="muted">
            Tu calificación: <span className="rating">★ {user?.rating.toFixed(1)}</span>
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Cargando…</p>}

      {active && (
        <div className="card card--highlight">
          <h2 className="section-title">Viaje activo</h2>
          <div className="trip-route">
            <strong>{active.pickupAddress}</strong>
            <span className="arrow">→</span>
            <strong>{active.dropoffAddress}</strong>
          </div>
          <div className="trip-meta">
            <StatusBadge status={active.status} />
            <span className="muted">
              Pasajero: {active.passenger.firstName} {active.passenger.lastName}
            </span>
          </div>
          <Link to={`/trips/${active.id}`} className="btn btn--primary">
            Ver y completar viaje
          </Link>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Viajes pendientes ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="muted">No hay viajes pendientes.</p>
        ) : (
          <div className="stack">
            {pending.map((t) => (
              <div key={t.id} className="trip-row trip-row--inset">
                <div className="trip-route">
                  <strong>{t.pickupAddress}</strong>
                  <span className="arrow">→</span>
                  <strong>{t.dropoffAddress}</strong>
                </div>
                <div className="trip-meta">
                  <span className="muted">
                    Pasajero: {t.passenger.firstName}
                  </span>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleAccept(t.id)}
                    disabled={acceptingId === t.id || !!active}
                    title={active ? 'Completa tu viaje activo primero' : ''}
                  >
                    {acceptingId === t.id ? 'Aceptando…' : 'Aceptar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
