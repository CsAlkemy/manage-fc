import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeaveBalanceCard } from "@/components/dashboard/LeaveBalanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatsCardSkeleton, LeaveBalanceCardSkeleton, RecentEmployeesSkeleton } from "@/components/ui/skeleton";
import { Users, Clock, Calendar, Settings, CalendarDays } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentEmployees } from "@/hooks/useRecentEmployees";
import { useEmployeeLeaveBalance } from "@/hooks/useEmployeeLeaveBalance";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { LeaveApplicationForm } from "@/components/forms/LeaveApplicationForm";
import { useEmployees } from "@/hooks/useEmployees";
import { useLeaveApplications } from "@/hooks/useLeaveApplications";
import { useState, useMemo } from "react";
import { EmployeeFormData, LeaveApplicationFormData } from "@/schemas";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { recentEmployees, isLoading: employeesLoading } = useRecentEmployees();
  const { leaveBalances, isLoading: leaveBalancesLoading } = useEmployeeLeaveBalance(user?.id);
  const { employees, isLoading: allEmployeesLoading, addEmployee } = useEmployees();
  const { leaveApplications, isLoading: leaveApplicationsLoading, addLeaveApplication } = useLeaveApplications();
  const navigate = useNavigate();

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isLeaveApplicationDialogOpen, setIsLeaveApplicationDialogOpen] = useState(false);

  // Calculate employees on leave this week (for employee view)
  const employeesOnLeaveThisWeek = useMemo(() => {
    if (!leaveApplications || !employees) return [];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    const approvedLeaves = leaveApplications.filter(app => 
      app.status === 'approved' && 
      app.employee && 
      app.leaveType &&
      app.employee.id !== user?.id // Exclude current user
    );

    const employeesOnLeave = approvedLeaves
      .filter(app => {
        const leaveStart = new Date(app.startDate);
        const leaveEnd = new Date(app.endDate);
        
        // Check if leave overlaps with current week
        return leaveStart <= endOfWeek && leaveEnd >= startOfWeek;
      })
      .map(app => ({
        id: app.employee!.id,
        firstName: app.employee!.firstName,
        lastName: app.employee!.lastName,
        position: app.employee!.position,
        department: app.employee!.department,
        profilePhoto: app.employee!.profilePhoto,
        leaveType: app.leaveType!.name,
        leaveColor: app.leaveType!.color,
        startDate: app.startDate,
        endDate: app.endDate,
      }))
      // Remove duplicates (if someone has multiple leaves this week)
      .filter((employee, index, self) => 
        index === self.findIndex(e => e.id === employee.id)
      );

    return employeesOnLeave;
  }, [leaveApplications, employees, user?.id]);

  const handleAddEmployee = async (data: EmployeeFormData) => {
    console.log('🔍 Dashboard handleAddEmployee - Form data received:', {
      ...data,
      profilePhoto: data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}... (${data.profilePhoto.length} chars)` : 'null/undefined'
    });
    
    await addEmployee({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      position: data.position,
      department: data.department,
      joinDate: data.joinDate,
      isActive: true,
      profilePhoto: data.profilePhoto,
      password: data.password,
      isAdmin: data.isAdmin,
    });
    setIsEmployeeDialogOpen(false);
  };

  const handleLeaveApplication = async (data: LeaveApplicationFormData) => {
    if (!user) return;
    
    const calculateDays = (startDate: Date, endDate: Date) => {
      const timeDiff = endDate.getTime() - startDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    };

    const days = calculateDays(data.startDate, data.endDate);

    await addLeaveApplication({
      employeeId: user.id,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      days: days,
      reason: data.reason,
    });
    
    setIsLeaveApplicationDialogOpen(false);
  };

  const isAnyLoading = statsLoading || employeesLoading || leaveBalancesLoading;
  const isEmployeeDataLoading = allEmployeesLoading || leaveApplicationsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your team.</p>
      </div>

      {/* Stats Grid - Admin Only */}
      {user?.isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={Users}
                description="Active team members"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Pending Applications"
                value={stats.pendingApplications}
                icon={Clock}
                description="Awaiting approval"
              />
              <StatsCard
                title="On Leave Today"
                value={stats.onLeaveToday}
                icon={Calendar}
                description="Currently away"
              />
              <StatsCard
                title="Leave Types"
                value={stats.totalLeaveTypes}
                icon={Settings}
                description="Configured types"
              />
            </>
          )}
        </div>
      )}

      {/* Employee Leave Balances and Team Leave Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {!user?.isAdmin ? (
          <>
            {/* Employee View: Show Leave Balances */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Leave Balances</h2>
                </div>
                <Dialog open={isLeaveApplicationDialogOpen} onOpenChange={setIsLeaveApplicationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Apply for Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Apply for Leave</DialogTitle>
                    <LeaveApplicationForm
                      onSubmit={handleLeaveApplication}
                      onCancel={() => setIsLeaveApplicationDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {leaveBalancesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  <LeaveBalanceCardSkeleton />
                  <LeaveBalanceCardSkeleton />
                  <LeaveBalanceCardSkeleton />
                </div>
              ) : leaveBalances.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  {leaveBalances.map((balance) => (
                    <LeaveBalanceCard
                      key={balance.leaveTypeId}
                      leaveTypeName={balance.leaveTypeName}
                      totalAllowed={balance.totalAllowed}
                      totalTaken={balance.totalTaken}
                      totalRemaining={balance.totalRemaining}
                      color={balance.color}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 mb-6">No leave types configured</div>
              )}

              {/* Team Members on Leave This Week */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
                    Team Members on Leave This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEmployeeDataLoading ? (
                    <RecentEmployeesSkeleton />
                  ) : employeesOnLeaveThisWeek.length > 0 ? (
                    <div className="space-y-4">
                      {employeesOnLeaveThisWeek.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.profilePhoto} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{employee.position} • {employee.department}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: employee.leaveColor }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {employee.leaveType}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(employee.startDate).toLocaleDateString()} - {new Date(employee.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm">No team members on leave this week</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          // Admin View: Show Recent Employees
          <Card>
            <CardHeader>
              <CardTitle>Recent Employees</CardTitle>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <RecentEmployeesSkeleton />
              ) : recentEmployees.length > 0 ? (
                <div className="space-y-4">
                  {recentEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.profilePhoto} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{employee.position}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No employees found</div>
              )}
            </CardContent>
          </Card>
        )}

        {user?.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Add Employee</p>
                        <p className="text-sm text-gray-500">Create a new employee profile</p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Add New Employee</DialogTitle>
                    <EmployeeForm
                      onSubmit={handleAddEmployee}
                      onCancel={() => setIsEmployeeDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isLeaveApplicationDialogOpen} onOpenChange={setIsLeaveApplicationDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Apply for Leave</p>
                        <p className="text-sm text-gray-500">Submit a new leave request</p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Apply for Leave</DialogTitle>
                    <LeaveApplicationForm
                      onSubmit={handleLeaveApplication}
                      onCancel={() => setIsLeaveApplicationDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <button 
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                  onClick={() => navigate('/leave-types')}
                >
                  <Settings className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Configure Leave Types</p>
                    <p className="text-sm text-gray-500">Manage leave policies</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
