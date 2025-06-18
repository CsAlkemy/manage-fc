import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmployeeLeaveBalance {
  employeeId: string;
  leaveBalances: {
    leaveTypeId: string;
    leaveTypeName: string;
    totalAllowed: number;
    totalTaken: number;
    totalRemaining: number;
    color: string;
  }[];
  totalDaysTaken: number;
  totalDaysRemaining: number;
}

export function useAllEmployeeLeaveBalances() {
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllLeaveBalances = async () => {
      try {
        // Get all active leave types
        const { data: leaveTypes, error: leaveTypesError } = await supabase
          .from('leave_types')
          .select('*')
          .eq('is_active', true);

        if (leaveTypesError) throw leaveTypesError;

        // Get all employees
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('id')
          .eq('is_active', true);

        if (employeesError) throw employeesError;

        // Get all approved leave applications
        const { data: leaveApplications, error: applicationsError } = await supabase
          .from('leave_applications')
          .select('employee_id, leave_type_id, days')
          .eq('status', 'approved');

        if (applicationsError) throw applicationsError;

        // Calculate balances for each employee
        const allBalances: EmployeeLeaveBalance[] = employees.map(employee => {
          const employeeApplications = leaveApplications.filter(app => app.employee_id === employee.id);
          
          const leaveBalances = leaveTypes.map(leaveType => {
            const totalTaken = employeeApplications
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

          const totalDaysTaken = leaveBalances.reduce((sum, balance) => sum + balance.totalTaken, 0);
          const totalDaysRemaining = leaveBalances.reduce((sum, balance) => sum + balance.totalRemaining, 0);

          return {
            employeeId: employee.id,
            leaveBalances,
            totalDaysTaken,
            totalDaysRemaining,
          };
        });

        setEmployeeLeaveBalances(allBalances);
      } catch (error: any) {
        console.error('Error fetching all leave balances:', error);
        toast({
          title: "Error",
          description: "Failed to fetch leave balances. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllLeaveBalances();
  }, []);

  const getEmployeeBalance = (employeeId: string) => {
    return employeeLeaveBalances.find(balance => balance.employeeId === employeeId);
  };

  return { employeeLeaveBalances, isLoading, getEmployeeBalance };
} 