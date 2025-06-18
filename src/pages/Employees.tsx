
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { 
  ResponsiveModal, 
  ResponsiveModalTrigger, 
  ResponsiveModalContent, 
  ResponsiveModalHeader, 
  ResponsiveModalTitle 
} from "@/components/ui/responsive-modal";
import { ResponsiveConfirmation } from "@/components/ui/responsive-confirmation";
import { Employee } from "@/types";
import { EmployeeFormData } from "@/schemas";
import { Users, User } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";

export default function Employees() {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = async (data: EmployeeFormData) => {
    if (isSubmitting) return;
    
    console.log('🔍 Employees.tsx - handleAddEmployee received data:', {
      ...data,
      profilePhoto: data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}... (${data.profilePhoto.length} chars)` : 'null/undefined'
    });
    
    setIsSubmitting(true);
    try {
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
        isAdmin: data.isAdmin || false,
      });
      // Close dialog on success
      setIsDialogOpen(false);
      setSelectedEmployee(undefined);
    } catch (error) {
      // Dialog stays open on error so user can retry
      console.error('Failed to add employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (!selectedEmployee || isSubmitting) return;
    
    console.log('🔍 Employees.tsx - handleEditEmployee received data:', {
      ...data,
      profilePhoto: data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}... (${data.profilePhoto.length} chars)` : 'null/undefined'
    });
    
    setIsSubmitting(true);
    try {
      await updateEmployee(selectedEmployee.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        position: data.position,
        department: data.department,
        joinDate: data.joinDate,
        isActive: selectedEmployee.isActive,
        profilePhoto: data.profilePhoto || selectedEmployee.profilePhoto,
        // Only update password if a new one is provided
        password: data.password && data.password.trim() !== "" ? data.password : selectedEmployee.password,
        isAdmin: data.isAdmin ?? selectedEmployee.isAdmin,
      });
      // Close dialog on success
      setIsDialogOpen(false);
      setSelectedEmployee(undefined);
    } catch (error) {
      // Dialog stays open on error so user can retry
      console.error('Failed to update employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(undefined);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  const handleDeleteConfirm = async () => {
    if (employeeToDelete) {
      await deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(undefined);
    }
  };

  const handleDeleteCancel = () => {
    setEmployeeToDelete(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="mr-3 h-8 w-8 text-blue-600" />
          Employees
        </h1>
        <p className="text-gray-600 mt-1">Manage your team members and their profiles.</p>
      </div>

      {/* Search and Add Employee */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
        <Input
          placeholder="Search employees by name, email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <ResponsiveModal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ResponsiveModalTrigger asChild>
            <Button className="whitespace-nowrap">
              <User className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </ResponsiveModalTrigger>
          <ResponsiveModalContent className="overflow-y-auto">
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={selectedEmployee ? handleEditEmployee : handleAddEmployee}
              onCancel={handleDialogClose}
              isSubmitting={isSubmitting}
            />
          </ResponsiveModalContent>
        </ResponsiveModal>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ResponsiveConfirmation
        open={!!employeeToDelete}
        onOpenChange={() => setEmployeeToDelete(undefined)}
        title="Delete Employee"
        description={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action cannot be undone and will permanently remove their profile and all associated data.`}
        confirmText="Delete Employee"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="destructive"
      />

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first employee."}
          </p>
        </div>
      )}
    </div>
  );
}
