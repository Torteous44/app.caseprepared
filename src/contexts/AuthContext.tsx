import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

// Determine the app domain to redirect to
const APP_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://app.caseprepared.com";

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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name: string
  ) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
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

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          // Try to fetch current user profile
          await fetchUserProfile();
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      // Fetch the user profile using the token
      await fetchUserProfile();

      // Redirect to app domain after successful login
      window.location.href = APP_DOMAIN;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    full_name: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        email,
        password,
        full_name,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      // Fetch the user profile using the token
      await fetchUserProfile();

      // Redirect to app domain after successful registration
      window.location.href = APP_DOMAIN;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Sending Google authorization code to backend");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/oauth/google/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      // Log full response details for debugging
      console.log("Response status:", response.status);

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        // Extract detailed error message if available
        let errorMessage = "Google login failed";

        if (responseData.detail) {
          errorMessage =
            typeof responseData.detail === "string"
              ? responseData.detail
              : JSON.stringify(responseData.detail);
        }

        throw new Error(errorMessage);
      }

      // Store tokens
      localStorage.setItem("access_token", responseData.access_token);
      localStorage.setItem("refresh_token", responseData.refresh_token || "");

      // Fetch the user profile
      await fetchUserProfile();

      // Note: We don't redirect here as it's handled in the GoogleOAuthCallback component
    } catch (err) {
      console.error("Google login error details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        refreshToken,
        loading,
        error,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
