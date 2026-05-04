import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1C43',
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.25rem',
          color: 'rgba(250, 178, 77, 0.6)',
          fontStyle: 'italic',
        }}>
          Loading your journey...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
