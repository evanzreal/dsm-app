'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_STORAGE_KEY, USED_CODES_STORAGE_KEY, VERIFIED_DEVICES_STORAGE_KEY } from '@/config/auth';
import { DEVICE_ID_STORAGE_KEY } from '@/utils/deviceId';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const { login, isAuthenticated } = useAuth();

  // Função para limpar os dados de autenticação localmente
  const clearAuthData = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('Dados de autenticação limpos.');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  // Função para redirecionar para a página principal
  const redirectToHome = () => {
    // Limpa qualquer erro antes de redirecionar
    setError('');
    // Força o redirecionamento usando window.location em vez de router.push
    window.location.href = '/';
  };

  useEffect(() => {
    // Verifica automaticamente se o dispositivo já está verificado
    const checkDevice = async () => {
      setIsVerifying(true);
      try {
        // Primeiro, verifica se já está autenticado pelo estado do hook
        if (isAuthenticated) {
          redirectToHome();
          return;
        }

        // Tenta fazer login sem código (verificação de dispositivo)
        const result = login('');
        if (result.success) {
          redirectToHome();
        }
      } catch (error) {
        console.error('Erro ao verificar dispositivo:', error);
        // Em caso de erro, limpa os dados para evitar estados inconsistentes
        clearAuthData();
      } finally {
        setIsVerifying(false);
      }
    };

    checkDevice();
  }, [login, isAuthenticated]);

  // Limpa os problemas de CORS e outros erros
  const resetApplication = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USED_CODES_STORAGE_KEY);
      localStorage.removeItem(VERIFIED_DEVICES_STORAGE_KEY);
      localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
      
      setError('Dados resetados. Tente novamente com seu código.');
      
      // Recarrega a página após limpar os dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao resetar aplicação:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!code.trim()) {
      setError('Por favor, insira um código de acesso');
      setIsLoading(false);
      return;
    }

    try {
      const result = login(code);
      
      if (result.success) {
        // Adiciona um pequeno delay antes do redirecionamento
        setTimeout(() => {
          redirectToHome();
        }, 500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Ocorreu um erro ao processar o login. Tente novamente.');
      // Em caso de erro, limpa os dados para evitar estados inconsistentes
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-r-2 border-b-2 border-gray-200 mb-4"></div>
          <p className="text-gray-700">Verificando dispositivo...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">DSM Assistant</h1>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu código de acesso para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="access-code" className="sr-only">
                Código de Acesso
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu código de acesso"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
            
            <button
              type="button"
              onClick={resetApplication}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Problemas para acessar? Clique aqui para redefinir
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 