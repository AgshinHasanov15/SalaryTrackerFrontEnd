import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "glass-card-hover p-6 relative overflow-hidden group",
      className
    )}>
      {/* Background gradient accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-30",
        variant === 'primary' && "bg-primary",
        variant === 'accent' && "bg-accent",
        variant === 'default' && "bg-muted-foreground"
      )} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            variant === 'primary' && "bg-primary/10 text-primary",
            variant === 'accent' && "bg-accent/10 text-accent",
            variant === 'default' && "bg-secondary text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {trend && (
            <span className={cn(
              "text-sm font-medium mb-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
