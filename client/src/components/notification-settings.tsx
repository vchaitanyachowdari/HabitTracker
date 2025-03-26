import { useState } from 'react';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BellRing, Check, X } from 'lucide-react';

export default function NotificationSettings() {
  const { toast } = useToast();
  const { 
    settings, 
    isLoading, 
    updateSettings, 
    isUpdating, 
    serviceStatus, 
    isCheckingService 
  } = useNotificationSettings();

  // Use state to manage form values
  const [formValues, setFormValues] = useState({
    enabled: false,
    phoneNumber: '',
    notifyBeforeClass: false,
    notifyMissedClass: false,
    reminderTime: 30,
  });

  // Update form when settings are loaded
  useState(() => {
    if (settings) {
      setFormValues({
        enabled: settings.enabled || false,
        phoneNumber: settings.phoneNumber || '',
        notifyBeforeClass: settings.notifyBeforeClass || false,
        notifyMissedClass: settings.notifyMissedClass || false,
        reminderTime: settings.reminderTime || 30,
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formValues, {
      onSuccess: () => {
        toast({
          title: "Settings updated",
          description: "Your notification settings have been saved.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update notification settings.",
        });
      }
    });
  };

  // Loading state
  if (isLoading || isCheckingService) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  // Check if service is available
  const isServiceAvailable = serviceStatus?.enabled === true;

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            WhatsApp Notification Settings
          </CardTitle>
          <CardDescription>
            Configure WhatsApp notifications for your college classes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Status Alert */}
          {!isServiceAvailable && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Service Unavailable</AlertTitle>
              <AlertDescription>
                WhatsApp notification service is currently unavailable. The necessary API credentials are not configured.
              </AlertDescription>
            </Alert>
          )}

          {/* Main switch */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enable-notifications" className="flex flex-col space-y-1">
              <span>Enable WhatsApp Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive updates about your classes via WhatsApp
              </span>
            </Label>
            <Switch
              id="enable-notifications"
              disabled={!isServiceAvailable}
              checked={formValues.enabled}
              onCheckedChange={(checked) => 
                setFormValues((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone-number">WhatsApp Phone Number</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+1234567890"
              disabled={!formValues.enabled || !isServiceAvailable}
              value={formValues.phoneNumber}
              onChange={(e) => 
                setFormValues((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Enter your full phone number with country code (e.g., +1234567890)
            </p>
          </div>

          {/* Notification Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Options</h3>
            
            {/* Before Class Notification */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notify-before-class">
                Notify before class
              </Label>
              <Switch
                id="notify-before-class"
                disabled={!formValues.enabled || !isServiceAvailable}
                checked={formValues.notifyBeforeClass}
                onCheckedChange={(checked) => 
                  setFormValues((prev) => ({ ...prev, notifyBeforeClass: checked }))
                }
              />
            </div>
            
            {/* Missed Class Notification */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notify-missed-class">
                Notify for missed classes
              </Label>
              <Switch
                id="notify-missed-class"
                disabled={!formValues.enabled || !isServiceAvailable}
                checked={formValues.notifyMissedClass}
                onCheckedChange={(checked) => 
                  setFormValues((prev) => ({ ...prev, notifyMissedClass: checked }))
                }
              />
            </div>
          </div>

          {/* Reminder Time Slider */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="reminder-time">Reminder Time (minutes before class)</Label>
              <span className="text-sm font-medium">{formValues.reminderTime} min</span>
            </div>
            <Slider
              id="reminder-time"
              disabled={!formValues.enabled || !formValues.notifyBeforeClass || !isServiceAvailable}
              value={[formValues.reminderTime]}
              min={5}
              max={60}
              step={5}
              onValueChange={(value) => 
                setFormValues((prev) => ({ ...prev, reminderTime: value[0] }))
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              if (settings) {
                setFormValues({
                  enabled: settings.enabled || false,
                  phoneNumber: settings.phoneNumber || '',
                  notifyBeforeClass: settings.notifyBeforeClass || false,
                  notifyMissedClass: settings.notifyMissedClass || false,
                  reminderTime: settings.reminderTime || 30,
                });
              }
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isUpdating || !isServiceAvailable}>
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}