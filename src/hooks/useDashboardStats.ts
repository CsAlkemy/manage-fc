
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingApplications: 0,
    onLeaveToday: 0,
    totalLeaveTypes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get total employees
      const { count: totalEmployees, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Get total leave types
      const { count: totalLeaveTypes, error: leaveTypesError } = await supabase
        .from('leave_types')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (leaveTypesError) throw leaveTypesError;

      // Get pending applications
      const { count: pendingApplications, error: pendingError } = await supabase
        .from('leave_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get employees on leave today
      const today = new Date().toISOString().split('T')[0];
      const { count: onLeaveToday, error: onLeaveError } = await supabase
        .from('leave_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      if (onLeaveError) throw onLeaveError;

      setStats({
        totalEmployees: totalEmployees || 0,
        pendingApplications: pendingApplications || 0,
        onLeaveToday: onLeaveToday || 0,
        totalLeaveTypes: totalLeaveTypes || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
}
