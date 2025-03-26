import { Link, useLocation } from "wouter";
import { 
  Home, 
  ListChecks, 
  Calendar as CalendarIcon, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
    },
    {
      name: "Habits",
      path: "/habits",
      icon: ListChecks,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarIcon,
    },
    {
      name: "Stats",
      path: "/statistics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
      {routes.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className={cn(
            "flex-1 py-2 px-3 text-xs font-medium flex flex-col items-center",
            location === route.path
              ? "text-primary border-t-2 border-primary"
              : "text-gray-500"
          )}
        >
          <route.icon className="h-6 w-6" />
          <span>{route.name}</span>
        </Link>
      ))}
    </div>
  );
}
