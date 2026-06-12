import { OpenAI } from 'openai';
import { OLLAMA_DEFAULT_MODEL, OLLAMA_DEFAULT_BASE_URL } from '../../constants';

export interface GenerateTextOllamaOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  userId?: string;
}

export interface OllamaCapabilityStatus {
  text: boolean;
  vision: boolean;
  audio: boolean;
  message: string;
}

export const getOllamaBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localUrl = window.localStorage.getItem('vitrinex_ollama_base_url');
    if (localUrl) return localUrl;
  }
  return OLLAMA_DEFAULT_BASE_URL;
};

export const getOllamaModel = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localModel = window.localStorage.getItem('vitrinex_ollama_model');
    if (localModel) return localModel;
  }
  return OLLAMA_DEFAULT_MODEL;
};

export const getOllamaClient = async (): Promise<OpenAI> => {
  return new OpenAI({
    baseURL: getOllamaBaseUrl(),
    apiKey: import.meta.env.VITE_OLLAMA_API_KEY || 'ollama', // Use provided key or dummy key
    dangerouslyAllowBrowser: true
  });
};

export const generateTextOllama = async (
  prompt: string,
  options?: GenerateTextOllamaOptions
): Promise<string> => {
  const modelToUse = options?.model || getOllamaModel();

  try {
    const client = await getOllamaClient();

    const messages = [{ role: 'user', content: prompt }];

    const params: any = {
      model: modelToUse,
      messages: messages,
      temperature: options?.temperature ?? 0.7
    };

    if (options?.maxOutputTokens) {
      params.max_tokens = options.maxOutputTokens;
    }

    const response = await client.chat.completions.create(params);

    const textOutput = response.choices?.[0]?.message?.content;
    if (!textOutput) {
      throw new Error("Resposta de texto não retornada da API local do Ollama.");
    }

    return textOutput;
  } catch (error) {
    console.error("Ollama generation failed:", error);
    throw error;
  }
};


export const testOllamaConnection = async (): Promise<string> => {
  try {
    const client = await getOllamaClient();

    const response = await client.chat.completions.create({
      model: getOllamaModel(),
      messages: [{ role: 'user', content: "Diga 'Conexão com Ollama estabelecida com sucesso.' em português." }]
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error("Resposta vazia do Ollama.");

    return text;
  } catch (error) {
    const err = error as Error;
    const errorMessage = err.message || err.toString();
    console.error("Erro detalhado Ollama:", errorMessage);
    throw new Error(`Falha na conexão Ollama: ${errorMessage}`);
  }
};

export const verifyOllamaSystemCapabilities = async (): Promise<OllamaCapabilityStatus> => {
  try {
    await testOllamaConnection();
    return {
      text: true,
      vision: false, // Ollama generic models usually don't have vision unless configured
      audio: false,
      message: 'Sistema Ollama Totalmente Operacional (Local)'
    };
  } catch (error) {
    const err = error as Error;
    return {
      text: false,
      vision: false,
      audio: false,
      message: err.message || 'Falha geral na validação Ollama'
    };
  }
};
