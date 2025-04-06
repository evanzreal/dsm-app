'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WebhookResponse {
  response?: string;
  error?: string;
  message?: string;
  output?: string;
}

const WEBHOOK_URL = 'https://primary-production-c25e.up.railway.app/webhook/cf944c6e-132b-4309-9646-967e221b6d82';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processarRespostaWebhook = (data: WebhookResponse): WebhookResponse => {
    if (Array.isArray(data) && data[0]?.output) {
      return { response: data[0].output };
    }
    
    if (data.message && data.message.includes('Error')) {
      return { error: 'Houve um erro no processamento da sua mensagem. Por favor, tente novamente.' };
    }

    if (data.response) {
      return data;
    }

    if (data.output) {
      return { response: data.output };
    }

    return { error: 'Formato de resposta não reconhecido' };
  };

  const enviarParaWebhook = async (mensagem: string): Promise<WebhookResponse> => {
    try {
      console.log('Enviando para webhook:', mensagem);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: mensagem,
          timestamp: new Date().toISOString(),
          source: 'dsm-app-chat'
        }),
      });

      console.log('Resposta do webhook:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro do webhook:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            throw new Error(errorJson.message);
          }
        } catch (_) {
          // Se não conseguir parsear o JSON, usa o texto original
        }
        
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados do webhook:', data);
      
      return processarRespostaWebhook(data);
    } catch (error) {
      console.error('Erro detalhado ao enviar para webhook:', error);
      setWebhookError(error instanceof Error ? error.message : 'Erro ao enviar mensagem');
      return { error: 'Falha na comunicação com o assistente. Por favor, tente novamente.' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setWebhookError(null);

    try {
      const webhookResponse = await enviarParaWebhook(userMessage.content);
      
      if (webhookResponse.error) {
        setWebhookError(webhookResponse.error);
        return;
      }

      if (webhookResponse.response) {
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: webhookResponse.response 
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setWebhookError('Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {webhookError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{webhookError}</span>
          </div>
        )}
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