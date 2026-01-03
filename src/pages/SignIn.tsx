import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const { user, signIn, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Redirect automatically when user state updates
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await signIn(email, password);

    if (!result.success) {
      toast({
        title: 'Sign in failed',
        description: result.error || 'Invalid email or password',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    });

    // ✅ DO NOT navigate here manually
    // useEffect above will handle the redirect automatically
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              Salary<span className="text-primary">Tracker</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to manage your team's payments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" variant="glow" size="xl" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center p-12 animate-fade-in">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Streamline Your Payroll
            </h2>
            <p className="text-muted-foreground">
              Track employee salaries, manage payments, and stay organized with our intuitive dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
