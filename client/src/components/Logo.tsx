export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  const padding = Math.round(size * 0.15);
  const containerSize = size + padding * 2;
  return (
    <div
      className={className}
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: '50%',
        backgroundColor: 'var(--color-cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src="/brand-mark.png"
        alt="Wrapped In Love"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
    </div>
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
          Remarkable Impact
        </span>
      </div>
    </div>
  );
}
