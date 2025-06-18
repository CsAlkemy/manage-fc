
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useRecentEmployees() {
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedEmployees: Employee[] = data.map(emp => ({
        id: emp.id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        position: emp.position,
        department: emp.department,
        profilePhoto: emp.profile_photo,
        joinDate: new Date(emp.join_date),
        isActive: emp.is_active
      }));

      setRecentEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching recent employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent employees. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentEmployees();
  }, []);

  return {
    recentEmployees,
    isLoading,
    refetch: fetchRecentEmployees
  };
}
