'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Respostas pré-configuradas para teste
const RESPOSTAS_PRE_CONFIGURADAS = [
  "Olá! Sou o assistente especializado em DSM. Como posso ajudar você hoje?",
  "O DSM (Manual Diagnóstico e Estatístico de Transtornos Mentais) é o principal guia diagnóstico para profissionais de saúde mental. A versão atual é o DSM-5-TR.",
  "Existem 20 capítulos principais no DSM-5-TR, cada um cobrindo diferentes categorias de transtornos mentais. Posso detalhar algum específico se você desejar.",
  "Uma das principais mudanças do DSM-5 para o DSM-5-TR foi a inclusão do diagnóstico de Luto Prolongado como um novo transtorno.",
];

let respostaAtual = 0;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simularResposta = async () => {
    // Simula um tempo de resposta natural (entre 1 e 2 segundos)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const resposta = RESPOSTAS_PRE_CONFIGURADAS[respostaAtual];
    respostaAtual = (respostaAtual + 1) % RESPOSTAS_PRE_CONFIGURADAS.length;
    
    return resposta;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const resposta = await simularResposta();
      const assistantMessage = { role: 'assistant' as const, content: resposta };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="m-0">{children}</p>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre o DSM..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 