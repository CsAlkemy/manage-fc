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
        isActive: emp.is_active,
        password: emp.password,
        isAdmin: emp.is_admin || false,
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
      console.log('🔍 useEmployees addEmployee - Employee data received:', {
        ...employeeData,
        profilePhoto: employeeData.profilePhoto ? `${employeeData.profilePhoto.substring(0, 50)}... (${employeeData.profilePhoto.length} chars)` : 'null/undefined'
      });

      const insertData = {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.email,
        position: employeeData.position,
        department: employeeData.department,
        join_date: employeeData.joinDate.toISOString().split('T')[0],
        is_active: employeeData.isActive,
        profile_photo: employeeData.profilePhoto,
        password: employeeData.password,
        is_admin: employeeData.isAdmin || false,
      };

      console.log('🔍 useEmployees addEmployee - Insert data:', {
        ...insertData,
        profile_photo: insertData.profile_photo ? `${insertData.profile_photo.substring(0, 50)}... (${insertData.profile_photo.length} chars)` : 'null/undefined'
      });

      const { data, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('🚨 Database insertion error:', error);
        throw error;
      }

      console.log('✅ Database response:', {
        ...data,
        profile_photo: data.profile_photo ? `${data.profile_photo.substring(0, 50)}... (${data.profile_photo.length} chars)` : 'null/undefined'
      });

      const newEmployee: Employee = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        position: data.position,
        department: data.department,
        profilePhoto: data.profile_photo,
        joinDate: new Date(data.join_date),
        isActive: data.is_active,
        password: data.password,
        isAdmin: data.is_admin || false,
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
      // Re-throw the error so the dialog can handle it
      throw error;
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
          is_active: employeeData.isActive,
          profile_photo: employeeData.profilePhoto,
          password: employeeData.password,
          is_admin: employeeData.isAdmin || false,
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
        isActive: data.is_active,
        password: data.password,
        isAdmin: data.is_admin || false,
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
      // Re-throw the error so the dialog can handle it
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const employeeToDelete = employees.find(emp => emp.id === id);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast({
        title: "Employee Deleted",
        description: `${employeeToDelete?.firstName} ${employeeToDelete?.lastName} has been removed.`,
      });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee. Please try again.",
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
    deleteEmployee,
    refetch: fetchEmployees
  };
}
