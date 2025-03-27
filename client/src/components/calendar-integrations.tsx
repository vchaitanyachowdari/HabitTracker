import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalendarIntegrations } from "@/hooks/use-calendar-integrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Calendar, AlertCircle, Check, AlertTriangle, CalendarClock, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CalendarIntegrations() {
  const { toast } = useToast();
  const {
    isGoogleCalendarConnected,
    isNotionConnected,
    syncToGoogle,
    syncToNotion,
    syncToAll,
    getGoogleAuthUrl,
    handleGoogleCallback,
    googleAuthError,
    isSyncing,
  } = useCalendarIntegrations();

  const onGoogleCalendarConnect = async () => {
    const authUrl = getGoogleAuthUrl();
    if (!authUrl) {
      toast({
        title: "Configuration Error",
        description: "Google Calendar API credentials are not properly configured.",
        variant: "destructive",
      });
      return;
    }

    // Open Google auth in a new window
    const authWindow = window.open(authUrl, "googleAuthWindow", "width=600,height=600");
    
    // This is a simplified example - in production you'd use OAuth properly
    // For demo purposes we're just showing how to handle the callback code
    if (authWindow) {
      const checkWindowClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkWindowClosed);
          
          // For demo purposes - assume authentication was successful
          // In a real application, we would properly handle the OAuth flow
          toast({
            title: "Authentication",
            description: "Please check the console for OAuth code and complete the setup.",
          });
        }
      }, 500);
    }
  };

  const handleSyncClick = async (service: 'google' | 'notion' | 'all') => {
    try {
      let success = false;
      
      if (service === 'google') {
        success = await syncToGoogle();
      } else if (service === 'notion') {
        success = await syncToNotion();
      } else {
        const result = await syncToAll();
        success = result.google || result.notion;
      }
      
      if (success) {
        toast({
          title: "Sync Successful",
          description: `Your habits have been synced to ${service === 'all' ? 'all connected services' : service === 'google' ? 'Google Calendar' : 'Notion'}.`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: "Unable to sync your habits. Please check your integration settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while trying to sync your habits.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full shadow-lg border-opacity-50">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
          <Calendar className="h-5 w-5 text-primary" />
          Calendar Integrations
        </CardTitle>
        <CardDescription>
          Connect and sync your habits with external calendar services
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google Calendar Card */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white dark:bg-slate-700 h-10 w-10 rounded-full flex items-center justify-center shadow-sm">
                    <CalendarClock className="h-6 w-6 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">Google Calendar</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Sync habits to your Google Calendar</p>
                  </div>
                </div>
                <Badge 
                  variant={isGoogleCalendarConnected ? "outline" : "secondary"} 
                  className={cn(
                    isGoogleCalendarConnected 
                      ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" 
                      : "bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700"
                  )}
                >
                  {isGoogleCalendarConnected ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {isGoogleCalendarConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Keep your Google Calendar up to date with your habits. Events will be created based on your habit schedule.
              </p>

              {!isGoogleCalendarConnected ? (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Connect your Google Calendar to sync your habits and routines.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your Google Calendar is connected and ready to sync.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {!isGoogleCalendarConnected ? (
                  <Button 
                    onClick={onGoogleCalendarConnect}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 transition-all duration-200"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSyncClick('google')}
                    disabled={isSyncing}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {isSyncing ? 'Syncing...' : 'Sync to Google Calendar'}
                  </Button>
                )}
                {isGoogleCalendarConnected && (
                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notion Card */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white dark:bg-slate-700 h-10 w-10 rounded-full flex items-center justify-center shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800 dark:text-white">
                      <path d="M4.5 7.5C4.5 5.84315 5.84315 4.5 7.5 4.5H16.5C18.1569 4.5 19.5 5.84315 19.5 7.5V16.5C19.5 18.1569 18.1569 19.5 16.5 19.5H7.5C5.84315 19.5 4.5 18.1569 4.5 16.5V7.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Notion Calendar</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Sync habits to your Notion workspace</p>
                  </div>
                </div>
                <Badge 
                  variant={isNotionConnected ? "outline" : "secondary"} 
                  className={cn(
                    isNotionConnected 
                      ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" 
                      : "bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700"
                  )}
                >
                  {isNotionConnected ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {isNotionConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create a dedicated database in your Notion workspace to track and manage your habits.
              </p>

              {!isNotionConnected ? (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Configure Notion API keys to sync your habits with Notion.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your Notion workspace is connected and ready to sync.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {!isNotionConnected ? (
                  <Button 
                    onClick={() => toast({
                      title: "Notion Integration",
                      description: "Please configure your Notion API keys in the API Keys tab.",
                    })}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect Notion
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSyncClick('notion')}
                    disabled={isSyncing}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {isSyncing ? 'Syncing...' : 'Sync to Notion'}
                  </Button>
                )}
                {isNotionConnected && (
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium mb-2">Sync All Connected Services</h3>
          <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-4">
            Sync your habits with all connected calendar services at once.
          </p>
          <Button 
            onClick={() => handleSyncClick('all')}
            disabled={isSyncing || (!isGoogleCalendarConnected && !isNotionConnected)}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            size="lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isSyncing ? 'Syncing...' : 'Sync to All Services'}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-3 px-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synced events will reflect your current habit schedule and completion status.
        </p>
      </CardFooter>
    </Card>
  );
}