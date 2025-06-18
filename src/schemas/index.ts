
import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  joinDate: z.date({
    required_error: "Join date is required",
  }),
});

export const leaveTypeSchema = z.object({
  name: z.string().min(2, "Leave type name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  daysAllowed: z.number().min(1, "Days allowed must be at least 1").max(365, "Days allowed cannot exceed 365"),
  carryOver: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Please select a valid color"),
});

export const leaveApplicationSchema = z.object({
  leaveTypeId: z.string().min(1, "Please select a leave type"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;
export type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;
