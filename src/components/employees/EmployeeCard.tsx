
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types";
import { User } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.profilePhoto} />
            <AvatarFallback>
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {employee.firstName} {employee.lastName}
              </h3>
              <Badge variant={employee.isActive ? "default" : "secondary"}>
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
            <p className="text-xs text-gray-400 mt-1">
              Joined: {new Date(employee.joinDate).toLocaleDateString()}
            </p>
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => onEdit(employee)}
              >
                <User className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
