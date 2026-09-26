import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Corrupted user session cleared:', e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      let savedToken = localStorage.getItem('token');
      if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
        const saved = localStorage.getItem('user');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          const parsed = JSON.parse(saved);
          if (parsed?.token && parsed.token !== 'undefined' && parsed.token !== 'null') {
            localStorage.setItem('token', parsed.token);
            return parsed.token;
          }
        }
        return '';
      }
      return savedToken;
    } catch (e) {
      localStorage.removeItem('token');
      return '';
    }
  });
  const [dbStatus, setDbStatus] = useState({ connected: false, uri: 'Checking...' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    authAPI.getStatus()
      .then(res => setDbStatus(res.data))
      .catch(() => setDbStatus({ connected: false, uri: 'Fallback Mode' }));
  }, []);

  const login = async (identifier, password, requiredRole = null) => {
    try {
      const res = await authAPI.login({
        identifier,
        password,
        requiredRole: requiredRole || undefined
      });
      const userData = res.data;

      // Double-check role parity on client side as an extra safeguard
      if (requiredRole && userData.role && userData.role.toLowerCase() !== requiredRole.toLowerCase()) {
        const userRoleName = userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase();
        const reqRoleName = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1).toLowerCase();
        const errorMsg = `Access Denied: This account is registered as a ${userRoleName}. Please log in via the ${userRoleName} Portal.`;
        showToast(errorMsg, 'error');
        return { success: false, error: errorMsg, registeredRole: userData.role };
      }

      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      showToast(`Welcome back, ${userData.firstName}! Logged into ${userData.role.toUpperCase()} Portal`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      const registeredRole = err.response?.data?.registeredRole;
      showToast(msg, 'error');
      return { success: false, error: msg, registeredRole };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      showToast(`Account created! Welcome, ${userData.firstName}!`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
  };

  const updateUserLocation = async (locationData) => {
    try {
      const res = await authAPI.updateLocation(locationData);
      if (res.data.success) {
        const updatedUser = { ...user, location: res.data.location };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Live GPS location updated', 'success');
      }
    } catch (err) {
      showToast('Could not sync location', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      dbStatus,
      toast,
      showToast,
      login,
      register,
      logout,
      updateUserLocation,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
