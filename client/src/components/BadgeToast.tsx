import { useEffect, useState } from 'react';
import type { BadgeNotification } from '@/hooks/useBadges';

interface BadgeToastProps {
  badge: BadgeNotification | null;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      // Small delay so the animation triggers after mount
      const show = setTimeout(() => setVisible(true), 50);
      // Auto-dismiss after 4 seconds
      const hide = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 400); // Wait for fade-out before clearing
      }, 4500);
      return () => {
        clearTimeout(show);
        clearTimeout(hide);
      };
    } else {
      setVisible(false);
    }
  }, [badge, onDismiss]);

  if (!badge) return null;

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
      style={{
        position: 'fixed',
        bottom: '88px', // above mobile browser chrome
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        zIndex: 100,
        maxWidth: '320px',
        width: 'calc(100vw - 48px)',
        cursor: 'pointer',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(25,59,137,0.97) 0%, rgba(13,28,67,0.97) 100%)',
          border: '1px solid rgba(250,178,77,0.45)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(13,28,67,0.7), 0 0 0 1px rgba(250,178,77,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(250,178,77,0.12)',
            border: '1px solid rgba(250,178,77,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}
        >
          {badge.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#FAB24D',
              marginBottom: '3px',
            }}
          >
            Badge Earned
          </p>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '3px',
            }}
          >
            {badge.name}
          </p>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(207,150,153,0.85)',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}
