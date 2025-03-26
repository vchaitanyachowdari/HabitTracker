import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";

interface TopNavProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export function TopNav({ isSidebarOpen, setSidebarOpen }: TopNavProps) {
  const today = new Date();
  const formattedDate = formatDate(today);
  
  return (
    <div className="sticky top-0 z-10 bg-white flex-shrink-0 flex h-16 shadow">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <div className="ml-3 text-xl font-bold text-gray-800">HabitTracker</div>
          </div>
          <div className="hidden md:block ml-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <div className="ml-3 relative">
            <Avatar>
              <AvatarFallback className="bg-gray-200 text-gray-600">
                US
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}
