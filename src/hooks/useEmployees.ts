
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

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

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email,
          position: employeeData.position,
          department: employeeData.department,
          join_date: employeeData.joinDate.toISOString().split('T')[0],
          is_active: employeeData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newEmployee: Employee = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        position: data.position,
        department: data.department,
        profilePhoto: data.profile_photo,
        joinDate: new Date(data.join_date),
        isActive: data.is_active
      };

      setEmployees(prev => [newEmployee, ...prev]);
      toast({
        title: "Employee Added",
        description: `${employeeData.firstName} ${employeeData.lastName} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateEmployee = async (id: string, employeeData: Omit<Employee, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email,
          position: employeeData.position,
          department: employeeData.department,
          join_date: employeeData.joinDate.toISOString().split('T')[0],
          is_active: employeeData.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEmployee: Employee = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        position: data.position,
        department: data.department,
        profilePhoto: data.profile_photo,
        joinDate: new Date(data.join_date),
        isActive: data.is_active
      };

      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      toast({
        title: "Employee Updated",
        description: `${employeeData.firstName} ${employeeData.lastName}'s profile has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    isLoading,
    addEmployee,
    updateEmployee,
    refetch: fetchEmployees
  };
}
