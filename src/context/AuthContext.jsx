import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

// Create context
export const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);

          // Ensure important fields exist
          parsedUser.classes = parsedUser.classes || [];
          parsedUser.role = parsedUser.role || "student";

          setUser(parsedUser);

          // Attach token to Axios
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Error reading user from storage:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        classId: res.data.classId || null,
        classes: res.data.classes || [],
        enrollmentNumber: res.data.enrollmentNumber || null,
      };

      setUser(userData);

      // Save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Attach token to Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      return userData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (name, email, password, role = "student") => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        classId: res.data.classId || null,
        classes: res.data.classes || [],
        enrollmentNumber: res.data.enrollmentNumber || null,
      };

      setUser(userData);

      // Save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Attach token to Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      return userData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
