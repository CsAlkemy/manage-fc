
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { LeaveType } from "@/types";
import { LeaveTypeFormData } from "@/schemas";
import { Settings, Plus } from "lucide-react";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { LeaveTypeForm } from "@/components/forms/LeaveTypeForm";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function LeaveTypes() {
  const { leaveTypes, isLoading, refetch } = useLeaveTypes();
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addLeaveType = async (leaveTypeData: LeaveTypeFormData) => {
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .insert({
          name: leaveTypeData.name,
          description: leaveTypeData.description,
          days_allowed: leaveTypeData.daysAllowed,
          carry_over: leaveTypeData.carryOver,
          color: leaveTypeData.color,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Leave Type Added",
        description: `${leaveTypeData.name} has been successfully created.`,
      });
      
      refetch();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding leave type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add leave type. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateLeaveType = async (leaveTypeData: LeaveTypeFormData) => {
    if (!selectedLeaveType) return;
    
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .update({
          name: leaveTypeData.name,
          description: leaveTypeData.description,
          days_allowed: leaveTypeData.daysAllowed,
          carry_over: leaveTypeData.carryOver,
          color: leaveTypeData.color
        })
        .eq('id', selectedLeaveType.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Leave Type Updated",
        description: `${leaveTypeData.name} has been successfully updated.`,
      });

      refetch();
      setSelectedLeaveType(undefined);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating leave type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update leave type. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedLeaveType(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leave types...</div>
        </div>
      </div>
    );
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {selectedLeaveType ? "Edit Leave Type" : "Add New Leave Type"}
            </DialogTitle>
            <LeaveTypeForm
              leaveType={selectedLeaveType}
              onSubmit={selectedLeaveType ? updateLeaveType : addLeaveType}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditClick(leaveType)}
                >
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

      {leaveTypes.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leave types found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first leave type configuration.
          </p>
        </div>
      )}
    </div>
  );
}
