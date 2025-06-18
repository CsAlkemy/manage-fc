import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, FileText, Calendar, Eye } from "lucide-react";
import { useLeaveApplications } from "@/hooks/useLeaveApplications";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveApplication } from "@/types";
import { format } from "date-fns";

export default function LeaveApplications() {
  const { leaveApplications, isLoading, approveApplication, rejectApplication } = useLeaveApplications();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leave applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-blue-600" />
          Leave Applications
        </h1>
        <p className="text-gray-600 mt-1">Manage and review employee leave requests.</p>
      </div>

      <div className="grid gap-6">
        {leaveApplications.map((application) => (
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
        ))}
      </div>

      {leaveApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
          <p className="mt-1 text-sm text-gray-500">
            No leave applications have been submitted yet.
          </p>
        </div>
      )}
    </div>
  );
} 