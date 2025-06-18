import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, XCircle, Clock, FileText, Calendar, Eye, Filter, X, CalendarIcon } from "lucide-react";
import { useLeaveApplications } from "@/hooks/useLeaveApplications";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveApplication } from "@/types";
import { format, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { LeaveApplicationCardSkeleton } from "@/components/ui/skeleton";

export default function LeaveApplications() {
  const { leaveApplications, isLoading, approveApplication, rejectApplication } = useLeaveApplications();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    leaveType: "all",
    employee: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleApprove = async (applicationId: string) => {
    await approveApplication(applicationId);
  };

  const handleReject = async (applicationId: string, reason: string) => {
    await rejectApplication(applicationId, reason);
    setRejectReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get unique values for filter dropdowns
  const uniqueLeaveTypes = useMemo(() => {
    const types = leaveApplications
      .map(app => app.leaveType)
      .filter((type, index, self) => type && self.findIndex(t => t?.id === type.id) === index);
    return types;
  }, [leaveApplications]);

  const uniqueEmployees = useMemo(() => {
    const employees = leaveApplications
      .map(app => app.employee)
      .filter((emp, index, self) => emp && self.findIndex(e => e?.id === emp.id) === index);
    return employees;
  }, [leaveApplications]);

  // Filter applications based on current filters
  const filteredApplications = useMemo(() => {
    return leaveApplications.filter(application => {
      // Status filter
      if (filters.status !== "all" && application.status !== filters.status) {
        return false;
      }

      // Leave type filter
      if (filters.leaveType !== "all" && application.leaveType?.id !== filters.leaveType) {
        return false;
      }

      // Employee filter (search by name)
      if (filters.employee && application.employee) {
        const fullName = `${application.employee.firstName} ${application.employee.lastName}`.toLowerCase();
        if (!fullName.includes(filters.employee.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        try {
          const appStart = new Date(application.startDate);
          const appEnd = new Date(application.endDate);
          
          // If only start date is provided, filter applications that start on or after this date
          if (filters.startDate && !filters.endDate) {
            const filterStart = new Date(filters.startDate);
            if (appStart < filterStart) {
              return false;
            }
          }
          
          // If only end date is provided, filter applications that end on or before this date
          if (!filters.startDate && filters.endDate) {
            const filterEnd = new Date(filters.endDate);
            if (appEnd > filterEnd) {
              return false;
            }
          }
          
          // If both dates are provided, check if application dates overlap with filter range
          if (filters.startDate && filters.endDate) {
            const filterStart = new Date(filters.startDate);
            const filterEnd = new Date(filters.endDate);
            
            // Application must overlap with the filter date range
            // No overlap if: app ends before filter starts OR app starts after filter ends
            const noOverlap = appEnd < filterStart || appStart > filterEnd;
            if (noOverlap) {
              return false;
            }
          }
        } catch (error) {
          console.error('Date filtering error:', error);
          // Invalid date format, skip date filtering
        }
      }

      return true;
    });
  }, [leaveApplications, filters]);

  const clearFilters = () => {
    setFilters({
      status: "all",
      leaveType: "all",
      employee: "",
      startDate: undefined,
      endDate: undefined
    });
  };

  const hasActiveFilters = filters.status !== "all" || 
                          filters.leaveType !== "all" || 
                          filters.employee !== "" || 
                          filters.startDate !== undefined || 
                          filters.endDate !== undefined;



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-blue-600" />
          Leave Applications
        </h1>
        <p className="text-gray-600 mt-1">Manage and review employee leave requests.</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filteredApplications.length} of {leaveApplications.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Leave Type</label>
                <Select
                  value={filters.leaveType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, leaveType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueLeaveTypes.map((type) => (
                      <SelectItem key={type?.id} value={type?.id || ""}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: type?.color || '#3B82F6' }}
                          />
                          {type?.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Employee</label>
                <Input
                  placeholder="Search employee..."
                  value={filters.employee}
                  onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                />
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Showing {filteredApplications.length} of {leaveApplications.length} applications
            </span>
          </div>
          {filteredApplications.length === 0 && (
            <span className="text-sm text-blue-700">Try adjusting your filters</span>
          )}
        </div>
      )}

      <div className="grid gap-6">
        {isLoading ? (
          <>
            <LeaveApplicationCardSkeleton />
            <LeaveApplicationCardSkeleton />
            <LeaveApplicationCardSkeleton />
            <LeaveApplicationCardSkeleton />
            <LeaveApplicationCardSkeleton />
          </>
        ) : (
          filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={application.employee?.profilePhoto} />
                    <AvatarFallback>
                      {application.employee ? 
                        getInitials(application.employee.firstName, application.employee.lastName) : 
                        "U"
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {application.employee ? 
                        `${application.employee.firstName} ${application.employee.lastName}` : 
                        "Unknown Employee"
                      }
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {application.employee?.position} • {application.employee?.department}
                    </p>
                  </div>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Leave Type</p>
                  <div className="flex items-center mt-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: application.leaveType?.color || '#3B82F6' }}
                    />
                    <p className="text-sm">{application.leaveType?.name || 'Unknown Type'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm mt-1">
                    {format(new Date(application.startDate), "MMM dd")} - {format(new Date(application.endDate), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500">{application.days} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Applied Date</p>
                  <p className="text-sm mt-1">{format(new Date(application.appliedDate), "MMM dd, yyyy")}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Reason</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {application.reason}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogTitle>Leave Application Details</DialogTitle>
                    <DialogDescription>
                      Complete details of the leave application
                    </DialogDescription>
                    {selectedApplication && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Employee</label>
                            <p className="text-sm">
                              {selectedApplication.employee ? 
                                `${selectedApplication.employee.firstName} ${selectedApplication.employee.lastName}` : 
                                "Unknown"
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="mt-1">
                              {getStatusBadge(selectedApplication.status)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <p className="text-sm">{format(new Date(selectedApplication.startDate), "PPPP")}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">End Date</label>
                            <p className="text-sm">{format(new Date(selectedApplication.endDate), "PPPP")}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Reason</label>
                          <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedApplication.reason}</p>
                        </div>
                        {selectedApplication.status === 'approved' && selectedApplication.approver && (
                          <div>
                            <label className="text-sm font-medium">Approved By</label>
                            <p className="text-sm">
                              {selectedApplication.approver.firstName} {selectedApplication.approver.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedApplication.approvedDate && format(new Date(selectedApplication.approvedDate), "PPP")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {user?.isAdmin && application.status === 'pending' && (
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Leave Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this leave application? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleApprove(application.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Reject Leave Application</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this application.
                        </DialogDescription>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setRejectReason("")}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleReject(application.id, rejectReason)}
                              disabled={!rejectReason.trim()}
                            >
                              Reject Application
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {!isLoading && filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {hasActiveFilters ? "No applications match your filters" : "No leave applications"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters 
              ? "Try adjusting your filter criteria to see more results." 
              : "No leave applications have been submitted yet."
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 