import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDriverTrips, getMyTrips } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import type { Trip, TripStatus } from '../api/types';

type Filter = 'ALL' | TripStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completado' },
];

export function History() {
  const { user } = useAuth();
  const isDriver = user?.role === 'DRIVER';
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetcher = isDriver ? getMyDriverTrips : getMyTrips;
    fetcher()
      .then(setTrips)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isDriver]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter],
  );

  return (
    <div className="stack">
      <h1>Historial</h1>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`chip ${filter === f.value ? 'chip--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="muted">No hay viajes para este filtro.</p>
      )}

      {filtered.length > 0 && (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>{isDriver ? 'Pasajero' : 'Conductor'}</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.pickupAddress}</td>
                  <td>{t.dropoffAddress}</td>
                  <td>
                    {isDriver
                      ? `${t.passenger.firstName} ${t.passenger.lastName}`
                      : t.driver
                        ? `${t.driver.firstName} ${t.driver.lastName}`
                        : '—'}
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <Link to={`/trips/${t.id}`} className="link">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
