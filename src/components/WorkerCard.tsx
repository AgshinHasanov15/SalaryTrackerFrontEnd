import { useNavigate } from 'react-router-dom';
import { Worker, useWorkers } from '@/context/WorkersContext';
import { cn } from '@/lib/utils';
import { User, Briefcase, ChevronRight } from 'lucide-react';

interface WorkerCardProps {
  worker: Worker;
  className?: string;
}

export function WorkerCard({ worker, className }: WorkerCardProps) {
  const navigate = useNavigate();
  const { getWorkerPaymentStatus, getTotalPaidForWorkerThisMonth } = useWorkers();
  const status = getWorkerPaymentStatus(worker.id);
  const totalPaid = getTotalPaidForWorkerThisMonth(worker.id);

  return (
    <div
      onClick={() => navigate(`/workers/${worker.id}`)}
      className={cn(
        "glass-card-hover p-5 cursor-pointer group relative overflow-hidden",
        className
      )}
    >
      {/* Paid indicator glow */}
      {status === 'full' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-success to-success/50" />
      )}
      {status === 'partial' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-500/50" />
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden",
            "bg-secondary flex items-center justify-center"
          )}
        >
          {worker.photo ? (
            <img
              src={worker.photo}
              alt={worker.fullName} // updated
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {worker.fullName} {/* updated */}
            </h3>
            {/* Paid status indicator */}
            {status === 'full' && <span className="text-base flex-shrink-0">✔️</span>}
            {status === 'partial' && <span className="text-base flex-shrink-0">🟧</span>}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate">{worker.position}</span>
          </div>

          {worker.monthlySalary !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {totalPaid.toLocaleString()}/{worker.monthlySalary.toLocaleString()} ₼
              </span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Description preview */}
      {worker.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 pl-[72px]">
          {worker.description}
        </p>
      )}
    </div>
  );
}
