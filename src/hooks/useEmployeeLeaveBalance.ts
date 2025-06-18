import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  totalAllowed: number;
  totalTaken: number;
  totalRemaining: number;
  color: string;
}

export function useEmployeeLeaveBalance(employeeId: string | undefined) {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    const fetchLeaveBalances = async () => {
      try {
        // Get all leave types
        const { data: leaveTypes, error: leaveTypesError } = await supabase
          .from('leave_types')
          .select('*')
          .eq('is_active', true);

        if (leaveTypesError) throw leaveTypesError;

        // Get all approved leave applications for this employee
        const { data: leaveApplications, error: applicationsError } = await supabase
          .from('leave_applications')
          .select('leave_type_id, days')
          .eq('employee_id', employeeId)
          .eq('status', 'approved');

        if (applicationsError) throw applicationsError;

        // Calculate balances for each leave type
        const balances: LeaveBalance[] = leaveTypes.map(leaveType => {
          const totalTaken = leaveApplications
            .filter(app => app.leave_type_id === leaveType.id)
            .reduce((sum, app) => sum + app.days, 0);

          return {
            leaveTypeId: leaveType.id,
            leaveTypeName: leaveType.name,
            totalAllowed: leaveType.days_allowed,
            totalTaken,
            totalRemaining: Math.max(0, leaveType.days_allowed - totalTaken),
            color: leaveType.color,
          };
        });

        setLeaveBalances(balances);
      } catch (error: any) {
        console.error('Error fetching leave balances:', error);
        toast({
          title: "Error",
          description: "Failed to fetch leave balances. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveBalances();
  }, [employeeId]);

  return { leaveBalances, isLoading };
} 