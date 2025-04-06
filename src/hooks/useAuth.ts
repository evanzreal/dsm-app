import { useState, useEffect } from 'react';
import { VALID_ACCESS_CODES, AUTH_STORAGE_KEY, USED_CODES_STORAGE_KEY } from '@/config/auth';

interface AuthState {
  isAuthenticated: boolean;
  accessCode: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessCode: null
  });

  // Função para verificar se um código já foi usado
  const isCodeAlreadyUsed = (code: string): boolean => {
    try {
      const usedCodes = localStorage.getItem(USED_CODES_STORAGE_KEY);
      if (usedCodes) {
        const usedCodesArray = JSON.parse(usedCodes) as string[];
        return usedCodesArray.includes(code);
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar códigos usados:', error);
      return false;
    }
  };

  // Função para marcar um código como usado
  const markCodeAsUsed = (code: string): void => {
    try {
      const usedCodes = localStorage.getItem(USED_CODES_STORAGE_KEY);
      let usedCodesArray: string[] = [];
      
      if (usedCodes) {
        usedCodesArray = JSON.parse(usedCodes) as string[];
      }
      
      if (!usedCodesArray.includes(code)) {
        usedCodesArray.push(code);
        localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(usedCodesArray));
      }
    } catch (error) {
      console.error('Erro ao marcar código como usado:', error);
    }
  };

  useEffect(() => {
    // Verifica se existe um código salvo no localStorage
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const { accessCode } = JSON.parse(savedAuth);
        if (VALID_ACCESS_CODES.includes(accessCode)) {
          setAuthState({ isAuthenticated: true, accessCode });
        }
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    
    // Verifica se o código é válido
    if (!VALID_ACCESS_CODES.includes(normalizedCode)) {
      return { success: false, message: 'Código de acesso inválido' };
    }
    
    // Verifica se o código já foi usado
    if (isCodeAlreadyUsed(normalizedCode)) {
      return { success: false, message: 'Este código já foi utilizado' };
    }
    
    // Marca o código como usado
    markCodeAsUsed(normalizedCode);
    
    // Define o estado de autenticação
    const newAuthState = { isAuthenticated: true, accessCode: normalizedCode };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
    setAuthState(newAuthState);
    
    return { success: true, message: 'Login realizado com sucesso' };
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