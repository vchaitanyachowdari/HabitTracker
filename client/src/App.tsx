import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Calendar from "@/pages/calendar";
import Statistics from "@/pages/statistics";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { MobileNav } from "@/components/mobile-nav";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar (desktop only) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <TopNav isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/habits">
        {() => (
          <AppLayout>
            <Habits />
          </AppLayout>
        )}
      </Route>
      <Route path="/calendar">
        {() => (
          <AppLayout>
            <Calendar />
          </AppLayout>
        )}
      </Route>
      <Route path="/statistics">
        {() => (
          <AppLayout>
            <Statistics />
          </AppLayout>
        )}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
