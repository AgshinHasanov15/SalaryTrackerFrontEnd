import { Payment, Worker } from '@/context/WorkersContext';
import { cn } from '@/lib/utils';
import { DollarSign, Calendar, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface PaymentCardProps {
  payment: Payment;
  worker?: Worker;
  onDelete?: (id: string) => void;
  showWorker?: boolean;
  className?: string;
}

export function PaymentCard({ 
  payment, 
  worker, 
  onDelete, 
  showWorker = false,
  className 
}: PaymentCardProps) {
  return (
    <div className={cn(
      "glass-card p-4 group hover:border-primary/20 transition-all duration-200",
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Amount icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-foreground">
                ₼{payment.amount.toLocaleString()}
              </span>
              {showWorker && worker && (
                <span className="text-sm text-muted-foreground">
                  to {worker.fullName}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(payment.date), 'MMM d, yyyy')}
              </span>
              {payment.note && (
                <span className="flex items-center gap-1 truncate">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{payment.note}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(payment.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
