
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeaveType } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaveTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeaveTypes: LeaveType[] = data.map(lt => ({
        id: lt.id,
        name: lt.name,
        description: lt.description,
        daysAllowed: lt.days_allowed,
        carryOver: lt.carry_over,
        isActive: lt.is_active,
        color: lt.color
      }));

      setLeaveTypes(formattedLeaveTypes);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave types. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  return {
    leaveTypes,
    isLoading,
    refetch: fetchLeaveTypes
  };
}
