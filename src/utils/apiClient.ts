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

/**
 * Utility function to refresh token and update user profile
 * This ensures the user has the latest subscription status after payment
 */
export const refreshTokenAndProfile = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    // Refresh the access token
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token');
      return false;
    }

    const data = await response.json();

    // Store new tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token || '');

    // Fetch updated user profile with new token
    const profileResponse = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const userData = await profileResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Token and profile refreshed successfully');
      return true;
    } else {
      console.error('Failed to fetch updated user profile');
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token and profile:', error);
    return false;
  }
};

/**
 * Utility function to check if user needs token refresh
 * Returns true if the current token is likely stale (e.g., after payment)
 */
export const shouldRefreshToken = (): boolean => {
  // Check if we're on a payment success page
  const isOnPaymentSuccess = window.location.pathname.includes('/checkout/success');
  
  // Check if we have a session_id in URL (indicates recent payment)
  const urlParams = new URLSearchParams(window.location.search);
  const hasSessionId = urlParams.has('session_id');
  
  return isOnPaymentSuccess && hasSessionId;
}; 