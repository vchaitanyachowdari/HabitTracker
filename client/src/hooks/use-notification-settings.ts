import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { NotificationSettings } from '@shared/schema';

// User ID is hardcoded to 1 for demo purposes
// In a real app, this would come from authentication
const DEFAULT_USER_ID = 1;

export function useNotificationSettings(userId: number = DEFAULT_USER_ID) {
  // Get notification settings
  const { 
    data: settings, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/notification-settings', userId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    // If there's an error, return default settings
    onError: () => {
      return {
        enabled: false,
        phoneNumber: '',
        notifyBeforeClass: false,
        notifyMissedClass: false,
        reminderTime: 30
      } as NotificationSettings;
    }
  });

  // Update notification settings
  const { 
    mutate: updateSettings, 
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError
  } = useMutation({
    mutationFn: (newSettings: NotificationSettings) => 
      apiRequest(`/api/notification-settings/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      }),
    onSuccess: () => {
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notification-settings', userId] });
    }
  });

  // Check notification service status
  const { 
    data: serviceStatus, 
    isLoading: isCheckingService
  } = useQuery({
    queryKey: ['/api/notification-service/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    updateSettings,
    isUpdating,
    isUpdateError,
    updateError,
    serviceStatus,
    isCheckingService
  };
}