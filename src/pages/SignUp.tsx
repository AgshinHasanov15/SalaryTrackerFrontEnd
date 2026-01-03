import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const features = [
  'Track unlimited workers',
  'Monthly payment history',
  'Beautiful analytics dashboard',
  'Export payment reports',
];

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const result = await signUp(email, password, name);
    
    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to SalaryTracker.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Sign up failed',
        description: result.error || 'This email is already registered.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual with gradient */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 animate-fade-in">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                <Wallet className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">
                Salary<span className="text-primary">Tracker</span>
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Start managing your
              <br />
              <span className="gradient-text">team payments</span>
              <br />
              effortlessly
            </h2>

            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of businesses who trust SalaryTracker for their payroll management needs.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={feature}
                  className="flex items-center gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 border border-primary/20 rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 border border-primary/10 rounded-full" />
        <div className="absolute top-20 -right-20 w-60 h-60 border border-accent/20 rounded-full" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              Salary<span className="text-primary">Tracker</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Get started with your free account today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

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
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
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
                placeholder="Create a password"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="glow" 
              size="xl" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
