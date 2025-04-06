import { useState, useEffect } from 'react';
import { VALID_ACCESS_CODES, AUTH_STORAGE_KEY } from '@/config/auth';

interface AuthState {
  isAuthenticated: boolean;
  accessCode: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessCode: null
  });

  useEffect(() => {
    // Verifica se existe um código salvo no localStorage
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      const { accessCode } = JSON.parse(savedAuth);
      if (VALID_ACCESS_CODES.includes(accessCode)) {
        setAuthState({ isAuthenticated: true, accessCode });
      }
    }
  }, []);

  const login = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    if (VALID_ACCESS_CODES.includes(normalizedCode)) {
      const newAuthState = { isAuthenticated: true, accessCode: normalizedCode };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
      setAuthState(newAuthState);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ isAuthenticated: false, accessCode: null });
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    accessCode: authState.accessCode,
    login,
    logout
  };
} 