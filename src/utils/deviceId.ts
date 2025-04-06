// Chave para armazenar o ID do dispositivo no localStorage
export const DEVICE_ID_STORAGE_KEY = '@pluma-dsm:device-id';

/**
 * Gera um ID de dispositivo único baseado em características do navegador e outros fatores
 */
export function generateDeviceId(): string {
  const navigatorInfo = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency || '',
    screen.colorDepth,
    screen.width,
    screen.height,
    screen.availWidth,
    screen.availHeight,
    new Date().getTimezoneOffset()
  ].join('|');

  // Função simples de hash para gerar um ID
  let hash = 0;
  for (let i = 0; i < navigatorInfo.length; i++) {
    const char = navigatorInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para inteiro de 32 bits
  }

  // Adiciona um timestamp para tornar ainda mais único
  const timestamp = new Date().getTime();
  const randomFactor = Math.floor(Math.random() * 1000);
  
  // Combina tudo em um ID único
  return `${Math.abs(hash)}-${timestamp}-${randomFactor}`;
}

/**
 * Obtém o ID do dispositivo atual ou gera um novo se não existir
 */
export function getDeviceId(): string {
  // Verifica se já existe um ID armazenado
  const storedId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  
  if (storedId) {
    return storedId;
  }
  
  // Se não existir, gera um novo ID e armazena
  const newId = generateDeviceId();
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, newId);
  
  return newId;
} 