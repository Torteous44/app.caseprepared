import { useAuth } from "../contexts/AuthContext";

// API base URL from environment
const API_BASE_URL = "https://caseprepcrud.onrender.com";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipRefresh?: boolean;
}

/**
 * Utility function to make API requests with automatic token refresh
 * 
 * @param endpoint API endpoint (without base URL)
 * @param options Request options
 * @returns Response data
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { requireAuth = true, skipRefresh = false, ...fetchOptions } = options;
  
  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add authorization header if required
  if (requireAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (!skipRefresh) {
      // Try to refresh the token if not available and refresh is not skipped
      const refreshed = await refreshTokenSilently();
      if (refreshed) {
        const newToken = localStorage.getItem('access_token');
        headers.set('Authorization', `Bearer ${newToken}`);
      } else {
        throw new Error('Authentication required');
      }
    }
  }
  
  // Make the request
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });
    
    // Handle 401 Unauthorized error
    if (response.status === 401 && requireAuth && !skipRefresh) {
      // Try to refresh the token
      const refreshed = await refreshTokenSilently();
      if (refreshed) {
        // Retry the request with the new token
        const newToken = localStorage.getItem('access_token');
        headers.set('Authorization', `Bearer ${newToken}`);
        
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }
        
        return await retryResponse.json() as T;
      } else {
        throw new Error('Authentication failed');
      }
    }
    
    // Handle other errors
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    // Return the response data
    return await response.json() as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Helper function to refresh the token silently
 * 
 * @returns Whether the token was successfully refreshed
 */
const refreshTokenSilently = async (): Promise<boolean> => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Store new tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token || '');
    
    return true;
  } catch (error) {
    console.error('Silent token refresh error:', error);
    return false;
  }
};

/**
 * React hook for using the API client in components
 */
export const useApi = () => {
  const auth = useAuth();
  
  return {
    request: apiRequest,
    refreshToken: auth.refreshToken,
  };
}; 