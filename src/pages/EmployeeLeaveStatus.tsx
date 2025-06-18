import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeLeaveStatusSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Search, Filter, Calendar, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useLeaveApplications } from "@/hooks/useLeaveApplications";
import { useAllEmployeeLeaveBalances } from "@/hooks/useAllEmployeeLeaveBalances";
import { format, isToday, isFuture, isPast } from "date-fns";

export default function EmployeeLeaveStatus() {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { leaveApplications, isLoading: applicationsLoading } = useLeaveApplications();
  const { getEmployeeBalance, isLoading: balancesLoading } = useAllEmployeeLeaveBalances();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'on-leave': return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending-approval': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveStatusIcon = (status: string) => {
    switch (status) {
      case 'on-leave': return <XCircle className="h-4 w-4" />;
      case 'upcoming-leave': return <Clock className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'pending-approval': return <Calendar className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const employeesWithLeaveStatus = useMemo(() => {
    return employees.map(employee => {
      const employeeApplications = leaveApplications.filter(app => app.employeeId === employee.id);
      
      // Check if employee is currently on leave
      const currentLeave = employeeApplications.find(app => 
        app.status === 'approved' && 
        new Date(app.startDate) <= new Date() && 
        new Date(app.endDate) >= new Date()
      );

      // Check for upcoming approved leave
      const upcomingLeave = employeeApplications.find(app => 
        app.status === 'approved' && 
        isFuture(new Date(app.startDate))
      );

      // Check for pending applications
      const pendingApplications = employeeApplications.filter(app => app.status === 'pending');

      let leaveStatus = 'available';
      let leaveDetails = null;

      if (currentLeave) {
        leaveStatus = 'on-leave';
        leaveDetails = {
          type: currentLeave.leaveType?.name || 'Leave',
          startDate: currentLeave.startDate,
          endDate: currentLeave.endDate,
          color: currentLeave.leaveType?.color || '#6B7280'
        };
      } else if (pendingApplications.length > 0) {
        leaveStatus = 'pending-approval';
        const nextPending = pendingApplications.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )[0];
        leaveDetails = {
          type: nextPending.leaveType?.name || 'Leave',
          startDate: nextPending.startDate,
          endDate: nextPending.endDate,
          color: nextPending.leaveType?.color || '#6B7280'
        };
      } else if (upcomingLeave) {
        leaveStatus = 'upcoming-leave';
        leaveDetails = {
          type: upcomingLeave.leaveType?.name || 'Leave',
          startDate: upcomingLeave.startDate,
          endDate: upcomingLeave.endDate,
          color: upcomingLeave.leaveType?.color || '#6B7280'
        };
      }

      return {
        ...employee,
        leaveStatus,
        leaveDetails,
        totalPendingApplications: pendingApplications.length
      };
    });
  }, [employees, leaveApplications]);

  const filteredEmployees = useMemo(() => {
    return employeesWithLeaveStatus.filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || employee.leaveStatus === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employeesWithLeaveStatus, searchTerm, statusFilter, departmentFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.department)));
  }, [employees]);

  const isAnyLoading = employeesLoading || applicationsLoading || balancesLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            Employee Leave Status
          </h1>
          <p className="text-gray-600 mt-1">Monitor team availability and leave schedules at a glance.</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="upcoming-leave">Upcoming Leave</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Team Overview ({filteredEmployees.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isAnyLoading ? (
              <>
                <EmployeeLeaveStatusSkeleton />
                <EmployeeLeaveStatusSkeleton />
                <EmployeeLeaveStatusSkeleton />
                <EmployeeLeaveStatusSkeleton />
                <EmployeeLeaveStatusSkeleton />
                <EmployeeLeaveStatusSkeleton />
              </>
            ) : (
              filteredEmployees.map((employee) => {
              const employeeBalance = getEmployeeBalance(employee.id);
              
              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.profilePhoto} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getLeaveStatusColor(employee.leaveStatus)} border font-medium`}
                        >
                          {getLeaveStatusIcon(employee.leaveStatus)}
                          <span className="ml-1 capitalize">
                            {employee.leaveStatus.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{employee.position}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>

                      {/* Leave Balance Summary */}
                      {employeeBalance && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                  {employeeBalance.totalDaysTaken} taken
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">
                                  {employeeBalance.totalDaysRemaining} remaining
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress bars for each leave type */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {employeeBalance.leaveBalances
                              .filter(balance => balance.totalAllowed > 0)
                              .map(balance => {
                                const usedPercentage = (balance.totalTaken / balance.totalAllowed) * 100;
                                return (
                                  <div key={balance.leaveTypeId} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div 
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: balance.color }}
                                        />
                                        <span className="text-xs font-medium text-gray-700">
                                          {balance.leaveTypeName}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {balance.totalTaken}/{balance.totalAllowed}
                                      </span>
                                    </div>
                                    <Progress 
                                      value={usedPercentage} 
                                      className="h-2"
                                      style={{
                                        backgroundColor: `${balance.color}20`,
                                      }}
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {employee.leaveDetails && (
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: employee.leaveDetails.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {employee.leaveDetails.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(employee.leaveDetails.startDate), 'MMM d')} - {format(new Date(employee.leaveDetails.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {employee.totalPendingApplications > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {employee.totalPendingApplications} pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
              })
            )}
          </div>

          {!isAnyLoading && filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 