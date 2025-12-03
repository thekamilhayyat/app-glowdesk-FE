import React, { useMemo, useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { useStaffStore } from '@/stores/staffStore';
import type { StaffMember, StaffGoal } from '@/types/staff';
import { format, subDays, subMonths } from 'date-fns';

interface StaffPerformanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

type TimePeriod = '7d' | '30d' | '90d' | 'year';

export const StaffPerformanceDrawer: React.FC<StaffPerformanceDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { performanceMetrics, staffGoals, getPerformanceMetrics } = useStaffStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

  const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
    const end = new Date();
    let start: Date;
    switch (period) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case 'year':
        start = subMonths(end, 12);
        break;
    }
    return { start, end };
  };

  const metrics = useMemo(() => {
    const { start, end } = getDateRange(timePeriod);
    const stored = getPerformanceMetrics(staffMember.id, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    
    return stored || {
      staffId: staffMember.id,
      periodStart: format(start, 'yyyy-MM-dd'),
      periodEnd: format(end, 'yyyy-MM-dd'),
      totalRevenue: 12500,
      serviceRevenue: 10000,
      productRevenue: 2500,
      appointmentsCompleted: 85,
      appointmentsCancelled: 3,
      newClients: 12,
      returningClients: 73,
      averageTicket: 147.06,
      rebookingRate: 78,
      utilizationRate: 82,
      clientSatisfaction: 4.8,
    };
  }, [staffMember.id, timePeriod, getPerformanceMetrics]);

  const goals = staffGoals.filter(g => g.staffId === staffMember.id && g.status !== 'cancelled');

  const getGoalProgress = (goal: StaffGoal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const estimatedCommission = (metrics.serviceRevenue * (staffMember.serviceCommissionRate || 10) / 100) +
    (metrics.productRevenue * (staffMember.productCommissionRate || 5) / 100);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue, 
    trend,
    iconColor = 'text-primary'
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    iconColor?: string;
  }) => (
    <BaseCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </BaseCard>
  );

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Performance - ${staffMember.firstName} ${staffMember.lastName}`}
      width={650}
      footer={
        <BaseButton
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Close
        </BaseButton>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Performance Overview</h3>
          <BaseSelect value={timePeriod} onValueChange={(v: TimePeriod) => setTimePeriod(v)}>
            <BaseSelectItem value="7d">Last 7 Days</BaseSelectItem>
            <BaseSelectItem value="30d">Last 30 Days</BaseSelectItem>
            <BaseSelectItem value="90d">Last 90 Days</BaseSelectItem>
            <BaseSelectItem value="year">Last Year</BaseSelectItem>
          </BaseSelect>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            subValue={`Services: $${metrics.serviceRevenue.toLocaleString()} | Products: $${metrics.productRevenue.toLocaleString()}`}
            trend="up"
            iconColor="text-green-500"
          />
          <StatCard
            icon={Target}
            label="Avg. Ticket"
            value={`$${metrics.averageTicket.toFixed(2)}`}
            trend="up"
            iconColor="text-blue-500"
          />
          <StatCard
            icon={Calendar}
            label="Appointments"
            value={metrics.appointmentsCompleted}
            subValue={`${metrics.appointmentsCancelled} cancelled`}
            iconColor="text-purple-500"
          />
          <StatCard
            icon={Clock}
            label="Utilization"
            value={`${metrics.utilizationRate}%`}
            iconColor="text-orange-500"
          />
          <StatCard
            icon={Users}
            label="Clients"
            value={metrics.newClients + metrics.returningClients}
            subValue={`${metrics.newClients} new | ${metrics.returningClients} returning`}
            iconColor="text-cyan-500"
          />
          <StatCard
            icon={Star}
            label="Satisfaction"
            value={metrics.clientSatisfaction?.toFixed(1) || 'N/A'}
            iconColor="text-yellow-500"
          />
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Commission</p>
              <p className="text-2xl font-bold text-primary">
                ${estimatedCommission.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Active Goals
            </h3>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active goals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <BaseCard key={goal.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{goal.type} goal</p>
                      </div>
                      <BaseBadge 
                        variant={
                          goal.status === 'achieved' ? 'default' :
                          goal.status === 'active' ? 'secondary' :
                          'outline'
                        }
                      >
                        {goal.status}
                      </BaseBadge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {goal.currentValue} / {goal.targetValue}
                        </span>
                        <span className="font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 75 ? 'bg-primary' :
                            progress >= 50 ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(goal.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </BaseCard>
                );
              })}
            </div>
          )}
        </div>

        <BaseCard className="p-4">
          <h4 className="font-medium mb-3">Rebooking Rate</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{metrics.rebookingRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-primary/70"
                  style={{ width: `${metrics.rebookingRate}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.rebookingRate}% of clients rebooked for additional services
          </p>
        </BaseCard>
      </div>
    </BaseDrawer>
  );
};
