import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseBadge } from '@/components/base/BaseBadge';
import { 
  DollarSign, 
  Clock, 
  Percent, 
  FileText,
  Download,
  TrendingUp
} from 'lucide-react';
import { useStaffStore } from '@/stores/staffStore';
import type { StaffMember } from '@/types/staff';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

interface PayrollSummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

export const PayrollSummaryDrawer: React.FC<PayrollSummaryDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { generatePayrollSummary, payrollSummaries } = useStaffStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const payrollSummary = useMemo(() => {
    const existing = payrollSummaries.find(
      ps => ps.staffId === staffMember.id &&
      format(new Date(ps.periodStart), 'yyyy-MM') === format(monthStart, 'yyyy-MM')
    );

    if (existing) return existing;

    return generatePayrollSummary(staffMember.id, format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd'));
  }, [payrollSummaries, staffMember.id, monthStart, monthEnd, generatePayrollSummary]);

  const handleExport = () => {
    const data = {
      staff: `${staffMember.firstName} ${staffMember.lastName}`,
      period: `${format(monthStart, 'MMM d')} - ${format(monthEnd, 'MMM d, yyyy')}`,
      ...payrollSummary,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${staffMember.firstName}_${format(monthStart, 'yyyy-MM')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Payroll - ${staffMember.firstName} ${staffMember.lastName}`}
      width={550}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            variant="outline"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </BaseButton>
          <BaseButton
            variant="gradient"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          >
            Previous
          </BaseButton>
          <div className="text-center">
            <p className="font-medium">{format(selectedMonth, 'MMMM yyyy')}</p>
            <p className="text-sm text-muted-foreground">
              {format(monthStart, 'MMM d')} - {format(monthEnd, 'MMM d')}
            </p>
          </div>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
            disabled={format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
          >
            Next
          </BaseButton>
        </div>

        {payrollSummary && (
          <>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Gross Pay</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                ${payrollSummary.grossPay.toLocaleString()}
              </p>
              <BaseBadge variant="secondary" className="mt-2">
                {payrollSummary.status}
              </BaseBadge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <BaseCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Hours Worked</span>
                </div>
                <p className="text-2xl font-bold">{payrollSummary.regularHours}</p>
                <p className="text-xs text-muted-foreground">Regular hours</p>
              </BaseCard>

              <BaseCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Overtime</span>
                </div>
                <p className="text-2xl font-bold">{payrollSummary.overtimeHours}</p>
                <p className="text-xs text-muted-foreground">OT hours (1.5x)</p>
              </BaseCard>
            </div>

            <BaseCard className="p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Earnings Breakdown
              </h4>
              <div className="space-y-3">
                {staffMember.hourlyRate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Hourly Pay ({payrollSummary.regularHours} hrs x ${staffMember.hourlyRate})</span>
                    </div>
                    <span className="font-medium">
                      ${(payrollSummary.regularHours * staffMember.hourlyRate).toLocaleString()}
                    </span>
                  </div>
                )}

                {payrollSummary.overtimeHours > 0 && staffMember.hourlyRate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Overtime Pay ({payrollSummary.overtimeHours} hrs x ${staffMember.hourlyRate * 1.5})</span>
                    </div>
                    <span className="font-medium">
                      ${(payrollSummary.overtimeHours * staffMember.hourlyRate * 1.5).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Service Commission</span>
                  </div>
                  <span className="font-medium text-green-600">
                    +${payrollSummary.serviceCommission.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Product Commission</span>
                  </div>
                  <span className="font-medium text-green-600">
                    +${payrollSummary.productCommission.toLocaleString()}
                  </span>
                </div>

                {payrollSummary.tips > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Tips</span>
                    </div>
                    <span className="font-medium text-green-600">
                      +${payrollSummary.tips.toLocaleString()}
                    </span>
                  </div>
                )}

                {payrollSummary.bonuses > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Bonuses</span>
                    </div>
                    <span className="font-medium text-green-600">
                      +${payrollSummary.bonuses.toLocaleString()}
                    </span>
                  </div>
                )}

                {payrollSummary.deductions > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span>Deductions</span>
                    </div>
                    <span className="font-medium text-red-500">
                      -${payrollSummary.deductions.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-muted/50 rounded-lg px-3">
                  <span className="font-bold">Gross Pay</span>
                  <span className="font-bold text-lg">
                    ${payrollSummary.grossPay.toLocaleString()}
                  </span>
                </div>

                {payrollSummary.netPay && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Net Pay (after taxes)</span>
                    <span className="font-medium">
                      ${payrollSummary.netPay.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </BaseCard>

            <div className="text-xs text-center text-muted-foreground">
              <p>Pay period: {format(monthStart, 'MMM d')} - {format(monthEnd, 'MMM d, yyyy')}</p>
              <p>Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}</p>
            </div>
          </>
        )}
      </div>
    </BaseDrawer>
  );
};
