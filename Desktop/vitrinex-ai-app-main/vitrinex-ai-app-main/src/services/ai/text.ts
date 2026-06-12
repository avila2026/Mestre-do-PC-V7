import {
    OPENAI_DEFAULT_MODEL,
    OLLAMA_DEFAULT_MODEL,
} from '../../constants';
import {
    ChatMessage,
    Trend,
    Campaign
} from '../../types';
import { getOpenAIClient } from './openai';
import { getOllamaClient } from './ollama';


export interface GenerateTextOptions {
    model?: string;
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
    thinkingBudget?: number;
    useThinking?: boolean;
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    seed?: number;
    tools?: any[];
    toolConfig?: Record<string, unknown>;
    userId?: string;
    useOpenAI?: boolean;
    useOllama?: boolean;
    reasoningEffort?: 'none' | 'low' | 'medium' | 'high';
}

// Reasoning models (gpt-oss, nemotron, etc.) consume tokens on an internal
// `reasoning` field before producing `content`. A low max_tokens makes them
// burn the whole budget thinking and return empty content, so we enforce a floor.
const isReasoningModel = (model: string): boolean =>
    /gpt-oss|nemotron|reasoning|o1|o3|deepseek-r/i.test(model);

const REASONING_MIN_TOKENS = 2048;

const buildTextRequest = (
    prompt: string,
    modelToUse: string,
    options?: GenerateTextOptions
): any => {
    const messages: any[] = [];
    if (options?.systemInstruction) {
        messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    let maxTokens = options?.maxOutputTokens;
    if (isReasoningModel(modelToUse) && (!maxTokens || maxTokens < REASONING_MIN_TOKENS)) {
        maxTokens = REASONING_MIN_TOKENS;
    }

    const req: any = {
        model: modelToUse,
        messages,
        temperature: options?.temperature ?? 1.0,
        top_p: options?.topP,
        max_tokens: maxTokens,
        stop: options?.stopSequences,
        seed: options?.seed,
    };

    const isThinkingModel = modelToUse.includes('o1') || modelToUse.includes('o3') || modelToUse.includes('gpt-oss');
    if (isThinkingModel && options?.reasoningEffort && options.reasoningEffort !== 'none') {
        req.reasoning_effort = options.reasoningEffort;
    }

    if (options?.responseMimeType === 'application/json' || options?.responseSchema) {
        req.response_format = { type: 'json_object' };
    }

    if (options?.tools && options.tools.length > 0) {
        const compatibleTools = options.tools.filter(
            (t: any) => !t.googleSearch && !t.codeExecution
        );
        if (compatibleTools.length > 0) {
            req.tools = compatibleTools;
        }
    }

    return { req, messages };
};

const runChatLoop = async (client: any, req: any, messages: any[], options?: GenerateTextOptions): Promise<string> => {
    let response = await client.chat.completions.create(req);
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (response.choices[0].message.tool_calls?.length > 0 && iterations < MAX_ITERATIONS) {
        iterations++;
        const message = response.choices[0].message;
        messages.push(message);

        for (const toolCall of message.tool_calls) {
            let toolResult: unknown;
            try {
                const { executeTool } = await import('./tools');
                const args = JSON.parse((toolCall as any).function.arguments || '{}');
                toolResult = await executeTool((toolCall as any).function.name, args, { userId: options?.userId });
            } catch (toolError) {
                toolResult = { error: `Erro na ferramenta: ${(toolError as Error).message}` };
            }
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
            });
        }

        req.messages = messages;
        response = await client.chat.completions.create(req);
    }

    const finalMessage = response.choices[0].message;
    // Reasoning models may leave `content` empty and expose the answer via
    // a non-standard `reasoning` field — fall back to it so we never return "".
    return finalMessage.content || (finalMessage as any).reasoning || '';
};

export const generateText = async (prompt: string, options?: GenerateTextOptions): Promise<string> => {
    // Default to OpenAI unless Ollama is explicitly requested
    const forceOllama = options?.useOllama === true;

    if (forceOllama) {
        // Use Ollama directly (local, private)
        const client = await getOllamaClient();
        const model = (options?.model && !options.model.includes('gemini')) ? options.model : OLLAMA_DEFAULT_MODEL;
        const { req, messages } = buildTextRequest(prompt, model, options);
        try {
            return await runChatLoop(client, req, messages, options);
        } catch (error) {
            console.error('Ollama generation failed:', error);
            throw error;
        }
    }

    // Try OpenAI first, fallback to Ollama gpt-oss:120b-cloud if it fails
    try {
        const client = await getOpenAIClient(undefined, options?.userId);
        const model = (options?.model && !options.model.includes('gemini')) ? options.model : OPENAI_DEFAULT_MODEL;
        const { req, messages } = buildTextRequest(prompt, model, options);
        return await runChatLoop(client, req, messages, options);
    } catch (openAIError: any) {
        const isQuotaOrNetwork =
            openAIError?.status === 429 ||
            openAIError?.status === 503 ||
            openAIError?.code === 'ECONNREFUSED' ||
            openAIError?.message?.includes('quota') ||
            openAIError?.message?.includes('network');

        if (isQuotaOrNetwork) {
            console.warn('[VitrineX] OpenAI indisponível, usando fallback Ollama gpt-oss:120b-cloud...');
            try {
                const ollamaClient = await getOllamaClient();
                const { req: ollamaReq, messages: ollamaMessages } = buildTextRequest(prompt, OLLAMA_DEFAULT_MODEL, {
                    ...options,
                    // Ollama doesn't support response_format in all models
                    responseMimeType: undefined,
                });
                return await runChatLoop(ollamaClient, ollamaReq, ollamaMessages, options);
            } catch (ollamaError) {
                console.error('Ollama fallback também falhou:', ollamaError);
            }
        }

        console.error('OpenAI generation failed:', openAIError);
        throw openAIError;
    }
};

