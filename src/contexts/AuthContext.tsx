import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// API base URL from environment
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://casepreparedcrud.onrender.com";

interface User {
  id: number;
  email: string;
  full_name?: string;
  organization_name?: string;
  is_active: boolean;
  created_at: string;
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

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          // Fetch user data or validate token
          const userData = JSON.parse(localStorage.getItem("user") || "null");
          if (userData) {
            setUser(userData);
          }
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
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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

      // Store tokens and user data
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
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

      // Store tokens and user data
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
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

      // Using POST with token in the request body as required by the API
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token }),
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

      // Store tokens and user data
      localStorage.setItem("access_token", responseData.access_token);
      localStorage.setItem("refresh_token", responseData.refresh_token || "");
      localStorage.setItem("user", JSON.stringify(responseData.user));

      setUser(responseData.user);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
