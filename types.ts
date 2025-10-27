// Shared types for the application

export enum ProjectStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface BrandingProject {
  id: string;
  name: string;
  niche: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  // AI generated content
  mediaAnalysis?: MediaAnalysis;
  socialMediaStrategy?: SocialMediaStrategy;
  paidTrafficStrategy?: PaidTrafficStrategy;
  colorPalette?: string[]; // array of hex strings
  slogan?: string;
  logos?: Logo[];
  banners?: Banner[];
  references?: Reference[];
}

export interface MediaAnalysis {
  resumo: string; // 2-3 frases
  publicoAlvo: string;
  tonalidadeComunicacao: string;
  pontosFortes: string[]; // 3-5 pontos fortes
  oportunidades: string[]; // 3-5 oportunidades de mercado
}

export interface SocialMediaStrategy {
  objetivoPrincipal: string;
  plataformasRecomendadas: string[]; // 3-5 plataformas
  tiposConteudo: string[]; // 5-7 tipos de conteúdo
  frequenciaPostagem: string;
  hashtags: string[]; // 8-12 hashtags
}

export interface PaidTrafficStrategy {
  plataformasAnuncios: string[]; // 3-4 plataformas
  orcamentoMensal: string;
  segmentacaoIdeal: string;
  tiposAnuncios: string[]; // 4-6 tipos
  metricasImportantes: string[]; // 5-7 métricas
}

export interface Logo {
  id: string;
  projectId: string;
  variacao: number; // 1-4
  url: string;
  fileKey: string;
  prompt: string;
  positivePrompt?: string; // For continuous generation
  negativePrompt?: string; // For continuous generation
}

export enum BannerFormat {
  SQUARE = '1:1',
  VERTICAL_STORY = '9:16',
  VERTICAL_FEED = '4:5',
}

export interface Banner {
  id: string;
  projectId: string;
  formato: BannerFormat;
  url: string;
  fileKey: string;
  prompt: string;
  positivePrompt?: string; // For continuous generation
  negativePrompt?: string; // For continuous generation
}

export interface Reference {
  id: string;
  projectId: string;
  url: string;
  fileKey: string;
  filename: string;
  mimeType: string;
  created_at: string;
  base64Data?: string; // For frontend preview and Gemini input
}

// Gemini API related types (simplified for this app)
export interface InlineData {
  mimeType: string;
  data: string;
}

export interface Part {
  text?: string;
  inlineData?: InlineData;
}

export interface Content {
  parts: Part[];
}

export interface GenerateContentParameters {
  model: string;
  contents: Content | string;
  config?: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
    tools?: any[];
  };
}

export interface GenerateContentResponse {
  text: string;
  candidates?: Array<{
    content?: {
      parts: Part[];
    };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          uri: string;
          title: string;
        };
        maps?: {
          uri: string;
          title: string;
          placeAnswerSources?: Array<{
            reviewSnippets?: {
              uri: string;
            };
          }>;
        };
      }>;
    };
  }>;
}

export interface GenerateImageParameters {
  model: string;
  prompt: string;
  config?: {
    numberOfImages?: number;
    outputMimeType?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  };
}

export interface GeneratedImage {
  image: {
    imageBytes: string;
    mimeType: string;
  };
}

export interface GenerateImageResponse {
  generatedImages: GeneratedImage[];
}

export interface ContinuousGenerationPrompts {
  positive: string;
  negative: string;
}
