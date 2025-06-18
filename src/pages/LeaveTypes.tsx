
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockLeaveTypes } from "@/data/mockData";
import { LeaveType } from "@/types";
import { Settings, Plus } from "lucide-react";

export default function LeaveTypes() {
  const [leaveTypes] = useState(mockLeaveTypes);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            Leave Types
          </h1>
          <p className="text-gray-600 mt-1">Configure and manage different types of leave policies.</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Leave Type
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((leaveType) => (
          <Card key={leaveType.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{leaveType.name}</CardTitle>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: leaveType.color }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{leaveType.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Days Allowed:</span>
                  <span className="font-medium">{leaveType.daysAllowed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Carry Over:</span>
                  <Badge variant={leaveType.carryOver ? "default" : "secondary"}>
                    {leaveType.carryOver ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge variant={leaveType.isActive ? "default" : "secondary"}>
                    {leaveType.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
