import { useState, useCallback } from 'react';
import {
  getCurrentSession,
  loginUser,
  registerUser,
  logoutUser,
  isUserAdmin,
} from '../services/authService';

/**
 * Custom React Hook: useAuth
 * Provides authentication state and role-based permissions (FA-2 Requirement)
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());

  const login = useCallback((email, password) => {
    const result = loginUser(email, password);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback((name, email, password) => {
    const result = registerUser(name, email, password);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setCurrentUser(null);
  }, []);

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: isUserAdmin(currentUser),
    login,
    signup,
    logout,
  };
}
