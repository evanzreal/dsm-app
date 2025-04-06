'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificação de autenticação
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    // Se chegou aqui, está autenticado
    setChecking(false);
  }, [isAuthenticated]);

  // Mostra tela de carregamento enquanto verifica autenticação
  if (checking) {
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