
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Menu,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: FileText },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Leave Calendar", href: "/calendar", icon: Calendar },
  { name: "Leave Types", href: "/leave-types", icon: Settings },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-800">ManagePro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavItems />
            <div className="ml-4 flex items-center">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
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
                <div className="flex flex-col space-y-2 mt-8">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
