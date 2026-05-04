// Wrapped In Love — custom SVG logo
// A circle (wholeness, love's completeness) with a subtle heart formed by
// the negative space of two arcs — minimal, works at any size

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Wrapped In Love"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      {/* Inner heart-like mark — two curved arcs meeting at a point */}
      <path
        d="M20 28 C20 28 11 22 11 16 C11 12.5 14 10 17 11.5 C18.5 12.2 19.5 13 20 14 C20.5 13 21.5 12.2 23 11.5 C26 10 29 12.5 29 16 C29 22 20 28 20 28Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={28} />
      <div className="flex flex-col leading-tight">
        <span
          className="font-display text-[15px] font-light tracking-[0.18em] uppercase"
          style={{ color: "var(--color-gold)" }}
        >
          Wrapped In Love
        </span>
        <span
          className="text-[9px] tracking-[0.3em] uppercase font-light"
          style={{ color: "var(--color-rose)" }}
        >
          Growth Spurt Ministries
        </span>
      </div>
    </div>
  );
}
