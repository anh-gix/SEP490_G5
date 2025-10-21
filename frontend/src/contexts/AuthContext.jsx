import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(credentials);
      authService.saveUserData(userData);
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      authService.saveUserData(response);
      setUser(response);
      return response;
    } catch (error) {
      setError(error.message || 'Đăng ký thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Ngay cả khi logout API thất bại, vẫn clear state
      setUser(null);
      setError(null);
    }
  };

  // Cập nhật profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message || 'Cập nhật profile thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
