export interface LogoGenerationRequest {
  name: string;
  style: string;
  colorScheme: string;
}

export interface LogoProcessorOptions {
  removeBackground: boolean;
  size: 512 | 48 | 24; // 512 is original/preview
  format: 'png' | 'svg';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  originalBase64: string; // The raw output from AI
  processedBase64: string; // The version displayed (potentially transparent)
}