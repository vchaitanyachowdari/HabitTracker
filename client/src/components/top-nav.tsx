import { Bell, Menu, Search, Plus, Calendar, ChevronDown, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface TopNavProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export function TopNav({ isSidebarOpen, setSidebarOpen }: TopNavProps) {
  const today = new Date();
  const formattedDate = formatDate(today);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Get page title based on current location
  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/habits") return "My Habits";
    if (location === "/calendar") return "Calendar";
    if (location === "/statistics") return "Statistics";
    if (location === "/college") return "College";
    if (location === "/settings") return "Settings";
    
    // Default fallback
    return "Dashboard";
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
    setLocation('/login');
  };
  
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex-shrink-0 flex h-16 border-b border-slate-200 dark:border-slate-800">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <div className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">HabitTracker</div>
          </div>
          
          <div className="hidden md:flex items-center ml-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>
            </div>
            
            <div className="ml-10 max-w-lg w-full hidden lg:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center gap-2 md:ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 rounded-full border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span>Add New</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>New Habit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Calendar className="mr-2 h-4 w-4" />
                <span>New Class</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 rounded-full"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                <Avatar className="h-9 w-9 border-2 border-primary cursor-pointer">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600/80 text-white">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.username || 'User'}</p>
                  <p className="w-[200px] truncate text-sm text-slate-500 dark:text-slate-400">
                    {user?.id ? `ID: ${user.id}` : 'Not logged in'}
                  </p>
                </div>
              </div>
              
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setLocation('/settings')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setLocation('/settings')}
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
