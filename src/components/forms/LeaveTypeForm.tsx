
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { leaveTypeSchema, LeaveTypeFormData } from "@/schemas";
import { LeaveType } from "@/types";

interface LeaveTypeFormProps {
  leaveType?: LeaveType;
  onSubmit: (data: LeaveTypeFormData) => void;
  onCancel: () => void;
}

export function LeaveTypeForm({ leaveType, onSubmit, onCancel }: LeaveTypeFormProps) {
  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: leaveType?.name || "",
      description: leaveType?.description || "",
      daysAllowed: leaveType?.daysAllowed || 1,
      carryOver: leaveType?.carryOver || false,
      color: leaveType?.color || "#3B82F6",
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {leaveType ? "Edit Leave Type" : "Add New Leave Type"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Annual Leave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe this leave type..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="daysAllowed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Allowed</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="365"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="color" 
                          className="w-16 h-10 p-1 border rounded"
                          {...field} 
                        />
                        <Input 
                          type="text" 
                          placeholder="#3B82F6"
                          className="flex-1"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="carryOver"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Allow Carry Over
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow unused days to carry over to next year
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                {leaveType ? "Update Leave Type" : "Create Leave Type"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
