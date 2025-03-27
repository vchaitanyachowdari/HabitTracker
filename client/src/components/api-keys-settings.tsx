import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Key, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  isConfigured: boolean;
  message: string;
}

export default function ApiKeysSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('twilio');
  const [serviceStatus, setServiceStatus] = useState<Record<string, ServiceStatus>>({
    twilio: { isConfigured: false, message: 'Not configured' },
    notion: { isConfigured: false, message: 'Not configured' },
    google: { isConfigured: true, message: 'Partially configured' },
  });

  // This would be replaced with actual API calls to check service status
  useEffect(() => {
    // Simulate checking API key status - this would be an actual API call
    const checkStatus = async () => {
      // In a real implementation, this would check if the keys actually exist
      setServiceStatus({
        twilio: { isConfigured: false, message: 'Not configured' },
        notion: { isConfigured: false, message: 'Not configured' },
        google: { isConfigured: true, message: 'Partially configured' }, // Some Google keys are available
      });
    };
    
    checkStatus();
  }, []);

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

  const renderStatusBadge = (service: string) => {
    const status = serviceStatus[service];
    if (!status) return null;
    
    return (
      <Badge 
        variant={status.isConfigured ? "outline" : "secondary"} 
        className={cn(
          "ml-2",
          status.isConfigured ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-300" : "bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-300"
        )}
      >
        {status.isConfigured ? (
          <CheckCircle2 className="h-3 w-3 mr-1" />
        ) : (
          <Info className="h-3 w-3 mr-1" />
        )}
        {status.message}
      </Badge>
    );
  };

  return (
    <Card className="w-full shadow-lg border-opacity-50">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
          <Key className="h-5 w-5 text-primary" />
          API Keys Configuration
        </CardTitle>
        <CardDescription>
          Configure API keys for external service integrations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <AlertTitle className="font-semibold text-blue-700 dark:text-blue-300">Secure Configuration</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            API keys are stored securely as environment variables and are never exposed to clients. 
            Configure your integrations below to enable additional features.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <TabsTrigger 
              value="twilio" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 flex items-center justify-center"
            >
              <div className="flex items-center">
                WhatsApp/Twilio
                {renderStatusBadge('twilio')}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="notion"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 flex items-center justify-center"
            >
              <div className="flex items-center">
                Notion
                {renderStatusBadge('notion')}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="google"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 flex items-center justify-center"
            >
              <div className="flex items-center">
                Google Calendar
                {renderStatusBadge('google')}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twilio" className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-medium bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">WhatsApp Notifications via Twilio</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Configure Twilio API keys to enable WhatsApp notifications for class reminders and alerts.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2">Required API Keys</h4>
                <ul className="list-disc pl-5 text-sm space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">TWILIO_ACCOUNT_SID</span> - Your Twilio account SID</li>
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">TWILIO_AUTH_TOKEN</span> - Your Twilio auth token</li>
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">TWILIO_PHONE_NUMBER</span> - Your Twilio WhatsApp-enabled phone number</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => handleConfigureKeys('twilio')}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-200"
              >
                Configure Twilio Keys
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notion" className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Notion Calendar Integration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Configure Notion API keys to sync habits with your Notion workspace and create a dedicated database.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2">Required API Keys</h4>
                <ul className="list-disc pl-5 text-sm space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">NOTION_API_KEY</span> - Your Notion integration token</li>
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">NOTION_DATABASE_ID</span> - The ID of your Notion database for habits</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => handleConfigureKeys('notion')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
              >
                Configure Notion Keys
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-medium bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">Google Calendar Integration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Configure Google API keys to sync habits with your Google Calendar and create calendar events for your routines.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2">Required API Keys</h4>
                <ul className="list-disc pl-5 text-sm space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">GOOGLE_CLIENT_ID</span> - Your Google OAuth client ID</li>
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">GOOGLE_CLIENT_SECRET</span> - Your Google OAuth client secret</li>
                  <li><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">GOOGLE_REDIRECT_URI</span> - The redirect URI for OAuth callback</li>
                </ul>
              </div>
              
              {serviceStatus.google.isConfigured ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleConfigureKeys('google')}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 transition-all duration-200"
                  >
                    Update Google Keys
                  </Button>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20">
                    Test Connection
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => handleConfigureKeys('google')}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 transition-all duration-200"
                >
                  Configure Google Keys
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-3 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          API keys are stored securely as environment variables and are never exposed to clients.
        </p>
        <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-primary">
          Learn more
        </Button>
      </CardFooter>
    </Card>
  );
}