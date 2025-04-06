// Lista de códigos de acesso válidos
export const VALID_ACCESS_CODES = [
  // Grupo 1 - PLUMA2024
  'PLUMA2024A1',
  'PLUMA2024B2',
  'PLUMA2024C3',
  'PLUMA2024D4',
  'PLUMA2024E5',
  
  // Grupo 2 - DSM2024
  'DSM2024F6',
  'DSM2024G7',
  'DSM2024H8',
  'DSM2024I9',
  'DSM2024J10',
  
  // Grupo 3 - PLUMAX
  'PLUMAX125',
  'PLUMAX237',
  'PLUMAX346',
  'PLUMAX458',
  'PLUMAX569',
  
  // Grupo 4 - DSMAPP
  'DSMAPP781',
  'DSMAPP892',
  'DSMAPP903',
  'DSMAPP714',
  'DSMAPP625',
  
  // Grupo 5 - PSICODSM
  'PSICODSMV1',
  'PSICODSMV2',
  'PSICODSMV3',
  'PSICODSMV4',
  'PSICODSMV5',
  
  // Grupo 6 - TERAPIADSM
  'TERAPIADSM1',
  'TERAPIADSM2',
  'TERAPIADSM3',
  'TERAPIADSM4',
  'TERAPIADSM5'
];

// Chave para armazenamento no localStorage
export const AUTH_STORAGE_KEY = '@pluma-dsm:auth';

// Chave para armazenamento dos códigos já utilizados
export const USED_CODES_STORAGE_KEY = '@pluma-dsm:used-codes';

// Chave para armazenamento do mapeamento de dispositivos verificados
export const VERIFIED_DEVICES_STORAGE_KEY = '@pluma-dsm:verified-devices';

// Interface para os dados de um dispositivo verificado
export interface VerifiedDevice {
  deviceId: string;
  accessCode: string;
  verifiedAt: number; // timestamp
} 