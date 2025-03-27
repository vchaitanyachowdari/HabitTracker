import { Link, useLocation } from "wouter";
import { 
  Home, 
  ListChecks, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings,
  CheckCircle,
  BookOpen,
  Star,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
      name: "My Habits",
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
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={cn(
        "md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-in-out shadow-sm",
        "fixed top-0 left-0 h-full w-72",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* App Logo and Title */}
          <div className="flex items-center flex-shrink-0 px-6 py-6">
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-xl p-2 shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">HabitTracker</h1>
          </div>
          
          {/* User Profile Section */}
          <div className="px-6 py-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600/80 text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium">Pro</span>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1 px-3">
              {routes.map((route) => {
                const isActive = 
                  route.path === "/" 
                    ? location === "/" 
                    : location.startsWith(route.path);
                
                return (
                  <Link 
                    key={route.path}
                    href={route.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                    )}>
                      <route.icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"
                      )} />
                      <span>{route.name}</span>
                      
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <Separator className="my-4 mx-3" />
            
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 mb-2">
                Settings
              </h3>
              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
              >
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  location === "/settings"
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                )}>
                  <Settings className={cn(
                    "h-5 w-5",
                    location === "/settings" ? "text-primary" : "text-slate-500 dark:text-slate-400"
                  )} />
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </nav>
          
          <div className="flex-shrink-0 p-4">
            <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-medium text-sm mb-2">Premium Features</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Sync with Google Calendar, Notion and get WhatsApp notifications
              </p>
              <Button variant="outline" size="sm" className="w-full bg-white dark:bg-slate-700 dark:hover:bg-slate-700/80">
                Upgrade Plan
              </Button>
            </div>
            
            <div className="mt-6 px-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
