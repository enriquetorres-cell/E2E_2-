import type { TripStatus } from '../api/types';

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
};

export function StatusBadge({ status }: { status: TripStatus }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{LABELS[status]}</span>;
}
