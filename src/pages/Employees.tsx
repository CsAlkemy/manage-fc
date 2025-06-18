
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Employee } from "@/types";
import { EmployeeFormData } from "@/schemas";
import { Users, User } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";

export default function Employees() {
  const { employees, isLoading, addEmployee, updateEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = async (data: EmployeeFormData) => {
    await addEmployee({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      position: data.position,
      department: data.department,
      joinDate: data.joinDate,
      isActive: true,
    });
    setIsDialogOpen(false);
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (!selectedEmployee) return;
    
    await updateEmployee(selectedEmployee.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      position: data.position,
      department: data.department,
      joinDate: data.joinDate,
      isActive: selectedEmployee.isActive,
    });
    setSelectedEmployee(undefined);
    setIsDialogOpen(false);
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(undefined);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            Employees
          </h1>
          <p className="text-gray-600 mt-1">Manage your team members and their profiles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <User className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={selectedEmployee ? handleEditEmployee : handleAddEmployee}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search employees by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={handleEditClick}
          />
        ))}
      </div>

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
