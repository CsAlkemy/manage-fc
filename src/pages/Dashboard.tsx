
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardStats, mockEmployees } from "@/data/mockData";
import { Users, Clock, Calendar, Settings } from "lucide-react";

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentEmployees = mockEmployees.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your team.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="Active team members"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={Clock}
          description="Awaiting approval"
        />
        <StatsCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={Calendar}
          description="Currently away"
        />
        <StatsCard
          title="Leave Types"
          value={stats.totalLeaveTypes}
          icon={Settings}
          description="Configured types"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{employee.position}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Add Employee</p>
                  <p className="text-sm text-gray-500">Create a new employee profile</p>
                </div>
              </button>
              <button className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                <Calendar className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Apply for Leave</p>
                  <p className="text-sm text-gray-500">Submit a new leave request</p>
                </div>
              </button>
              <button className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <Settings className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Configure Leave Types</p>
                  <p className="text-sm text-gray-500">Manage leave policies</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
