// Chave para armazenar o ID do dispositivo no localStorage
export const DEVICE_ID_STORAGE_KEY = '@pluma-dsm:device-id';

/**
 * Gera um ID de dispositivo único baseado em características do navegador e outros fatores
 */
export function generateDeviceId(): string {
  console.log('Gerando novo ID de dispositivo');
  
  try {
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
    const deviceId = `${Math.abs(hash)}-${timestamp}-${randomFactor}`;
    console.log('ID de dispositivo gerado:', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('Erro ao gerar ID de dispositivo:', error);
    // Fallback seguro em caso de erro
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * Obtém o ID do dispositivo atual ou gera um novo se não existir
 */
export function getDeviceId(): string {
  // Verifica se já existe um ID armazenado
  try {
    const storedId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    
    if (storedId) {
      console.log('ID de dispositivo existente encontrado:', storedId);
      return storedId;
    }
    
    // Se não existir, gera um novo ID e armazena
    console.log('Nenhum ID de dispositivo encontrado, gerando novo...');
    const newId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, newId);
    
    return newId;
  } catch (error) {
    console.error('Erro ao obter/gerar ID de dispositivo:', error);
    // Em caso de erro, retorna um ID temporário
    return `temp-${Date.now()}`;
  }
} 