
import { Employee, LeaveType, LeaveApplication, LeaveBalance, DashboardStats } from "@/types";

export const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    position: "Software Engineer",
    department: "Engineering",
    joinDate: new Date("2023-01-15"),
    isActive: true,
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    position: "Product Manager",
    department: "Product",
    joinDate: new Date("2022-08-20"),
    isActive: true,
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@company.com",
    position: "Designer",
    department: "Design",
    joinDate: new Date("2023-03-10"),
    isActive: true,
  },
];

export const mockLeaveTypes: LeaveType[] = [
  {
    id: "1",
    name: "Annual Leave",
    description: "Yearly vacation days",
    daysAllowed: 25,
    carryOver: true,
    isActive: true,
    color: "#3B82F6",
  },
  {
    id: "2",
    name: "Sick Leave",
    description: "Medical leave for illness",
    daysAllowed: 12,
    carryOver: false,
    isActive: true,
    color: "#EF4444",
  },
  {
    id: "3",
    name: "Personal Leave",
    description: "Personal time off",
    daysAllowed: 5,
    carryOver: false,
    isActive: true,
    color: "#10B981",
  },
];

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 156,
  pendingApplications: 8,
  onLeaveToday: 12,
  totalLeaveTypes: 6,
};

export const mockLeaveBalances: LeaveBalance[] = [
  {
    id: "1",
    employeeId: "1",
    leaveTypeId: "1",
    allocated: 25,
    used: 8,
    remaining: 17,
    year: 2024,
  },
  {
    id: "2",
    employeeId: "1",
    leaveTypeId: "2",
    allocated: 12,
    used: 3,
    remaining: 9,
    year: 2024,
  },
];
