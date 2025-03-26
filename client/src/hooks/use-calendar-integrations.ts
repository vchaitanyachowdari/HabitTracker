import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useCalendarIntegrations() {
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [isNotionSyncing, setIsNotionSyncing] = useState(false);
  const [isAllSyncing, setIsAllSyncing] = useState(false);
  const { toast } = useToast();

  // Sync habits to Google Calendar
  const syncToGoogleCalendar = async () => {
    try {
      setIsGoogleSyncing(true);
      const response = await apiRequest("/api/integrations/google-calendar/sync", {
        method: "POST"
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "Habits successfully synced to Google Calendar.",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Sync Failed",
          description: response.message || "Failed to sync with Google Calendar. Check your credentials.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error syncing to Google Calendar:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing with Google Calendar.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  // Get Google Calendar authorization URL
  const getGoogleAuthUrl = async () => {
    try {
      const response = await apiRequest("/api/integrations/google-calendar/auth-url", {
        method: "GET"
      });
      return response.url;
    } catch (error) {
      console.error("Error getting Google Calendar auth URL:", error);
      toast({
        title: "Error",
        description: "Failed to get Google Calendar authorization URL.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Redirect user to Google authorization page
  const authorizeGoogle = async () => {
    const authUrl = await getGoogleAuthUrl();
    if (authUrl) {
      window.location.href = authUrl;
    } else {
      toast({
        title: "Authorization Failed",
        description: "Could not get authorization URL for Google Calendar.",
        variant: "destructive",
      });
    }
  };

  // Sync habits to Notion
  const syncToNotion = async () => {
    try {
      setIsNotionSyncing(true);
      const response = await apiRequest("/api/integrations/notion/sync", {
        method: "POST"
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "Habits successfully synced to Notion.",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Sync Failed",
          description: response.message || "Failed to sync with Notion. Check your API key.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error syncing to Notion:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing with Notion.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsNotionSyncing(false);
    }
  };

  // Sync habits to all connected services
  const syncToAllServices = async () => {
    try {
      setIsAllSyncing(true);
      const response = await apiRequest("/api/integrations/sync-all", {
        method: "POST"
      });

      if (response.success) {
        toast({
          title: "Sync Complete",
          description: "Habits have been synced to connected services.",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Sync Failed",
          description: "Failed to sync habits to external services. Check your credentials.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error syncing to all services:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing with external services.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAllSyncing(false);
    }
  };

  // Check for Google authorization success/error from URL parameters
  const checkGoogleAuthResult = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuthSuccess = urlParams.get("google_auth_success");
    const googleAuthError = urlParams.get("google_auth_error");

    if (googleAuthSuccess) {
      toast({
        title: "Google Authorization Successful",
        description: "Your Google Calendar has been successfully connected.",
        variant: "default",
      });
      // Remove the query parameter to avoid showing the toast on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return true;
    } else if (googleAuthError) {
      toast({
        title: "Google Authorization Failed",
        description: "Failed to connect your Google Calendar. Please try again.",
        variant: "destructive",
      });
      // Remove the query parameter to avoid showing the toast on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return false;
    }
    return null;
  };

  return {
    syncToGoogleCalendar,
    syncToNotion,
    syncToAllServices,
    authorizeGoogle,
    checkGoogleAuthResult,
    isGoogleSyncing,
    isNotionSyncing,
    isAllSyncing
  };
}