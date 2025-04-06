'use client';

import Chat from '@/components/Chat';
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100">
        {/* Header com barra superior responsiva */}
        <header className="fixed top-0 left-0 right-0 bg-purple-700 text-white p-4 z-10 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">DSM Assistant</h1>
            <p className="text-sm md:text-base hidden sm:block">Seu assistente especializado em DSM</p>
          </div>
        </header>

        {/* Container principal responsivo */}
        <div className="pt-20 pb-4 px-4 md:px-0 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex md:flex-row h-[calc(100vh-6rem)]">
            {/* Área lateral (visível apenas em desktop) */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5 bg-gray-50 p-6 border-r border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Bem-vindo ao DSM Assistant</h2>
              <p className="text-gray-600 mb-6">
                Converse com o assistente especializado para tirar suas dúvidas sobre o Manual Diagnóstico e Estatístico de Transtornos Mentais.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-medium text-purple-700 mb-2">Dicas:</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Faça perguntas específicas sobre diagnósticos</li>
                  <li>• Peça exemplos de critérios diagnósticos</li>
                  <li>• Pergunte sobre diferenças entre transtornos</li>
                </ul>
              </div>
            </div>

            {/* Área do chat (responsiva) */}
            <div className="md:w-3/4 lg:w-4/5 h-full">
              <Chat />
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
