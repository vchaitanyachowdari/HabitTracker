import { Link, useLocation } from "wouter";
import { 
  Home, 
  ListChecks, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings,
  Check,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
    },
    {
      name: "All Habits",
      path: "/habits",
      icon: ListChecks,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarIcon,
    },
    {
      name: "Statistics",
      path: "/statistics",
      icon: BarChart3,
    },
    {
      name: "College",
      path: "/college",
      icon: BookOpen,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={cn(
        "md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
        "fixed top-0 left-0 h-full w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Check className="h-8 w-8 text-primary" />
            <h1 className="ml-3 text-xl font-bold text-gray-800">HabitTracker</h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            {routes.map((route) => (
              <Link 
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === route.path 
                    ? "bg-primary text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className={cn(
                  "mr-3 h-6 w-6",
                  location === route.path ? "" : "text-gray-500"
                )} />
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
