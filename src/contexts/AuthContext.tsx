import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_BASE_URL = "https://caseprepcrud.onrender.com";

// Determine the app domain to redirect to
const APP_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://app.caseprepared.com";

// Determine the marketing site domain for redirects
const MARKETING_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://caseprepared.com";

interface SubscriptionDetails {
  id: string;
  plan: string;
  status: string;
  created_at: string;
  stripe_subscription_id: string;
}

interface Subscription {
  is_active: boolean;
  details: SubscriptionDetails;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  organization_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
  subscription?: Subscription;
  subscription_status?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasSubscription: boolean;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  handleGoogleOAuth: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);

      const isSubscribed =
        userData.subscription?.is_active === true ||
        userData.subscription_status === "active";
      setHasSubscription(isSubscribed);

      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user profile";
      setError(errorMessage);
      throw err;
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }

      const updatedUserData = await response.json();
      setUser(updatedUserData);

      const isSubscribed =
        updatedUserData.subscription?.is_active === true ||
        updatedUserData.subscription_status === "active";
      setHasSubscription(isSubscribed);

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      return updatedUserData;
    } catch (err) {
      console.error("Error updating user profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user profile";
      setError(errorMessage);
      throw err;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refresh = localStorage.getItem("refresh_token");

      if (!refresh) {
        console.error("No refresh token available");
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token");
        return false;
      }

      const data = await response.json();

      // Store new tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      return true;
    } catch (err) {
      console.error("Token refresh error:", err);
      return false;
    }
  };

  const handleGoogleOAuth = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/oauth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Google authentication failed');
      }

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token || '');

      // Fetch user profile
      await fetchUserProfile();
    } catch (err) {
      console.error('Google OAuth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = async () => {
      try {
        // First check if there's an access_token in the URL
        // If so, don't redirect to marketing site - App.tsx will handle it
        const urlParams = new URLSearchParams(window.location.search);
        const accessTokenInUrl = urlParams.get("access_token");

        // If there's a token in the URL, wait for App.tsx to process it
        if (accessTokenInUrl) {
          console.log("Token detected in URL, waiting for processing...");
          // Short delay to ensure the token is processed by App.tsx
          setTimeout(() => {
            // After delay, check if token was stored and fetch user profile
            const storedToken = localStorage.getItem("access_token");
            if (storedToken) {
              console.log(
                "Token processed successfully, fetching user profile"
              );
              fetchUserProfile().catch((error) => {
                console.error(
                  "Error fetching user profile after token processing:",
                  error
                );
                setLoading(false);
              });
            } else {
              console.error(
                "Token processing failed - no token in localStorage"
              );
              setLoading(false);
            }
          }, 500);
          return;
        }

        // Otherwise check for token in localStorage
        const token = localStorage.getItem("access_token");
        if (token) {
          console.log("Token found in localStorage, fetching user profile");
          // Try to fetch current user profile
          await fetchUserProfile();
        } else {
          console.log("No token found, user needs to authenticate");
          // Don't redirect - let the auth screen handle it
          setLoading(false);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);

        // Try to refresh the token if fetch fails
        const refreshed = await refreshToken();

        if (refreshed) {
          try {
            // Try again with the new token
            await fetchUserProfile();
          } catch (refreshErr) {
            console.error(
              "Authentication failed after token refresh:",
              refreshErr
            );
            // Clear auth data but don't redirect
            logout();
          }
        } else {
          // Clear all auth data if refresh fails
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Logout function - updated to not redirect to marketing site
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setHasSubscription(false);
    // Don't redirect - let the auth screen show
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hasSubscription,
        logout,
        refreshToken,
        loading,
        error,
        fetchUserProfile,
        updateUserProfile,
        handleGoogleOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
