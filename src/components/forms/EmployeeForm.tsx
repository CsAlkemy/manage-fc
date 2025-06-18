import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Upload, User, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { employeeSchema, EmployeeFormData } from "@/schemas";
import { Employee } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef } from "react";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EmployeeForm({ employee, onSubmit, onCancel, isSubmitting = false }: EmployeeFormProps) {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string>(employee?.profilePhoto || "");
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      position: employee?.position || "",
      department: employee?.department || "",
      joinDate: employee?.joinDate || new Date(),
      profilePhoto: employee?.profilePhoto || "",
      password: "",
      isAdmin: employee?.isAdmin || false,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('🔍 EmployeeForm - File selected:', file.name, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('🔍 EmployeeForm - FileReader result length:', result.length);
        setPreviewUrl(result);
        form.setValue("profilePhoto", result);
        fieldOnChange(result); // Update the field value
        console.log('🔍 EmployeeForm - Form value set, current profilePhoto:', form.getValues("profilePhoto")?.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
    }
  };
  console.log(form.watch());
  console.log(form.formState.errors);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");

  return (
    <div className="w-full">
      <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log('🔍 EmployeeForm - Form submission data keys:', Object.keys(data));
            console.log('🔍 EmployeeForm - Profile photo in submission:', data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}... (${data.profilePhoto.length} chars)` : 'null/undefined');
            console.log('🔍 EmployeeForm - Full form data:', {
              ...data,
              profilePhoto: data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}... (${data.profilePhoto.length} chars)` : 'null/undefined'
            });
            onSubmit(data);
          })} className="space-y-6 p-6">
            {/* Profile Photo Upload */}
            <FormField
              control={form.control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={previewUrl} />
                        <AvatarFallback>
                          {firstName && lastName ? getInitials(firstName, lastName) : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleImageUpload(e, field.onChange)}
                          accept="image/*"
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500">JPG, PNG up to 2MB</p>
                        {/* Debug info */}
                        {field.value && (
                          <p className="text-xs text-green-600">✓ Photo uploaded</p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!employee && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter password for login" 
                          type={showPassword ? "text" : "password"}
                          {...field} 
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {user?.isAdmin && (
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Administrator Access
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Grant administrative privileges to this employee
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
            )}

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (employee ? "Update Employee" : "Add Employee")}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
