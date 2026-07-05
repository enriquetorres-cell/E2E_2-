import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, getAvailableDrivers } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { User } from '../api/types';

export function RequestTrip() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAvailableDrivers()
      .then(setDrivers)
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const trip = await createTrip({ pickupAddress: pickup, dropoffAddress: dropoff });
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo crear el viaje'));
      setSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <h1>Pedir un viaje</h1>

      <div className="card">
        <h2 className="section-title">Conductores disponibles ({drivers.length})</h2>
        {drivers.length === 0 ? (
          <p className="muted">No hay conductores disponibles en este momento.</p>
        ) : (
          <ul className="driver-list">
            {drivers.map((d) => (
              <li key={d.id} className="driver-item">
                <span>
                  {d.firstName} {d.lastName}
                </span>
                <span className="rating">★ {d.rating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card form">
        <label className="field">
          <span>Origen</span>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Ej: Av. Larco 123"
            required
          />
        </label>
        <label className="field">
          <span>Destino</span>
          <input
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="Ej: Aeropuerto Jorge Chávez"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creando…' : 'Confirmar viaje'}
        </button>
      </form>
    </div>
  );
}
