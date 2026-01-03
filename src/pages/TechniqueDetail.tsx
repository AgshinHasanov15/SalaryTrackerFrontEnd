import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Truck,
  Calendar as CalendarIcon,
  Clock,
  CircleDollarSign,
  TrendingUp,
  Trash2,
  Edit,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FocusModeCalendar } from '@/components/FocusModeCalendar';
import { useTechniques } from '@/context/TechniquesContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

export default function TechniqueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    techniques,
    getDailyRent,
    getTotalWorkingDays,
    getTotalDayOffs,
    getTotalRent,
    toggleDayOff,
    endTechnique,
    deleteTechnique,
    updateTechnique,
  } = useTechniques();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDayOffCalendarOpen, setIsDayOffCalendarOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editWorkingDays, setEditWorkingDays] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEndDate, setEditEndDate] = useState<Date | undefined>();

  const technique = techniques.find(t => t.id === id);

  // Lock body scroll when day off calendar modal is open
  useEffect(() => {
    if (isDayOffCalendarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDayOffCalendarOpen]);

  if (!technique) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="glass-card p-12 text-center">
            <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Technique not found</h3>
            <Button variant="outline" onClick={() => navigate('/techniques')}>
              Back to Techniques
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const dailyRent = getDailyRent(technique);
  const totalDays = getTotalWorkingDays(technique);
  const dayOffs = getTotalDayOffs(technique);
  const workingDays = totalDays - dayOffs;
  const totalRent = getTotalRent(technique);

  const handleDelete = () => {
    deleteTechnique(technique.id);
    toast({
      title: 'Deleted',
      description: `${technique.name} has been deleted`,
    });
    navigate('/techniques');
  };

  const handleEnd = () => {
    endTechnique(technique.id);
    toast({
      title: 'Ended',
      description: `${technique.name} rental has been marked as ended`,
    });
  };

  const openEditModal = () => {
    setEditName(technique.name);
    setEditMonthlyRent(technique.monthlyRent.toString());
    setEditWorkingDays(technique.plannedWorkingDays.toString());
    setEditDescription(technique.description || '');
    setEditEndDate(technique.endDate);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    updateTechnique(technique.id, {
      name: editName,
      monthlyRent: parseFloat(editMonthlyRent),
      plannedWorkingDays: parseInt(editWorkingDays),
      description: editDescription || undefined,
      endDate: editEndDate,
      status: editEndDate ? 'ended' : technique.status,
    });
    toast({
      title: 'Updated',
      description: `${editName} has been updated`,
    });
    setIsEditModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/techniques')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                technique.status === 'active'
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{technique.name}</h1>
                <Badge
                  variant={technique.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    "text-xs",
                    technique.status === 'active'
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {technique.status === 'active' ? 'Active' : 'Ended'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditModal}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {technique.status === 'active' && (
              <Button variant="outline" size="sm" onClick={handleEnd}>
                Mark as Ended
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Technique</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {technique.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Description */}
        {technique.description && (
          <div className="glass-card p-4 animate-fade-in-up delay-100">
            <p className="text-muted-foreground">{technique.description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-200">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CircleDollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Daily Rent</span>
            </div>
            <p className="text-2xl font-bold">{dailyRent.toFixed(2)} ₼</p>
            <p className="text-xs text-muted-foreground mt-1">
              {technique.monthlyRent.toLocaleString()} ₼ / {technique.plannedWorkingDays} days
            </p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Working Days</span>
            </div>
            <p className="text-2xl font-bold text-success">{workingDays}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDays} total - {dayOffs} off days
            </p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Day Offs</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{dayOffs}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click calendar to toggle
            </p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Rent</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {totalRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {workingDays} × {dailyRent.toFixed(2)} ₼
            </p>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="glass-card p-4 animate-fade-in-up delay-300">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Rental Period:</span>
            <span className="font-medium">
              {format(new Date(technique.startDate), 'dd.MM.yyyy')}
              {' → '}
              {technique.endDate
                ? format(new Date(technique.endDate), 'dd.MM.yyyy')
                : 'Present (ongoing)'}
            </span>
          </div>
        </div>

        {/* Day Off Calendar Trigger */}
        <div className="animate-fade-in-up delay-400">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Day Off Calendar</h2>
            <Button
              variant="outline"
              onClick={() => setIsDayOffCalendarOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Open Calendar
            </Button>
          </div>
          <div className="glass-card p-4 text-center text-muted-foreground">
            <p>Click "Open Calendar" to mark day offs</p>
            <p className="text-sm mt-1">{dayOffs} day(s) marked as off</p>
          </div>
        </div>

        {/* Day Offs List */}
        {technique.dayOffs.length > 0 && (
          <div className="glass-card p-4 animate-fade-in-up delay-500">
            <h3 className="font-semibold mb-3">Marked Day Offs ({technique.dayOffs.length})</h3>
            <div className="flex flex-wrap gap-2">
              {technique.dayOffs
                .sort()
                .map(dateStr => (
                  <Badge
                    key={dateStr}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleDayOff(technique.id, new Date(dateStr))}
                  >
                    {format(new Date(dateStr), 'dd.MM.yyyy')}
                    <span className="ml-1 text-destructive">×</span>
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Technique
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Technique Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rent">Monthly Rent (₼)</Label>
                <Input
                  id="edit-rent"
                  type="number"
                  value={editMonthlyRent}
                  onChange={(e) => setEditMonthlyRent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-days">Planned Working Days</Label>
                <Input
                  id="edit-days"
                  type="number"
                  value={editWorkingDays}
                  onChange={(e) => setEditWorkingDays(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editEndDate ? format(editEndDate, 'dd.MM.yyyy') : 'Set end date to close rental'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editEndDate}
                    onSelect={setEditEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {editEndDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setEditEndDate(undefined)}
                >
                  Clear end date
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description / Notes</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="glow" className="flex-1" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Focus Mode Calendar - Full Screen Overlay */}
      <FocusModeCalendar
        technique={technique}
        isOpen={isDayOffCalendarOpen}
        onToggleDayOff={(date) => toggleDayOff(technique.id, date)}
        onClose={() => setIsDayOffCalendarOpen(false)}
      />
    </AppLayout>
  );
}
