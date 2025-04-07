'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Interfaces para representar a estrutura exata da resposta do webhook
interface AvaliacaoItem {
  sintomas_gerais?: string[];
  critérios?: string;
  entrevista_clínica?: string[];
  análise_funcional?: string[];
  [key: string]: unknown;
}

interface Avaliacao {
  [key: string]: AvaliacaoItem;
}

interface ReferenciaNormativa {
  artigo_dsm?: string;
  [key: string]: unknown;
}

interface RespostaEstruturada {
  context?: string;
  avaliação?: Avaliacao;
  referência_normativa?: ReferenciaNormativa;
  considerações_finais?: string;
  [key: string]: unknown;
}

interface WebhookResponse {
  response?: string | RespostaEstruturada;
  error?: string;
  message?: string;
  output?: string;
  data?: unknown;
}

// Tipo para representar uma resposta do webhook, que pode ser de vários formatos
type WebhookData = 
  | string 
  | Record<string, unknown>
  | Array<Record<string, unknown> | string>
  | { output?: string; response?: string | RespostaEstruturada; message?: string; error?: string; };

const WEBHOOK_URL = 'https://primary-production-c25e.up.railway.app/webhook/cf944c6e-132b-4309-9646-967e221b6d82';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 segundo

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

  // Função melhorada para processar a resposta do webhook
  const processarRespostaWebhook = (data: WebhookData): WebhookResponse => {
    console.log('Processando resposta do webhook:', JSON.stringify(data));

    // Caso 1: Array de respostas (comum em algumas APIs)
    if (Array.isArray(data)) {
      console.log('Resposta é um array, tentando extrair conteúdo');
      if (data.length > 0) {
        const primeiroItem = data[0];
        if (typeof primeiroItem === 'object' && primeiroItem !== null) {
          if ('output' in primeiroItem && typeof primeiroItem.output === 'string') 
            return { response: primeiroItem.output };
          if ('response' in primeiroItem && typeof primeiroItem.response === 'string') 
            return { response: primeiroItem.response };
          if ('message' in primeiroItem && typeof primeiroItem.message === 'string') 
            return { response: primeiroItem.message };
          if ('text' in primeiroItem && typeof primeiroItem.text === 'string')
            return { response: primeiroItem.text };
          if ('content' in primeiroItem && typeof primeiroItem.content === 'string')
            return { response: primeiroItem.content };
        }
        if (typeof primeiroItem === 'string') return { response: primeiroItem };
        console.log('Não conseguiu extrair resposta do array:', primeiroItem);
      }
    }

    // Caso 2: Detecção de erros
    if (typeof data === 'object' && data !== null) {
      if ('error' in data && typeof data.error === 'string') 
        return { error: data.error };
      
      if ('message' in data && typeof data.message === 'string' && 
          (data.message.includes('Error') || data.message.includes('erro'))) {
        return { error: data.message };
      }
    }

    // Caso 3: Formato padrão
    if (typeof data === 'object' && data !== null) {
      // Verifica se é o formato estruturado específico
      if ('response' in data && typeof data.response === 'object' && data.response !== null) {
        console.log('Detectado formato estruturado específico');
        return { response: data.response as RespostaEstruturada };
      }
      
      if ('response' in data && typeof data.response === 'string') 
        return { response: data.response };
      
      if ('output' in data && typeof data.output === 'string') 
        return { response: data.output };
      
      if ('message' in data && typeof data.message === 'string') 
        return { response: data.message };
      
      if ('text' in data && typeof data.text === 'string')
        return { response: data.text };
      
      if ('content' in data && typeof data.content === 'string')
        return { response: data.content };
      
      // Caso especial: objeto com uma única propriedade que é uma string
      const keys = Object.keys(data);
      if (keys.length === 1) {
        const key = keys[0];
        if (typeof data === 'object' && data !== null) {
          const value = (data as Record<string, unknown>)[key];
          if (typeof value === 'string') {
            return { response: value };
          }
        }
      }
    }

    // Caso 4: String direta
    if (typeof data === 'string') {
      return { response: data };
    }

    // Caso de fallback - retornar os dados brutos para debug
    console.log('Formato de resposta não reconhecido, retornando dados brutos');
    return { 
      error: 'Formato de resposta não reconhecido',
      data: data
    };
  };

  // Função para retentar requisições com um delay
  const retryWithDelay = <T,>(fn: () => Promise<T>, retries: number): Promise<T> => {
    return fn().catch(error => {
      if (retries <= 0) {
        throw error;
      }
      console.log(`Tentativa falhou, retentando em ${RETRY_DELAY}ms... Tentativas restantes: ${retries}`);
      return new Promise<void>(resolve => setTimeout(resolve, RETRY_DELAY))
        .then(() => retryWithDelay(fn, retries - 1));
    });
  };

  // Função para formatar a resposta estruturada de forma amigável
  const formatarRespostaEstruturada = (resposta: RespostaEstruturada): string => {
    let textoFormatado = '';
    
    // Adiciona o contexto se existir
    if (resposta.context) {
      textoFormatado += `**Contexto:**\n${resposta.context}\n\n`;
    }
    
    // Adiciona a avaliação se existir
    if (resposta.avaliação) {
      textoFormatado += `**Avaliação:**\n`;
      
      // Processa cada item da avaliação
      Object.entries(resposta.avaliação).forEach(([chave, item]) => {
        if (item.sintomas_gerais && item.sintomas_gerais.length > 0) {
          textoFormatado += `\n**Sintomas Gerais:**\n`;
          item.sintomas_gerais.forEach(sintoma => {
            textoFormatado += `- ${sintoma}\n`;
          });
        }
        
        if (item.critérios) {
          textoFormatado += `\n**Critérios:**\n${item.critérios}\n`;
        }
        
        if (item.entrevista_clínica && item.entrevista_clínica.length > 0) {
          textoFormatado += `\n**Entrevista Clínica:**\n`;
          item.entrevista_clínica.forEach(passo => {
            textoFormatado += `- ${passo}\n`;
          });
        }
        
        if (item.análise_funcional && item.análise_funcional.length > 0) {
          textoFormatado += `\n**Análise Funcional:**\n`;
          item.análise_funcional.forEach(análise => {
            textoFormatado += `- ${análise}\n`;
          });
        }
      });
    }
    
    // Adiciona a referência normativa se existir
    if (resposta.referência_normativa) {
      textoFormatado += `\n**Referência Normativa:**\n`;
      if (resposta.referência_normativa.artigo_dsm) {
        textoFormatado += `${resposta.referência_normativa.artigo_dsm}\n`;
      }
    }
    
    // Adiciona as considerações finais se existirem
    if (resposta.considerações_finais) {
      textoFormatado += `\n**Considerações Finais:**\n${resposta.considerações_finais}\n`;
    }
    
    return textoFormatado || JSON.stringify(resposta, null, 2);
  };

  // Função melhorada para enviar mensagens para o webhook
  const enviarParaWebhook = async (mensagem: string): Promise<WebhookResponse> => {
    console.log('Iniciando envio para webhook:', mensagem);
    setWebhookError(null);

    const executarFetch = () => fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify({
        message: mensagem,
        timestamp: new Date().toISOString(),
        source: 'dsm-app-chat'
      }),
    });

    try {
      // Tenta com retentativas
      const response = await retryWithDelay(() => executarFetch(), MAX_RETRIES);
      console.log('Resposta do webhook obtida, status:', response.status);
      console.log('Headers da resposta:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro do webhook (status não-ok):', errorText);
        
        // Tenta analisar o erro como JSON
        try {
          const errorJson = JSON.parse(errorText) as Record<string, unknown>;
          console.log('Erro analisado como JSON:', errorJson);
          
          if (typeof errorJson.message === 'string') {
            throw new Error(errorJson.message);
          }
        } catch (parseError) {
          console.log('Erro ao analisar resposta de erro como JSON:', parseError);
          // Usa o texto original se não conseguir analisar como JSON
        }
        
        throw new Error(`Erro ${response.status}: ${errorText || 'Sem detalhes'}`);
      }

      // Verifica o tipo de conteúdo da resposta
      const contentType = response.headers.get('content-type');
      console.log('Content-Type da resposta:', contentType);
      
      // Converte a resposta em texto primeiro
      const responseText = await response.text();
      console.log('Texto da resposta do webhook (primeiros 100 caracteres):', responseText.substring(0, 100));
      
      // Verifica se é texto puro (não JSON)
      const isPlainText = !responseText.trim().startsWith('{') && 
                          !responseText.trim().startsWith('[') && 
                          !responseText.trim().startsWith('"');
      
      if (isPlainText) {
        console.log('Resposta detectada como texto puro, não JSON');
        return { response: responseText.trim() };
      }
      
      // Tenta parsear como JSON
      let data: WebhookData;
      try {
        data = JSON.parse(responseText);
        console.log('Resposta parseada com sucesso como JSON:', data);
      } catch (parseError) {
        console.error('Erro ao parsear resposta como JSON:', parseError);
        
        // Mesmo que tenha falhado o parse, retorna o texto como resposta se tiver conteúdo
        if (responseText && typeof responseText === 'string' && responseText.trim()) {
          console.log('Retornando texto da resposta mesmo após falha no parse JSON');
          return { response: responseText.trim() };
        }
        
        throw new Error('Resposta do webhook não é um JSON válido e não pode ser processada como texto');
      }
      
      return processarRespostaWebhook(data);
    } catch (error) {
      console.error('Erro crítico ao comunicar com webhook:', error);
      
      const errorMessage = error instanceof Error 
        ? `Erro: ${error.message}` 
        : 'Erro desconhecido ao comunicar com o assistente';
      
      setWebhookError(errorMessage);
      
      return { 
        error: 'Falha na comunicação com o assistente. Por favor, tente novamente.',
        message: errorMessage
      };
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
      console.log('Resposta final do webhook:', webhookResponse);
      
      if (webhookResponse.error) {
        setWebhookError(webhookResponse.error);
        console.error('Erro reportado na resposta:', webhookResponse.error);
        
        // Se tiver algum conteúdo para mostrar mesmo com erro, mostra
        if (webhookResponse.response) {
          const assistantMessage = { 
            role: 'assistant' as const, 
            content: typeof webhookResponse.response === 'string' 
              ? webhookResponse.response 
              : formatarRespostaEstruturada(webhookResponse.response)
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
        return;
      }

      if (webhookResponse.response) {
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: typeof webhookResponse.response === 'string' 
            ? webhookResponse.response 
            : formatarRespostaEstruturada(webhookResponse.response)
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (webhookResponse.data) {
        // Para debug - mostra os dados brutos se não conseguir extrair uma resposta
        console.warn('Exibindo dados brutos devido a formato desconhecido');
        const rawData = typeof webhookResponse.data === 'object' 
          ? JSON.stringify(webhookResponse.data, null, 2)
          : String(webhookResponse.data);
          
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: `*Resposta em formato não processado:*\n\`\`\`json\n${rawData}\n\`\`\`` 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta vazia ou em formato desconhecido');
      }
    } catch (error) {
      console.error('Erro grave ao processar mensagem:', error);
      setWebhookError('Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" 
        id="chat-messages"
        style={{ 
          height: 'calc(100% - 72px)',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-8 text-gray-500">
            <div className="max-w-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Olá! Como posso ajudar?</h2>
              <p className="mb-6">Faça perguntas sobre o Manual Diagnóstico e Estatístico de Transtornos Mentais (DSM).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={() => setInput("Quais são os principais transtornos de ansiedade no DSM-5?")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg p-3 text-sm text-left transition-colors"
                >
                  Quais são os principais transtornos de ansiedade no DSM-5?
                </button>
                <button 
                  onClick={() => setInput("Como diferenciar depressão de transtorno bipolar?")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg p-3 text-sm text-left transition-colors"
                >
                  Como diferenciar depressão de transtorno bipolar?
                </button>
              </div>
            </div>
          </div>
        )}
        
        {webhookError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
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
              className={`rounded-lg md:rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white max-w-[80%] md:max-w-[65%]'
                  : 'bg-gray-100 text-gray-800 max-w-[85%] md:max-w-[75%]'
              }`}
            >
              <div className="prose prose-sm md:prose-base max-w-none text-[15px] md:text-base leading-relaxed">
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
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="border-t bg-white p-3 md:p-4 sticky bottom-0 left-0 right-0"
        style={{
          boxShadow: '0 -2px 10px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex space-x-2 md:space-x-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre o DSM..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 md:py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 text-white rounded-full p-2.5 md:p-3 hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center justify-center min-w-[44px] md:min-w-[48px]"
            aria-label="Enviar mensagem"
          >
            <PaperAirplaneIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </form>
    </div>
  );
} 