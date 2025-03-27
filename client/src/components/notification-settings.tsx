import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, Save, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notificationSettingsSchema } from "@shared/schema";

// Define a more targeted schema for the form with validation
const formSchema = notificationSettingsSchema.extend({
  phoneNumber: z.string().optional().refine(
    (val) => !val || /^\+\d{10,15}$/.test(val),
    {
      message: "Phone number must be in international format (e.g., +1234567890)",
    }
  ),
});

export default function NotificationSettings() {
  const { toast } = useToast();
  
  const {
    data: settings,
    isLoading,
    isError,
    error,
    updateSettings,
  } = useNotificationSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: false,
      phoneNumber: "",
      notifyBeforeClass: true,
      notifyMissedClass: true,
      reminderTime: 30,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        enabled: settings.enabled,
        phoneNumber: settings.phoneNumber || "",
        notifyBeforeClass: settings.notifyBeforeClass ?? true,
        notifyMissedClass: settings.notifyMissedClass ?? true,
        reminderTime: settings.reminderTime ?? 30,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast({
        title: "Failed to update settings",
        description: "There was an error saving your notification preferences.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg border-opacity-50">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            <Bell className="h-5 w-5 text-primary" />
            Loading Notification Settings...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-pulse h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load notification settings. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-opacity-50">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
          <Bell className="h-5 w-5 text-primary" />
          WhatsApp Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your notification preferences for WhatsApp alerts and reminders
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-base font-medium">WhatsApp Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enable to receive notifications via WhatsApp</p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="m-0">
                        {field.value ? "Enabled" : "Disabled"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        disabled={!form.watch("enabled")}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your phone number with country code (e.g., +1234567890)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="text-base font-medium">Class Reminders</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="notifyBeforeClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Before Class Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications before classes start
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!form.watch("enabled")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Time</FormLabel>
                          <Select
                            disabled={!form.watch("enabled") || !form.watch("notifyBeforeClass")}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reminder time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">15 minutes before</SelectItem>
                              <SelectItem value="30">30 minutes before</SelectItem>
                              <SelectItem value="60">1 hour before</SelectItem>
                              <SelectItem value="120">2 hours before</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How early to send reminders before class
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-500" />
                      <h3 className="text-base font-medium">Missed Class Alerts</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="notifyMissedClass"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Missed Class Notifications</FormLabel>
                            <FormDescription>
                              Get notified when you miss a scheduled class
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!form.watch("enabled")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-lg text-sm">
                      Missed class notifications will be sent approximately 15 minutes after the class start time if no attendance is recorded.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
              disabled={updateSettings.isPending || !form.formState.isDirty}
            >
              {updateSettings.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-3 px-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Notification settings will be applied immediately after saving.
        </p>
      </CardFooter>
    </Card>
  );
}