import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';

/**
 * Hook to manage calendar integration services
 */
export function useCalendarIntegrations() {
  // Create state for service configuration status
  const [serviceStatus, setServiceStatus] = useState({
    googleConfigured: false,
    notionConfigured: false
  });

  // Get Google Auth URL
  const { 
    data: googleAuthUrlData,
    isLoading: isLoadingGoogleAuth
  } = useQuery({
    queryKey: ['/api/integrations/google-calendar/auth-url'],
    onSuccess: (data) => {
      // If we get a valid URL, Google is configured
      setServiceStatus(prev => ({
        ...prev,
        googleConfigured: !!data?.url
      }));
    },
    onError: () => {
      setServiceStatus(prev => ({
        ...prev,
        googleConfigured: false
      }));
    }
  });

  // Check if Notion is configured by attempting to get the status
  useEffect(() => {
    const checkNotionConfig = async () => {
      try {
        // We'll use a simple test to see if Notion sync is available
        const response = await fetch('/api/integrations/notion/sync', {
          method: 'HEAD'
        });
        
        setServiceStatus(prev => ({
          ...prev,
          notionConfigured: response.ok
        }));
      } catch (error) {
        // If there's an error, Notion is likely not configured
        setServiceStatus(prev => ({
          ...prev,
          notionConfigured: false
        }));
      }
    };
    
    checkNotionConfig();
  }, []);

  // Use the state values for configuration status
  const { googleConfigured, notionConfigured } = serviceStatus;

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