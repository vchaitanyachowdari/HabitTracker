import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to manage calendar integration services
 */
export function useCalendarIntegrations() {
  // Get Google Auth URL
  const { 
    data: googleAuthUrlData,
    isLoading: isLoadingGoogleAuth
  } = useQuery({
    queryKey: ['/api/integrations/google-calendar/auth-url'],
  });

  // Since we don't have a dedicated status endpoint, we'll check if Google is configured
  // by trying to get the auth URL, and for Notion we'll check if notion API key is present in env
  const notionConfigured = process.env.NOTION_API_KEY !== undefined;
  const googleConfigured = googleAuthUrlData !== undefined && googleAuthUrlData.url !== undefined;

  // Sync to Google Calendar
  const syncToGoogle = async (): Promise<boolean> => {
    try {
      const result = await apiRequest('/api/integrations/google-calendar/sync', {
        method: 'POST',
      });
      return result.success === true;
    } catch (error) {
      console.error('Failed to sync with Google Calendar:', error);
      return false;
    }
  };

  // Sync to Notion
  const syncToNotion = async (): Promise<boolean> => {
    try {
      const result = await apiRequest('/api/integrations/notion/sync', {
        method: 'POST',
      });
      return result.success === true;
    } catch (error) {
      console.error('Failed to sync with Notion:', error);
      return false;
    }
  };

  // Sync to all configured services
  const syncToAll = async (): Promise<{google: boolean, notion: boolean}> => {
    try {
      const result = await apiRequest('/api/integrations/sync-all', {
        method: 'POST',
      });
      return {
        google: result.results?.google?.success === true,
        notion: result.results?.notion?.success === true
      };
    } catch (error) {
      console.error('Failed to sync with all services:', error);
      return { google: false, notion: false };
    }
  };

  return {
    googleAuthUrl: googleAuthUrlData?.url,
    googleConfigured,
    notionConfigured,
    syncToGoogle,
    syncToNotion,
    syncToAll,
    isLoading: isLoadingGoogleAuth
  };
}