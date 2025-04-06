import { useState, useEffect } from 'react';
import { 
  VALID_ACCESS_CODES, 
  AUTH_STORAGE_KEY, 
  USED_CODES_STORAGE_KEY,
  VERIFIED_DEVICES_STORAGE_KEY,
  VerifiedDevice
} from '@/config/auth';
import { getDeviceId } from '@/utils/deviceId';

interface AuthState {
  isAuthenticated: boolean;
  accessCode: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessCode: null
  });

  // Função para verificar se um dispositivo já está verificado
  const isDeviceVerified = (): { verified: boolean; accessCode?: string } => {
    try {
      const deviceId = getDeviceId();
      const verifiedDevices = localStorage.getItem(VERIFIED_DEVICES_STORAGE_KEY);
      
      if (verifiedDevices) {
        const devices = JSON.parse(verifiedDevices) as VerifiedDevice[];
        const currentDevice = devices.find(device => device.deviceId === deviceId);
        
        if (currentDevice) {
          return { verified: true, accessCode: currentDevice.accessCode };
        }
      }
      
      return { verified: false };
    } catch (error) {
      console.error('Erro ao verificar dispositivo:', error);
      return { verified: false };
    }
  };

  // Função para registrar um dispositivo como verificado
  const registerVerifiedDevice = (accessCode: string): void => {
    try {
      const deviceId = getDeviceId();
      const verifiedDevices = localStorage.getItem(VERIFIED_DEVICES_STORAGE_KEY);
      let devices: VerifiedDevice[] = [];
      
      if (verifiedDevices) {
        devices = JSON.parse(verifiedDevices) as VerifiedDevice[];
      }
      
      // Verifica se este dispositivo já está registrado
      const existingDevice = devices.findIndex(device => device.deviceId === deviceId);
      
      if (existingDevice !== -1) {
        // Atualiza o dispositivo existente
        devices[existingDevice] = {
          deviceId,
          accessCode,
          verifiedAt: Date.now()
        };
      } else {
        // Adiciona um novo dispositivo
        devices.push({
          deviceId,
          accessCode,
          verifiedAt: Date.now()
        });
      }
      
      localStorage.setItem(VERIFIED_DEVICES_STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
    }
  };

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
    // Primeiro, verifica se o dispositivo já está verificado
    const deviceVerification = isDeviceVerified();
    
    if (deviceVerification.verified && deviceVerification.accessCode) {
      setAuthState({
        isAuthenticated: true,
        accessCode: deviceVerification.accessCode
      });
      return;
    }
    
    // Se o dispositivo não estiver verificado, verifica se existe um código salvo no localStorage
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const { accessCode } = JSON.parse(savedAuth);
        if (VALID_ACCESS_CODES.includes(accessCode)) {
          setAuthState({ isAuthenticated: true, accessCode });
          // Registra o dispositivo como verificado
          registerVerifiedDevice(accessCode);
        }
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    
    // Primeiro verifica se o dispositivo já está verificado
    const deviceVerification = isDeviceVerified();
    if (deviceVerification.verified) {
      // Define o estado de autenticação com o código do dispositivo
      const newAuthState = { isAuthenticated: true, accessCode: deviceVerification.accessCode };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
      setAuthState(newAuthState);
      return { success: true, message: 'Dispositivo já verificado. Login realizado com sucesso.' };
    }
    
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
    
    // Registra o dispositivo como verificado
    registerVerifiedDevice(normalizedCode);
    
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