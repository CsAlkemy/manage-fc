import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeaveApplication } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useLeaveApplications() {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeaveApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .select(`
          *,
          employee:employees!leave_applications_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            position,
            department,
            profile_photo
          ),
          leave_type:leave_types!leave_applications_leave_type_id_fkey (
            id,
            name,
            description,
            color,
            days_allowed
          ),
          approver:employees!leave_applications_approved_by_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedApplications: LeaveApplication[] = data.map(app => ({
        id: app.id,
        employeeId: app.employee_id,
        employee: app.employee ? {
          id: app.employee.id,
          firstName: app.employee.first_name,
          lastName: app.employee.last_name,
          email: app.employee.email,
          position: app.employee.position,
          department: app.employee.department,
          profilePhoto: app.employee.profile_photo,
          joinDate: new Date(),
          isActive: true,
        } : undefined,
        leaveTypeId: app.leave_type_id,
        leaveType: app.leave_type ? {
          id: app.leave_type.id,
          name: app.leave_type.name,
          description: app.leave_type.description,
          color: app.leave_type.color,
          daysAllowed: app.leave_type.days_allowed,
          carryOver: false,
          isActive: true,
        } : undefined,
        startDate: new Date(app.start_date),
        endDate: new Date(app.end_date),
        days: app.days,
        reason: app.reason,
        status: app.status as 'pending' | 'approved' | 'rejected',
        appliedDate: new Date(app.applied_date),
        approvedBy: app.approved_by,
        approver: app.approver ? {
          id: app.approver.id,
          firstName: app.approver.first_name,
          lastName: app.approver.last_name,
          email: app.approver.email,
          position: '',
          department: '',
          joinDate: new Date(),
          isActive: true,
        } : undefined,
        approvedDate: app.approved_date ? new Date(app.approved_date) : undefined,
      }));

      setLeaveApplications(formattedApplications);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave applications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLeaveApplication = async (applicationData: {
    employeeId: string;
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .insert({
          employee_id: applicationData.employeeId,
          leave_type_id: applicationData.leaveTypeId,
          start_date: applicationData.startDate.toISOString().split('T')[0],
          end_date: applicationData.endDate.toISOString().split('T')[0],
          days: applicationData.days,
          reason: applicationData.reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your leave application has been submitted successfully.",
      });

      fetchLeaveApplications(); // Refresh the list
    } catch (error: any) {
      console.error('Error adding leave application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const approveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application Approved",
        description: "The leave application has been approved successfully.",
      });

      fetchLeaveApplications(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rejectApplication = async (applicationId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "The leave application has been rejected.",
      });

      fetchLeaveApplications(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject application. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  return {
    leaveApplications,
    isLoading,
    addLeaveApplication,
    approveApplication,
    rejectApplication,
    refetch: fetchLeaveApplications,
  };
} 