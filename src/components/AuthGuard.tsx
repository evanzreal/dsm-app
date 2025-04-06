'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      
      setTimeout(() => {
        if (!isAuthenticated) {
          // Força o redirecionamento usando window.location
          window.location.href = '/login';
        } else {
          setIsChecking(false);
        }
      }, 300); // Pequeno delay para garantir que o estado de autenticação esteja atualizado
    };

    checkAuth();
  }, [isAuthenticated]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-r-2 border-b-2 border-gray-200 mb-4"></div>
          <p className="text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 