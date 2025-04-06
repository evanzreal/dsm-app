'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';

// Chave para evitar loops de redirecionamento
const REDIRECT_PREVENTION_KEY = 'redirect_prevention';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isValidating } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Se ainda está validando, não faz nada
    if (isValidating) {
      return;
    }
    
    // Prevenção de loops de redirecionamento
    const preventRedirectLoop = () => {
      // Verifica se estamos em um loop
      const redirectCount = parseInt(sessionStorage.getItem(REDIRECT_PREVENTION_KEY) || '0');
      
      // Se já redirecionamos mais de 3 vezes em um curto período, paramos
      if (redirectCount > 3) {
        console.error('Detectado possível loop de redirecionamento. Interrompendo.');
        sessionStorage.removeItem(REDIRECT_PREVENTION_KEY);
        // Limpa os dados de autenticação que podem estar causando o problema
        localStorage.removeItem('auth');
        localStorage.removeItem('verifiedDevices');
        sessionStorage.setItem('force_login_form', 'true');
        
        // Redireciona para login com um parâmetro para evitar verificação automática
        window.location.href = '/login?reset=true';
        return true;
      }
      
      return false;
    };

    // Verificação de autenticação
    if (!isAuthenticated) {
      // Verifica se estamos em um loop antes de redirecionar
      if (preventRedirectLoop()) {
        return;
      }
      
      // Incrementa o contador de redirecionamentos
      const redirectCount = parseInt(sessionStorage.getItem(REDIRECT_PREVENTION_KEY) || '0');
      sessionStorage.setItem(REDIRECT_PREVENTION_KEY, (redirectCount + 1).toString());
      
      // Redireciona para a página de login
      window.location.href = '/login';
      return;
    }
    
    // Se chegou aqui, está autenticado - reseta o contador
    sessionStorage.removeItem(REDIRECT_PREVENTION_KEY);
    setChecking(false);
  }, [isAuthenticated, isValidating]);

  // Mostra tela de carregamento enquanto verifica autenticação
  if (checking || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-700">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
} 