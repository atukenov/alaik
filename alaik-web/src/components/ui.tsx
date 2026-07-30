import { useState, type CSSProperties, type ReactNode } from 'react';

export function ProgressBar({ pct, className = '' }: { pct: number; className?: string }) {
  return (
    <div className={`h-[9px] overflow-hidden rounded-pill bg-card2 ${className}`}>
      <div
        className="h-full rounded-pill bg-primary transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

// Real photo when `src` is given (falls back on error). Without an image it shows
// `icon` if provided (e.g. a gift glyph), otherwise an optional mono label.
export function Placeholder({
  label,
  src,
  icon,
  className = '',
  style,
}: {
  label?: string;
  src?: string | null;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-card2 ${className}`}
      style={{
        backgroundImage: showImage
          ? undefined
          : 'repeating-linear-gradient(45deg, rgba(224,102,79,.08) 0 7px, transparent 7px 14px)',
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : icon ? (
        <span className="text-accent/60">{icon}</span>
      ) : (
        label && <span className="font-mono text-[8px] text-muted">{label}</span>
      )}
    </div>
  );
}

export function TypeChip({ label }: { label: string }) {
  return (
    <span className="rounded-pill bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-white">
      {label}
    </span>
  );
}
