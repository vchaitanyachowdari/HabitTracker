import NotificationSettings from '@/components/notification-settings';
import CalendarIntegrations from '@/components/calendar-integrations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Calendar } from 'lucide-react';

export default function Settings() {
  return (
    <div className="container px-4 py-6 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <NotificationSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <CalendarIntegrations />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}