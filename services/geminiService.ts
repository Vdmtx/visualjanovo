

import {
  GoogleGenAI,
  Type,
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateImageParameters,
  GenerateImageResponse,
} from '@google/genai';
import { GEMINI_API_KEY } from '../constants';
import {
  MediaAnalysis,
  SocialMediaStrategy,
  PaidTrafficStrategy,
} from '../types';

/**
 * Initializes a new GoogleGenAI instance.
 * It's crucial to create a new instance before each API call to ensure it uses the most up-to-date API key,
 * especially in environments where the key can be updated dynamically (e.g., via `window.aistudio.openSelectKey()`).
 */
const getGenerativeModel = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('API Key is not configured. Please select your API key.');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
};

export const generateText = async <T>(
  params: GenerateContentParameters,
  expectedSchema?: any,
): Promise<T> => {
  try {
    const ai = getGenerativeModel();
    const config = { ...params.config };

    if (expectedSchema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = expectedSchema;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      ...params,
      config,
    });

    const text = response.text.trim();
    if (expectedSchema) {
      // Sometimes the model wraps JSON in markdown code blocks. Attempt to parse it.
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      try {
        return JSON.parse(jsonString) as T;
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonString, jsonError);
        throw new Error('Invalid JSON response from AI.');
      }
    }
    return text as T;
  } catch (error: any) {
    console.error('Error generating text from Gemini:', error);
    if (error.message.includes("Requested entity was not found.")) {
      // This is a common error when the API key is invalid or not selected for Veo models.
      // For general text/image models, it might also indicate an issue with the key.
      console.warn("API key might be invalid or not selected. Prompting user to select key.");
      // In a real app, you'd trigger a UI flow to re-select the key here.
      // For this example, we just re-throw.
    }
    throw new Error(`Failed to generate text: ${error.message || 'Unknown error'}`);
  }
};

export const generateImage = async (
  params: GenerateImageParameters,
): Promise<string> => {
  try {
    const ai = getGenerativeModel();
    const response: GenerateImageResponse = await ai.models.generateImages(params);
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const mimeType = response.generatedImages[0].image.mimeType;
    return `data:${mimeType};base64,${base64ImageBytes}`;
  } catch (error: any) {
    console.error('Error generating image from Gemini:', error);
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
  }
};


// JSON Schemas for AI outputs
export const mediaAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    resumo: { type: Type.STRING },
    publicoAlvo: { type: Type.STRING },
    tonalidadeComunicacao: { type: Type.STRING },
    pontosFortes: { type: Type.ARRAY, items: { type: Type.STRING } },
    oportunidades: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['resumo', 'publicoAlvo', 'tonalidadeComunicacao', 'pontosFortes', 'oportunidades'],
};

export const socialMediaStrategySchema = {
  type: Type.OBJECT,
  properties: {
    objetivoPrincipal: { type: Type.STRING },
    plataformasRecomendadas: { type: Type.ARRAY, items: { type: Type.STRING } },
    tiposConteudo: { type: Type.ARRAY, items: { type: Type.STRING } },
    frequenciaPostagem: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['objetivoPrincipal', 'plataformasRecomendadas', 'tiposConteudo', 'frequenciaPostagem', 'hashtags'],
};

export const paidTrafficStrategySchema = {
  type: Type.OBJECT,
  properties: {
    plataformasAnuncios: { type: Type.ARRAY, items: { type: Type.STRING } },
    orcamentoMensal: { type: Type.STRING },
    segmentacaoIdeal: { type: Type.STRING },
    tiposAnuncios: { type: Type.ARRAY, items: { type: Type.STRING } },
    metricasImportantes: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['plataformasAnuncios', 'orcamentoMensal', 'segmentacaoIdeal', 'tiposAnuncios', 'metricasImportantes'],
};

export const colorPaletteSchema = {
  type: Type.ARRAY,
  items: { type: Type.STRING },
};

// Helper function to simulate base64 conversion (for browser file API)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};