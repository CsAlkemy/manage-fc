import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarSkeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Filter } from "lucide-react";
import { useLeaveApplications } from "@/hooks/useLeaveApplications";
import { CalendarEvent } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";

export default function CalendarPage() {
  const { leaveApplications, isLoading } = useLeaveApplications();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Convert leave applications to calendar events
  const calendarEvents = useMemo(() => {
    const events = leaveApplications
      .filter(app => app.status === 'approved') // Only show approved leaves
      .filter(app => app.employee && app.leaveType) // Ensure required data exists
      .map(app => ({
        id: app.id,
        title: `${app.employee?.firstName} ${app.employee?.lastName} - ${app.leaveType?.name}`,
        start: new Date(app.startDate),
        end: new Date(app.endDate),
        employee: app.employee!,
        leaveType: app.leaveType!,
        status: app.status,
      }));
    
    console.log('Calendar events:', events); // Debug log
    return events;
  }, [leaveApplications]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const eventsForDate = calendarEvents.filter(event => {
      // Normalize dates to remove time component for accurate comparison
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const eventStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
      const eventEnd = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
      
      const isInRange = checkDate >= eventStart && checkDate <= eventEnd;
      
      // Debug log for specific dates
      if (date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth()) {
        console.log(`Checking date ${checkDate.toDateString()}:`, {
          event: event.title,
          eventStart: eventStart.toDateString(),
          eventEnd: eventEnd.toDateString(),
          isInRange
        });
      }
      
      return isInRange;
    });
    
    return eventsForDate;
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous/next month to fill the grid
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayClick = (date: Date, events: CalendarEvent[]) => {
    if (events.length > 0) {
      setSelectedEvents(events);
      setIsEventDialogOpen(true);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
              Leave Calendar
            </h1>
            <p className="text-gray-600 mt-1">View team leave schedules and plan ahead.</p>
          </div>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
            Leave Calendar
          </h1>
          <p className="text-gray-600 mt-1">View team leave schedules and plan ahead.</p>
        </div>
        
       
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {allDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                    ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  onClick={() => handleDayClick(day, dayEvents)}
                >
                  <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded text-white truncate"
                        style={{ backgroundColor: event.leaveType.color }}
                        title={event.title}
                      >
                        {event.employee.firstName} {event.employee.lastName}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Array.from(new Set(calendarEvents.map(e => e.leaveType.id))).map(typeId => {
              const leaveType = calendarEvents.find(e => e.leaveType.id === typeId)?.leaveType;
              if (!leaveType) return null;
              
              return (
                <div key={typeId} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: leaveType.color }}
                  />
                  <span className="text-sm">{leaveType.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>
            Leave Details - {selectedEvents.length > 0 && format(selectedEvents[0].start, "MMMM d, yyyy")}
          </DialogTitle>
          <div className="space-y-4">
            {selectedEvents.map(event => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.employee.profilePhoto} />
                  <AvatarFallback>
                    {getInitials(event.employee.firstName, event.employee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">
                      {event.employee.firstName} {event.employee.lastName}
                    </h4>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: event.leaveType.color, color: 'white' }}
                    >
                      {event.leaveType.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{event.employee.position}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(event.start, "MMM d")} - {format(event.end, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
