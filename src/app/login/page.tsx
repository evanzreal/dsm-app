'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaLock, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { MdError } from 'react-icons/md';

export default function Login() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated } = useAuth();

  // Limpa todos os dados de autenticação
  const clearAllData = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('usedCodes');
    localStorage.removeItem('verifiedDevices');
    localStorage.removeItem('deviceId');
    sessionStorage.removeItem('redirect_prevention');
    sessionStorage.removeItem('force_login_form');
    
    // Recarrega a página para iniciar com estado limpo
    window.location.href = '/login';
  };

  // Efeito para verificar autenticação e redirecionar
  useEffect(() => {
    // Verifica se há parâmetro de reset na URL ou flag de forçar formulário
    const urlParams = new URLSearchParams(window.location.search);
    const hasReset = urlParams.get('reset') === 'true';
    const forceLoginForm = sessionStorage.getItem('force_login_form') === 'true';
    
    // Se tiver flag de reset ou force_login_form, não tentamos login automático
    if (hasReset || forceLoginForm) {
      // Limpa a flag se existir
      if (forceLoginForm) {
        sessionStorage.removeItem('force_login_form');
      }
      return;
    }
    
    // Se já estiver autenticado, redireciona para a página principal
    if (isAuthenticated) {
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return;
    }
    
    // Tenta login automático (sem código)
    const result = login('');
    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }, [isAuthenticated, login]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === 'loading') return;
    
    // Verifica se o código foi informado
    if (!code.trim()) {
      setStatus('error');
      setErrorMessage('Por favor, informe o código de acesso');
      return;
    }
    
    setStatus('loading');
    
    // Tenta fazer login com o código informado
    const result = login(code);
    
    if (result.success) {
      setStatus('success');
      // Redireciona após login bem-sucedido
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      setStatus('error');
      setErrorMessage(result.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">DSM Assistant</h1>
          <h2 className="text-xl font-semibold text-gray-700">Acesso Restrito</h2>
          <p className="text-gray-600 mt-2 text-lg">Digite o código de acesso para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FaLock className="text-gray-500 text-xl" />
            </div>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg block w-full pl-12 p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Código de acesso"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full flex justify-center items-center py-3 px-5 text-lg font-medium rounded-lg text-white ${
              status === 'success' ? 'bg-green-600' :
              status === 'loading' ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading' && <FaSpinner className="animate-spin mr-2 text-xl" />}
            {status === 'success' && <FaCheckCircle className="mr-2 text-xl" />}
            {status === 'loading' ? 'Verificando...' : 
             status === 'success' ? 'Acesso Concedido' : 'Entrar'}
          </button>
        </form>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center max-w-md mx-auto">
            <MdError className="mr-2 text-xl" />
            <span className="text-lg">{errorMessage}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg flex flex-col items-center max-w-md mx-auto">
            <div className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-xl" />
              <span className="text-lg">Login realizado com sucesso!</span>
            </div>
            <p className="text-md text-center">
              Redirecionando para a página principal...
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={clearAllData}
            className="text-md text-gray-500 hover:text-gray-700 hover:underline"
          >
            Limpar dados de acesso
          </button>
        </div>
      </div>
    </div>
  );
} 