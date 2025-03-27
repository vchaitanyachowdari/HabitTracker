import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Calendar from "@/pages/calendar";
import Statistics from "@/pages/statistics";
import College from "@/pages/college";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ProtectedRoute } from "@/components/protected-route";

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
  const [location] = useLocation();
  
  // Check if the current route is the login page
  const isLoginPage = location === '/login';
  
  return (
    <Switch>
      {/* Login page (public) */}
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/habits">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Habits />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/calendar">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Calendar />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/statistics">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Statistics />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/college">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <College />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        {() => (
          isLoginPage ? <Login /> : <NotFound />
        )}
      </Route>
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
