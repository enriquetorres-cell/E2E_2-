import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { completeTrip, getTrip, rateTrip } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { StarRating } from '../components/StarRating';
import type { Trip } from '../api/types';

const POLL_MS = 4000;

export function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const { user, refresh } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Rating form state (passenger)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [completing, setCompleting] = useState(false);

  const isDriver = user?.role === 'DRIVER';

  const load = useCallback(async () => {
    try {
      const t = await getTrip(tripId);
      setTrip(t);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo cargar el viaje'));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 4s while PENDING or IN_PROGRESS to simulate live tracking
  const statusRef = useRef(trip?.status);
  statusRef.current = trip?.status;
  useEffect(() => {
    const shouldPoll = trip?.status === 'PENDING' || trip?.status === 'IN_PROGRESS';
    if (!shouldPoll) return;
    const timer = setInterval(() => {
      if (statusRef.current === 'PENDING' || statusRef.current === 'IN_PROGRESS') {
        load();
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [trip?.status, load]);

  const handleComplete = async () => {
    setCompleting(true);
    setError('');
    try {
      const updated = await completeTrip(tripId);
      setTrip(updated);
      await refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo completar el viaje'));
    } finally {
      setCompleting(false);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setRatingError('Selecciona de 1 a 5 estrellas');
      return;
    }
    setRatingSubmitting(true);
    setRatingError('');
    try {
      const updated = await rateTrip(tripId, { rating, comment: comment || undefined });
      setTrip(updated);
    } catch (err) {
      setRatingError(apiErrorMessage(err, 'No se pudo calificar'));
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) return <p className="muted">Cargando viaje…</p>;
  if (error && !trip) return <p className="error">{error}</p>;
  if (!trip) return <p className="error">Viaje no encontrado.</p>;

  const canRate =
    !isDriver && trip.status === 'COMPLETED' && trip.passengerRating == null;

  return (
    <div className="stack">
      <Link to="/" className="muted back-link">
        ← Volver
      </Link>

      <div className="card">
        <div className="page-head">
          <h1>Viaje #{trip.id}</h1>
          <StatusBadge status={trip.status} />
        </div>

        <div className="detail-grid">
          <div>
            <span className="label">Origen</span>
            <p>{trip.pickupAddress}</p>
          </div>
          <div>
            <span className="label">Destino</span>
            <p>{trip.dropoffAddress}</p>
          </div>
          <div>
            <span className="label">Solicitado</span>
            <p>{new Date(trip.requestedAt).toLocaleString()}</p>
          </div>
          {trip.completedAt && (
            <div>
              <span className="label">Completado</span>
              <p>{new Date(trip.completedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver's / passenger's counterpart info */}
      <div className="card">
        {isDriver ? (
          <>
            <h2 className="section-title">Pasajero</h2>
            <p>
              {trip.passenger.firstName} {trip.passenger.lastName}
            </p>
            <p className="muted">{trip.passenger.email}</p>
          </>
        ) : (
          <>
            <h2 className="section-title">Conductor</h2>
            {trip.driver ? (
              <p>
                {trip.driver.firstName} {trip.driver.lastName}{' '}
                <span className="rating">★ {trip.driver.rating.toFixed(1)}</span>
              </p>
            ) : (
              <p className="muted searching">🔎 Buscando conductor…</p>
            )}
          </>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Driver: complete button */}
      {isDriver && trip.status === 'IN_PROGRESS' && (
        <button className="btn btn--primary" onClick={handleComplete} disabled={completing}>
          {completing ? 'Completando…' : 'Completar viaje'}
        </button>
      )}

      {/* Driver: completed summary */}
      {isDriver && trip.status === 'COMPLETED' && (
        <div className="card card--highlight">
          <h2 className="section-title">Viaje completado ✓</h2>
          {trip.passengerRating != null ? (
            <p>
              El pasajero te calificó:{' '}
              <StarRating value={trip.passengerRating} size={18} />
            </p>
          ) : (
            <p className="muted">Aún sin calificación del pasajero.</p>
          )}
          {trip.ratingComment && <p>“{trip.ratingComment}”</p>}
        </div>
      )}

      {/* Passenger: rating form */}
      {canRate && (
        <form onSubmit={handleRate} className="card form">
          <h2 className="section-title">Califica tu viaje</h2>
          <StarRating value={rating} onChange={setRating} size={30} />
          <label className="field">
            <span>Comentario (opcional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="¿Cómo estuvo el viaje?"
            />
          </label>
          {ratingError && <p className="error">{ratingError}</p>}
          <button className="btn btn--primary" disabled={ratingSubmitting}>
            {ratingSubmitting ? 'Enviando…' : 'Enviar calificación'}
          </button>
        </form>
      )}

      {/* Passenger: already rated */}
      {!isDriver && trip.status === 'COMPLETED' && trip.passengerRating != null && (
        <div className="card card--highlight">
          <h2 className="section-title">Tu calificación</h2>
          <StarRating value={trip.passengerRating} size={22} />
          {trip.ratingComment && <p>“{trip.ratingComment}”</p>}
        </div>
      )}
    </div>
  );
}
