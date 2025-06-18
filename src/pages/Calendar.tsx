
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
          Leave Calendar
        </h1>
        <p className="text-gray-600 mt-1">View team leave schedules and plan ahead.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Integration Coming Soon</h3>
              <p className="text-gray-500">
                Interactive calendar view with leave visualization will be available in the next update.
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <Badge variant="outline">Annual Leave</Badge>
                <Badge variant="outline">Sick Leave</Badge>
                <Badge variant="outline">Personal Leave</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
