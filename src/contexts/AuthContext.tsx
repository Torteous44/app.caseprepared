import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// // API base URL from environment
// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || "https://casepreparedcrud.onrender.com";

const API_BASE_URL = "https://casepreparedcrud.onrender.com";

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
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
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
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/json-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      // Fetch the user profile using the token
      await fetchUserProfile();
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
        organization_name: null, // Add organization_name field
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      // Fetch the user profile using the token
      await fetchUserProfile();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        "Sending Google token to backend:",
        token.substring(0, 10) + "..."
      );

      // Use a hybrid approach - POST request but with token in query parameter
      // This matches the actual backend implementation based on the error message
      const queryUrl = `${API_BASE_URL}/api/v1/auth/google-login?token=${encodeURIComponent(
        token
      )}`;

      const response = await fetch(queryUrl, {
        method: "POST", // Using POST as per documentation, but with query parameter as per actual implementation
        headers: {
          Accept: "application/json",
        },
        // No body needed as the token is in the query parameter
      });

      // Log full response details for debugging
      console.log("Response status:", response.status);

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        // Extract detailed error message if available
        let errorMessage = "Google login failed";

        if (responseData.detail) {
          // Handle FastAPI-style errors
          if (typeof responseData.detail === "object") {
            console.error(
              "Detailed validation errors:",
              JSON.stringify(responseData.detail)
            );
            // Try to extract all validation errors
            errorMessage = "Validation error: ";
            if (Array.isArray(responseData.detail)) {
              errorMessage += responseData.detail
                .map(
                  (err: any) =>
                    `${err.loc ? err.loc.join(".") + ": " : ""}${err.msg}`
                )
                .join("; ");
            } else {
              errorMessage += JSON.stringify(responseData.detail);
            }
          } else {
            errorMessage = responseData.detail;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }

        throw new Error(errorMessage);
      }

      // Store tokens
      localStorage.setItem("access_token", responseData.access_token);
      localStorage.setItem("refresh_token", responseData.refresh_token || "");

      // Fetch the user profile
      await fetchUserProfile();
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
