import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalendarIntegrations } from "@/hooks/use-calendar-integrations";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CalendarIntegrations() {
  const {
    syncToGoogleCalendar,
    syncToNotion,
    syncToAllServices,
    authorizeGoogle,
    checkGoogleAuthResult,
    isGoogleSyncing,
    isNotionSyncing,
    isAllSyncing,
  } = useCalendarIntegrations();
  const { toast } = useToast();

  // Check if we just came back from Google authorization
  useEffect(() => {
    checkGoogleAuthResult();
  }, []);

  // Function to request API keys from the user
  const requestApiKeys = (service: "google" | "notion") => {
    if (service === "google") {
      // For Google Calendar, we need to ask for API keys
      toast({
        title: "Google Calendar Integration",
        description: "To use Google Calendar integration, please contact support to set up your API keys.",
        variant: "default",
      });
      
      // In a real application, this would redirect to a form or modal
      // to collect the user's Google API credentials
      console.log("Request Google API keys");
    } else if (service === "notion") {
      // For Notion, we need to ask for an API key
      toast({
        title: "Notion Integration",
        description: "To use Notion integration, please contact support to set up your API keys.",
        variant: "default",
      });
      
      // In a real application, this would redirect to a form or modal
      // to collect the user's Notion API token
      console.log("Request Notion API key");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar & Task Integrations</CardTitle>
          <CardDescription>
            Connect your habits with external calendars and task management systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Calendar Integration */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Google Calendar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sync completed habits to your Google Calendar for better visibility
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button 
                variant="outline" 
                onClick={() => requestApiKeys("google")}
              >
                Set API Keys
              </Button>
              <Button 
                variant="outline" 
                onClick={authorizeGoogle}
              >
                Connect Account
              </Button>
              <Button 
                onClick={syncToGoogleCalendar} 
                disabled={isGoogleSyncing}
              >
                {isGoogleSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>
            </div>
          </div>

          {/* Notion Integration */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Notion</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a database in Notion with your habit tracking data
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button 
                variant="outline" 
                onClick={() => requestApiKeys("notion")}
              >
                Set API Key
              </Button>
              <Button 
                onClick={syncToNotion} 
                disabled={isNotionSyncing}
              >
                {isNotionSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="default" 
            onClick={syncToAllServices} 
            disabled={isAllSyncing}
          >
            {isAllSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing to All Services...
              </>
            ) : (
              "Sync to All Connected Services"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}