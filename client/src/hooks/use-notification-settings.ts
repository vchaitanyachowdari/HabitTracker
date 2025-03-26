import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationSettings } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const DEFAULT_USER_ID = 1; // Using default user for now

/**
 * Hook to manage notification settings for the current user
 */
export function useNotificationSettings(userId: number = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();
  const [serviceStatus, setServiceStatus] = useState<{ enabled: boolean } | null>(null);
  
  // Fetch notification settings
  const {
    data: settings,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/notification-settings', userId],
    enabled: !!userId,
  });

  // Check notification service status
  const {
    isLoading: isCheckingService,
  } = useQuery({
    queryKey: ['/api/notification-service/status'],
    onSuccess: (data) => {
      setServiceStatus(data);
    },
    onError: () => {
      setServiceStatus({ enabled: false });
    }
  });

  // Update notification settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError
  } = useMutation({
    mutationFn: (newSettings: NotificationSettings) => 
      apiRequest('/api/notification-settings/' + userId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      }),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/notification-settings', userId] });
    },
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    updateSettings,
    isUpdating,
    updateError,
    serviceStatus,
    isCheckingService
  };
}