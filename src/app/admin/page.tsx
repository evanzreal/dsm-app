'use client';

import { useState } from 'react';
import { 
  AUTH_STORAGE_KEY, 
  USED_CODES_STORAGE_KEY, 
  VERIFIED_DEVICES_STORAGE_KEY 
} from '@/config/auth';
import { DEVICE_ID_STORAGE_KEY } from '@/utils/deviceId';

export default function AdminPage() {
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'success' | 'error' | ''>('');

  const resetAllStorage = () => {
    try {
      // Remove todos os dados do localStorage relacionados à autenticação
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USED_CODES_STORAGE_KEY);
      localStorage.removeItem(VERIFIED_DEVICES_STORAGE_KEY);
      localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
      
      setMessage('Todos os dados de autenticação foram limpos com sucesso!');
      setStatus('success');
      
      // Redireciona para a página de login após 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      setMessage('Ocorreu um erro ao limpar os dados.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Administração do DSM Assistant</h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Atenção:</strong> Esta ação irá limpar todo o histórico de uso de códigos e dispositivos verificados. Todos os usuários precisarão entrar novamente com seus códigos.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetAllStorage}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Limpar todos os dados de autenticação
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded-md ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 