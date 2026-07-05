interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

/** Read-only when onChange is omitted, interactive otherwise. */
export function StarRating({ value, onChange, size = 22 }: Props) {
  const interactive = typeof onChange === 'function';
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? 'star--on' : ''} ${interactive ? 'star--interactive' : ''}`}
          onClick={interactive ? () => onChange!(n) : undefined}
          disabled={!interactive}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
