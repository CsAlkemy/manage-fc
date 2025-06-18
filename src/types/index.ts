
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  profilePhoto?: string;
  joinDate: Date;
  isActive: boolean;
}

export interface LeaveType {
  id: string;
  name: string;
  description: string;
  daysAllowed: number;
  carryOver: boolean;
  isActive: boolean;
  color: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  allocated: number;
  used: number;
  remaining: number;
  year: number;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingApplications: number;
  onLeaveToday: number;
  totalLeaveTypes: number;
}
