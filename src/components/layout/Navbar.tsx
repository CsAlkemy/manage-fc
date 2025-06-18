import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Menu,
  User,
  LogOut,
  Shield,
  ClipboardList,
  ChevronDown,
  Briefcase
} from "lucide-react";

const leaveManagementItems = [
  { name: "Employee Leave Status", href: "/employee-leave-status", icon: Users },
  { name: "Leave Applications", href: "/leave-applications", icon: ClipboardList },
  { name: "Leave Calendar", href: "/calendar", icon: Calendar },
  { name: "Leave Types", href: "/leave-types", icon: Settings },
];

const employeeLeaveItems = [
  { name: "Leave Calendar", href: "/calendar", icon: Calendar },
];

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: FileText },
  { name: "Employees", href: "/employees", icon: Users },
];

const employeeNavigation = [
  { name: "Dashboard", href: "/", icon: FileText },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isLeavePathActive = () => {
    const leavePaths = ['/employee-leave-status', '/leave-applications', '/calendar', '/leave-types'];
    return leavePaths.some(path => location.pathname === path);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const navigation = user?.isAdmin ? adminNavigation : employeeNavigation;
  const leaveItems = user?.isAdmin ? leaveManagementItems : employeeLeaveItems;

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-8">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-800">ManagePro</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Leave Management Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isLeavePathActive()
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Leave Management
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {leaveItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            to={item.href}
                            className={`flex items-center px-2 py-2 text-sm transition-colors ${
                              isActive(item.href)
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600"
                            }`}
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* User Menu - Right Side */}
          <div className="hidden md:flex items-center ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePhoto} />
                    <AvatarFallback>
                      {user ? getInitials(user.firstName, user.lastName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.firstName} ${user.lastName}` : "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {user?.isAdmin && (
                      <div className="flex items-center mt-1">
                        <Shield className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-xs text-blue-600">Administrator</span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePhoto} />
                      <AvatarFallback>
                        {user ? getInitials(user.firstName, user.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {user ? `${user.firstName} ${user.lastName}` : "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.isAdmin && (
                        <div className="flex items-center mt-1">
                          <Shield className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600">Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    {/* Regular navigation items */}
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                    
                    {/* Leave Management Section */}
                    <div className="mt-4">
                      <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Leave Management
                      </div>
                      {leaveItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive(item.href)
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
