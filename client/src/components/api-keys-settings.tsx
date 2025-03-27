import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ApiKeysSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('twilio');

  const handleConfigureKeys = (service: string) => {
    const secretsNeeded: Record<string, string[]> = {
      twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
      notion: ['NOTION_API_KEY', 'NOTION_DATABASE_ID'],
      google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI']
    };

    const requestedSecrets = secretsNeeded[service] || [];
    if (requestedSecrets.length === 0) return;

    // This function will be replaced by the ask_secrets tool when the user clicks
    // It will ask for the appropriate secrets based on the service
    toast({
      title: "API Keys Configuration",
      description: `Please provide the required API keys for ${service.charAt(0).toUpperCase() + service.slice(1)} integration.`,
    });
    
    // Note: The function behavior will be handled by the ask_secrets tool
    // which will be triggered when the user clicks the respective button.
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys Configuration
        </CardTitle>
        <CardDescription>
          Configure API keys for external service integrations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Administrator Access Required</AlertTitle>
          <AlertDescription>
            Adding or modifying API keys requires administrator access. 
            Please contact your system administrator to update these settings.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="twilio">WhatsApp/Twilio</TabsTrigger>
            <TabsTrigger value="notion">Notion</TabsTrigger>
            <TabsTrigger value="google">Google Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="twilio" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">WhatsApp Notifications via Twilio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Twilio API keys to enable WhatsApp notifications for class reminders and alerts.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
                <li>TWILIO_ACCOUNT_SID - Your Twilio account SID</li>
                <li>TWILIO_AUTH_TOKEN - Your Twilio auth token</li>
                <li>TWILIO_PHONE_NUMBER - Your Twilio WhatsApp-enabled phone number</li>
              </ul>
              <Button onClick={() => handleConfigureKeys('twilio')}>Configure Twilio Keys</Button>
            </div>
          </TabsContent>

          <TabsContent value="notion" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Notion Calendar Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Notion API keys to sync habits with your Notion workspace.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
                <li>NOTION_API_KEY - Your Notion integration token</li>
                <li>NOTION_DATABASE_ID - The ID of your Notion database for habits</li>
              </ul>
              <Button onClick={() => handleConfigureKeys('notion')}>Configure Notion Keys</Button>
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Google Calendar Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Google API keys to sync habits with your Google Calendar.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
                <li>GOOGLE_CLIENT_ID - Your Google OAuth client ID</li>
                <li>GOOGLE_CLIENT_SECRET - Your Google OAuth client secret</li>
                <li>GOOGLE_REDIRECT_URI - The redirect URI for OAuth callback</li>
              </ul>
              <Button onClick={() => handleConfigureKeys('google')}>Configure Google Keys</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          API keys are stored securely as environment variables and are never exposed to clients.
        </p>
      </CardFooter>
    </Card>
  );
}