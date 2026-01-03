import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Loader2 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect based on auth status
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6 animate-pulse">
        <Wallet className="h-8 w-8 text-primary-foreground" />
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}
