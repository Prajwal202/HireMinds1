import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData.data);
        } catch (err) {
          console.error('Error fetching user data:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('token');
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: 'Failed to logout. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
