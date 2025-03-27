import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    try {
      // Try to parse the error message as JSON
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || `${res.status}: ${text}`);
    } catch (e) {
      // If parsing fails, use the raw text
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

// Helper function to get authentication headers
function getAuthHeaders(additionalHeaders: Record<string, string> = {}) {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    ...additionalHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const {
    headers = {},
    method = 'GET',
    body,
    ...restOptions
  } = options;

  // Prepare headers with auth token and content type if needed
  const requestHeaders = getAuthHeaders({
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  });

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    ...restOptions,
  });

  await throwIfResNotOk(res);
  
  // Return JSON response if available, otherwise return response object
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get authentication headers
    const headers = getAuthHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
