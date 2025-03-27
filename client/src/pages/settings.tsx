import NotificationSettings from '@/components/notification-settings';
import CalendarIntegrations from '@/components/calendar-integrations';
import ApiKeysSettings from '@/components/api-keys-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Calendar, Key, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-500 hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                <SettingsIcon className="h-8 w-8 text-primary" />
                Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-slate-200 hover:border-slate-300 flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="notifications" className="w-full">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 mb-8">
            <TabsList className="w-full h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700/50 data-[state=active]:text-primary rounded-lg transition-all duration-200"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700/50 data-[state=active]:text-primary rounded-lg transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar Integrations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="api-keys" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700/50 data-[state=active]:text-primary rounded-lg transition-all duration-200"
              >
                <Key className="h-4 w-4" />
                <span>API Keys</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="notifications" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 gap-6">
              <NotificationSettings />
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 gap-6">
              <CalendarIntegrations />
            </div>
          </TabsContent>
          
          <TabsContent value="api-keys" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 gap-6">
              <ApiKeysSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}