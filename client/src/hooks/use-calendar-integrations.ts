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
    queryKey: ['/api/integrations/google/auth-url'],
  });

  // Get integration status
  const {
    data: integrationStatus,
    isLoading: isLoadingStatus
  } = useQuery({
    queryKey: ['/api/integrations/status'],
  });

  // Sync to Google Calendar
  const syncToGoogle = async (): Promise<boolean> => {
    try {
      const result = await apiRequest('/api/integrations/google/sync', {
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
      return result;
    } catch (error) {
      console.error('Failed to sync with all services:', error);
      return { google: false, notion: false };
    }
  };

  // Extract status information
  const googleConfigured = integrationStatus?.google?.configured === true;
  const notionConfigured = integrationStatus?.notion?.configured === true;

  return {
    googleAuthUrl: googleAuthUrlData?.url,
    googleConfigured,
    notionConfigured,
    syncToGoogle,
    syncToNotion,
    syncToAll,
    isLoading: isLoadingGoogleAuth || isLoadingStatus
  };
}