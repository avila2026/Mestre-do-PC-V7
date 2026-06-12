import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    SparklesIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { sendMessageToChat } from '../services/ai';
import { ChatMessage } from '../types';
import AiSettingsSelector from '../components/features/AiSettingsSelector';

// Types
interface Message {
    role: 'user' | 'model';
    text: string;
    attachments?: Attachment[];
}

interface Attachment {
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
    file: File;
}

const VITRINEX_SYSTEM_INSTRUCTION = `Você é o assistente virtual da VitrineX AI, uma plataforma de marketing digital com inteligência artificial.
Seu nome é "VitrineX AI". Você é especialista em:
- Marketing digital e redes sociais
- Criação de conteúdo e copywriting
- Estratégias de campanhas e anúncios
- Tendências de mercado e análise de dados
- Ferramentas de design e automação

Responda sempre em português do Brasil, de forma clara, objetiva e profissional.
Seja proativo em sugerir ações e estratégias baseadas nas perguntas do usuário.`;

const ChatVitrineX: React.FC = () => {
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: `Olá! Sou o assistente da **VitrineX AI**. Estou pronto para ajudar com marketing digital, criação de conteúdo e estratégias. Como posso ajudar você hoje?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    // AI Config State
    const [aiConfig, setAiConfig] = useState({
        provider: 'openai' as 'openai' | 'ollama',
        model: '',
        reasoningEffort: 'none' as 'none' | 'low' | 'medium' | 'high'
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, attachments]);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newAttachments: Attachment[] = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
                url: URL.createObjectURL(file),
                name: file.name,
                file: file
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || loading) return;

        const currentAttachments = [...attachments];
        const userText = input;
        const historySnapshot = [...messages];

        let attachmentText = "";
        if (currentAttachments.length > 0) {
            attachmentText = `\n\n[Anexos: ${currentAttachments.map(a => a.name).join(', ')}]`;
        }
        const fullMessage = userText + attachmentText;

        setInput('');
        setAttachments([]);
        // Add user message + empty assistant placeholder for streaming
        setMessages(prev => [
            ...prev,
            { role: 'user', text: userText, attachments: currentAttachments },
            { role: 'model', text: '' }
        ]);
        setLoading(true);

        try {
            const history: ChatMessage[] = historySnapshot.map(m => ({
                role: m.role,
                text: m.text,
                timestamp: new Date().toISOString(),
            }));

            let botResponse = '';

            await sendMessageToChat(
                history,
                fullMessage,
                (chunk) => {
                    botResponse += chunk;
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'model', text: botResponse };
                        return updated;
                    });
                },
                {
                    systemInstruction: VITRINEX_SYSTEM_INSTRUCTION,
                    model: aiConfig.model,
                    useThinking: aiConfig.reasoningEffort !== 'none',
                    reasoningEffort: aiConfig.reasoningEffort
                }
            );

            if (!botResponse) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text: '⚠️ Sem resposta. Verifique sua chave OpenAI nas Configurações.' };
                    return updated;
                });
            }

        } catch (error: any) {
            console.error('OpenAI Error:', error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', text: '❌ Erro de comunicação com a OpenAI. Verifique sua chave de API nas Configurações.' };
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---

    return (
        <>
            <div className="max-w-7xl mx-auto w-full mb-4">
                <AiSettingsSelector pageKey="chat" onConfigChange={setAiConfig} />
            </div>
            <div className="flex flex-col h-[calc(100dvh-18rem)] min-h-[550px] w-full max-w-7xl mx-auto bg-[var(--background)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-default)] relative">

            {/* Ambient Background Gradient (Removed for Performance) */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 px-6 py-4 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Chat VitrineX</h1>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Assistente IA Online</span>
                        </div>
                    </div>
                </div>

                {/* Optional Status Badge */}
                <div className="hidden md:block px-3 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--text-secondary)]">
                    V 2.0.0
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border ${msg.role === 'user'
                            ? 'bg-[var(--background)] border-blue-500/30'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent'
                            }`}>
                            {msg.role === 'user' ? (
                                <img src={`https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`} className="w-full h-full rounded-full" alt="User" />
                            ) : (
                                <SparklesIcon className="w-5 h-5 text-white" />
                            )}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.text && (
                                <div className={`
                                    relative px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm
                                    ${msg.role === 'user'
                                        ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50'
                                        : 'bg-[var(--surface)]/90 text-[var(--text-primary)] rounded-tl-sm border border-[var(--border-default)]'
                                    }
                                `}>
                                    <div className="markdown-body font-sans">
                                        <ReactMarkdown>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Attachments within Bubble (if existing) */}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 justify-end">
                                    {msg.attachments.map(att => (
                                        <div key={att.id} className="text-[10px] px-2 py-1 bg-[var(--surface)] border border-[var(--border-default)] rounded text-[var(--text-secondary)] flex items-center gap-1">
                                            <PaperClipIcon className="w-3 h-3" /> {att.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <span className="mt-1 text-[10px] text-[var(--text-secondary)] opacity-40 px-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <SparklesIcon className="w-5 h-5 text-white animate-spin-slow" />
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border-default)] px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-[var(--surface)]/80 backdrop-blur-xl border-t border-[var(--border-default)] relative z-20">

                {/* Attachment Previews */}
                <AnimatePresence>
                    {attachments.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex gap-3 overflow-x-auto pb-3 mb-2 px-2"
                        >
                            {attachments.map(att => (
                                <motion.div
                                    key={att.id}
                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                    className="relative flex-shrink-0"
                                >
                                    <div className="w-16 h-16 rounded-xl border border-[var(--border-default)] bg-[var(--background)] flex items-center justify-center overflow-hidden">
                                        {att.type === 'image' ? (
                                            <img src={att.url} alt="p" className="w-full h-full object-cover" />
                                        ) : (
                                            <PaperClipIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                                        )}
                                    </div>
                                    <button onClick={() => removeAttachment(att.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors">
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-[var(--background-input)] border border-[var(--border-default)] p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors shrink-0"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem para o VitrineX AI..."
                        className="w-full bg-transparent border-none p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:ring-0 resize-none max-h-32 text-sm leading-relaxed"
                        rows={1}
                        style={{ minHeight: '44px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() && attachments.length === 0}
                        className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none transition-all duration-200 shrink-0"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 -rotate-90 translate-x-0.5" />
                    </button>
                </div>
            </div>
        </div>
    </>
    );
};

export default ChatVitrineX;
