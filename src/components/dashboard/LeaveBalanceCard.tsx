import { Card, CardContent } from "@/components/ui/card";

interface LeaveBalanceCardProps {
  leaveTypeName: string;
  totalAllowed: number;
  totalTaken: number;
  totalRemaining: number;
  color: string;
}

export function LeaveBalanceCard({
  leaveTypeName,
  totalAllowed,
  totalTaken,
  totalRemaining,
  color
}: LeaveBalanceCardProps) {
  const remainingPercentage = totalAllowed > 0 ? (totalRemaining / totalAllowed) * 100 : 0;
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (remainingPercentage / 100) * circumference;
  
  return (
    <Card className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          {/* Left side - Icon and text */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {leaveTypeName}
              </h3>
              <p className="text-sm text-gray-500">
                Total annual {totalAllowed} days, {totalTaken} used
              </p>
            </div>
          </div>
          
          {/* Right side - Circular progress */}
          <div className="relative w-16 h-16">
            {/* Background circle */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="20"
                stroke={`${color}20`}
                strokeWidth="4"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="22"
                cy="22"
                r="20"
                stroke={color}
                strokeWidth="4"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-xl font-bold"
                style={{ color }}
              >
                {totalRemaining}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 