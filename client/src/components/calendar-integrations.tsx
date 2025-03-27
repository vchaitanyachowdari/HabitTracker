import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useCalendarIntegrations } from '@/hooks/use-calendar-integrations';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Calendar, CheckCircle, Loader2, Settings } from 'lucide-react';
import { Link } from 'wouter';

export default function CalendarIntegrations() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const {
    googleAuthUrl,
    notionConfigured,
    googleConfigured,
    syncToGoogle,
    syncToNotion,
    syncToAll,
    isLoading
  } = useCalendarIntegrations();

  const handleGoogleAuth = () => {
    if (googleAuthUrl) {
      window.open(googleAuthUrl, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Google Calendar authentication URL is not available.",
      });
    }
  };

  const handleSync = async (type: 'google' | 'notion' | 'all') => {
    setIsSyncing(true);
    try {
      let success = false;

      if (type === 'google' && googleConfigured) {
        success = await syncToGoogle();
      } else if (type === 'notion' && notionConfigured) {
        success = await syncToNotion();
      } else if (type === 'all') {
        const result = await syncToAll();
        success = result.google || result.notion;
      }

      if (success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced habits to ${type === 'all' ? 'all configured calendars' : type === 'google' ? 'Google Calendar' : 'Notion'}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: "No calendar services are properly configured for sync.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "An error occurred during the sync process.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calendar Integrations</CardTitle>
          <CardDescription>Connect and sync with your favorite calendar services</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integrations
        </CardTitle>
        <CardDescription>
          Connect and sync your habits with external calendar services
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Google Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">Sync your habits to Google Calendar</p>
            </div>
            <div className="flex items-center">
              {googleConfigured ? (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center text-sm text-orange-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Not Connected
                </span>
              )}
            </div>
          </div>
          
          {!googleConfigured && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  Google Calendar integration requires client ID, client secret, and redirect URI to be configured.
                  These can be added as environment secrets via the settings page.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit flex items-center gap-1"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Configure API Keys
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-wrap gap-2">
            {!googleConfigured && (
              <Button variant="outline" onClick={handleGoogleAuth} disabled={!googleAuthUrl}>
                Connect Google Calendar
              </Button>
            )}
            <Button 
              variant="default" 
              onClick={() => handleSync('google')} 
              disabled={!googleConfigured || isSyncing}
            >
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sync to Google Calendar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notion Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Notion</h3>
              <p className="text-sm text-muted-foreground">Sync your habits to a Notion database</p>
            </div>
            <div className="flex items-center">
              {notionConfigured ? (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center text-sm text-orange-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Not Connected
                </span>
              )}
            </div>
          </div>
          
          {!notionConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  Notion integration requires a Notion API key and database ID to be configured. 
                  These can be added as environment secrets via the settings page.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit flex items-center gap-1"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Configure API Keys
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            variant="default" 
            onClick={() => handleSync('notion')} 
            disabled={!notionConfigured || isSyncing}
          >
            {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sync to Notion
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline" 
          onClick={() => handleSync('all')} 
          disabled={(!(googleConfigured || notionConfigured)) || isSyncing}
        >
          {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sync to All Services
        </Button>
      </CardFooter>
    </Card>
  );
}