export const translateText = async (text: string, targetLanguage: string, sourceLanguage: string): Promise<string> => {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n"${text}"`;
    try {
        const translatedText = await generateText(prompt, {
            useOllama: true,
            temperature: 0.3,
            maxOutputTokens: 1024,
        });
        return translatedText.trim();
    } catch (error) {
        console.error("Translation failed:", error);
        return text;
    }
};

export const countTokens = async (text: string, modelId: string = OPENAI_DEFAULT_MODEL, userId?: string): Promise<number> => {
    // Aproximação grosseira para tokens sem depender de biblioteca externa como tiktoken
    return Math.ceil(text.length / 4);
};

export const sendMessageToChat = async (
    history: ChatMessage[],
    message: string | { text: string }[],
    onChunk: (text: string) => void,
    options: {
        model?: string;
        systemInstruction?: string;
        useKnowledgeBase?: boolean;
        useThinking?: boolean;
        userId?: string;
        tools?: any[];
        reasoningEffort?: 'none' | 'low' | 'medium' | 'high';
    },
    signal?: AbortSignal
): Promise<string> => {
    const isGptModel = options.model?.startsWith('gpt-') || options.model?.startsWith('o1') || options.model?.startsWith('o3');
    const hasTools = options.tools && options.tools.length > 0;
    const routeToOpenAI = options.model ? isGptModel : true; // Default chat to OpenAI unless Ollama model is explicitly requested

    try {
        const client = routeToOpenAI 
            ? await getOpenAIClient(undefined, options.userId)
            : await getOllamaClient();

        let modelToUse = options.model;
        if (!modelToUse || modelToUse.includes('gemini')) {
            modelToUse = routeToOpenAI ? OPENAI_DEFAULT_MODEL : OLLAMA_DEFAULT_MODEL;
        }

        const chatHistory: any[] = [];
        if (options.systemInstruction) {
             chatHistory.push({ role: 'system', content: options.systemInstruction });
        }
        
        history.forEach(m => {
            chatHistory.push({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.text || ''
            });
        });

        const promptText = typeof message === 'string' ? message : message.map(p => typeof p === 'string' ? p : p.text).join(' ');

        chatHistory.push({ role: 'user', content: promptText });

        const requestOptions: any = {
            model: modelToUse,
            messages: chatHistory,
            temperature: 1.0,
            stream: true,
        };

        const isThinkingModel = modelToUse.includes('o1') || modelToUse.includes('o3') || modelToUse.includes('gpt-oss');
        if (isThinkingModel && options?.reasoningEffort && options.reasoningEffort !== 'none') {
            requestOptions.reasoning_effort = options.reasoningEffort;
        }
        
        if (options.tools && options.tools.length > 0) {
            requestOptions.tools = options.tools;
        }

        const stream = await client.chat.completions.create(requestOptions) as any;

        let fullText = '';
        for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content || '';
            if (chunkText) {
                fullText += chunkText;
                onChunk(chunkText);
            }
        }

        return fullText;

    } catch (error) {
        console.error("Chat request failed", error);
        throw error;
    }
};

export const aiManagerStrategy = async (prompt: string, userId: string): Promise<{ strategyText: string; suggestions: string[] }> => {
    const { vitrinexTools } = await import('./tools');
    const response = await generateText(`${prompt}\n\nApós o detalhamento, adicione uma seção "SUGESTÕES_AÇÃO" no final, em formato JSON: {"suggestions": ["...", "..."]}`, {
        systemInstruction: `You are a marketing expert for VitrineX AI. Your goal is to maximize the ROI.`,
        tools: vitrinexTools,
        userId: userId,
        useOpenAI: true
    });

    try {
        const jsonMatch = response.match(/\{"suggestions":\s*\[.*\]\}/s);
        if (jsonMatch) {
            const { suggestions } = JSON.parse(jsonMatch[0]);
            return { strategyText: response.replace(jsonMatch[0], '').trim(), suggestions };
        }
    } catch (e) {
        console.warn("Falha ao extrair sugestões da estratégia", e);
    }

    return { strategyText: response, suggestions: ["Otimizar SEO", "Campanha de Retargeting"] };
};

export const searchTrends = async (query: string, language: string = 'en-US', userId: string = 'anonymous'): Promise<Trend[]> => {
    const prompt = language === 'pt-BR'
        ? `Encontre as tendências de marketing atuais para "${query}". Forneça um resumo detalhado em português.`
        : `Find current marketing trends for "${query}". Provide a detailed summary.`;

    try {
        const result = await generateText(prompt, {
            useOllama: true,
        });

        return [{
            id: `trend-${Date.now()}`,
            query,
            score: 85,
            data: result || 'Sem dados.',
            sources: [],
            createdAt: new Date().toISOString(),
            userId: userId
        }];
    } catch (error) {
        console.error("searchTrends failed", error);
        return [];
    }
};

export const campaignBuilder = async (campaignPrompt: string, userId: string = 'anonymous', options?: GenerateTextOptions): Promise<{ campaign: Campaign }> => {
    const planPrompt = `Atue como um CMO (Diretor de Marketing) de classe mundial especialista em Growth Hacking e Copywriting.
    
    OBJETIVO: Criar uma campanha de marketing de ALTO IMPACTO e CONVERSÃO para: "${campaignPrompt}".
    
    A campanha deve fugir do óbvio. Não use conselhos genéricos. Entregue uma estratégia validada.
    
    Retorne ESTRITAMENTE um JSON com esta estrutura:
    {
      "name": "Nome Magnético da Campanha",
      "description": "O Conceito Central (Big Idea) e a tese de por que isso vai vender/engajar.",
      "timeline": "Cronograma tático (ex: 3 dias de Aquecimento + 4 dias de Lançamento + Remarketing)",
      "hashtags": ["tags_de_nicho", "tags_virais"],
      "strategy": "Análise Estratégica: Defina o Funil de Vendas, o Tom de Voz (Brand Persona) e os Gatilhos Mentais que serão ativados.",
      "posts": [
        { "content_text": "Roteiro detalhado para REELS/TIKTOK (comece com um gancho visual, desenvolva a história, e termine com CTA clara).", "date": "Fase 1 - Dia 1" },
        { "content_text": "Legenda para CARROSSEL educacional que quebra objeções do cliente...", "date": "Fase 2 - Dia 3" },
        { "content_text": "Tweet/Threads provocativo para gerar polêmica/discussão...", "date": "Fase 2 - Dia 3" }
      ],
      "ads": [
        { "platform": "Instagram Stories", "headline": "Texto Sobreposto no Vídeo (Gancho)", "copy": "Script falado para o Story (foco em urgência/escassez)..." },
        { "platform": "Meta Ads (Feed)", "headline": "Título da oferta (Headline)", "copy": "Legenda do anúncio usando framework PAS (Problema-Agitação-Solução)..." }
      ]
    }
    
    IMPORTANTE:
    1. Seja ESPECÍFICO no conteúdo. Diga exatamente o que falar/fazer.
    2. Use psicologia do consumidor (Gatilhos mentais).
    3. Retorne APENAS o JSON puro.`;

    const planJsonStr = await generateText(planPrompt, {
        useOpenAI: true,
        responseMimeType: 'application/json',
        temperature: 0.7,
        ...options
    });

    let plan;
    try {
        const cleanedJson = planJsonStr.replace(/```json\n?|\n?```/g, '').trim();
        plan = JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Erro ao fazer parse da campanha:", e);
        plan = {
            name: "Erro na Geração",
            description: "Não foi possível gerar a estratégia detalhada. Tente novamente com mais detalhes.",
            timeline: "Revisar",
            strategy: "Erro técnico na IA.",
            hashtags: [],
            posts: [],
            ads: []
        };
    }

    return {
        campaign: {
            id: `c-${Date.now()}`,
            name: plan.name || "Campanha Estratégica",
            type: 'general',
            description: plan.description || "Descrição indisponível",
            strategy: plan.strategy || "Estratégia indisponível",
            hashtags: Array.isArray(plan.hashtags) ? plan.hashtags : (typeof plan.hashtags === 'string' ? plan.hashtags.split(/[\s,]+/).filter(h => h) : []),
            posts: (plan.posts || []).map((p: any, i: number) => ({
                ...p,
                id: `post-${Date.now()}-${i}`,
                userId: userId,
                createdAt: new Date().toISOString()
            })),
            ads: (plan.ads || []).map((a: any, i: number) => ({
                ...a,
                id: `ad-${Date.now()}-${i}`,
                userId: userId,
                createdAt: new Date().toISOString()
            })),
            timeline: plan.timeline || '',
            createdAt: new Date().toISOString(),
            userId: userId
        }
    };
};
