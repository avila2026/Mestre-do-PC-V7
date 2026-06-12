import React, { useState, useEffect } from 'react';
import { CpuChipIcon, CommandLineIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { OPENAI_DEFAULT_MODEL, OLLAMA_DEFAULT_MODEL } from '../../constants';

interface AiConfig {
  provider: 'openai' | 'ollama';
  model: string;
  reasoningEffort: 'none' | 'low' | 'medium' | 'high';
}

interface AiSettingsSelectorProps {
  pageKey: string;
  onConfigChange?: (config: AiConfig) => void;
}

const AiSettingsSelector: React.FC<AiSettingsSelectorProps> = ({ pageKey, onConfigChange }) => {
  const [provider, setProvider] = useState<'openai' | 'ollama'>('openai');
  const [model, setModel] = useState('');
  const [reasoningEffort, setReasoningEffort] = useState<'none' | 'low' | 'medium' | 'high'>('none');

  // Load from localStorage on mount
  useEffect(() => {
    // Default provider mapping depending on the page
    const defaultProvider = (pageKey === 'trends' || pageKey === 'translation') ? 'ollama' : 'openai';
    const savedProvider = localStorage.getItem(`vitrinex_provider_${pageKey}`) as 'openai' | 'ollama' || defaultProvider;
    
    const defaultModel = savedProvider === 'openai' ? OPENAI_DEFAULT_MODEL : OLLAMA_DEFAULT_MODEL;
    const savedModel = localStorage.getItem(`vitrinex_model_${pageKey}`) || defaultModel;
    
    const savedReasoning = localStorage.getItem(`vitrinex_reasoning_${pageKey}`) as any || 'none';

    setProvider(savedProvider);
    setModel(savedModel);
    setReasoningEffort(savedReasoning);

    if (onConfigChange) {
      onConfigChange({
        provider: savedProvider,
        model: savedModel,
        reasoningEffort: savedReasoning
      });
    }
  }, [pageKey]);

  // Handle configuration updates
  const updateConfig = (newProvider: 'openai' | 'ollama', newModel: string, newReasoning: 'none' | 'low' | 'medium' | 'high') => {
    localStorage.setItem(`vitrinex_provider_${pageKey}`, newProvider);
    localStorage.setItem(`vitrinex_model_${pageKey}`, newModel);
    localStorage.setItem(`vitrinex_reasoning_${pageKey}`, newReasoning);

    setProvider(newProvider);
    setModel(newModel);
    setReasoningEffort(newReasoning);

    if (onConfigChange) {
      onConfigChange({
        provider: newProvider,
        model: newModel,
        reasoningEffort: newReasoning
      });
    }
  };

  const handleProviderChange = (p: 'openai' | 'ollama') => {
    // Dynamically set default model when swapping providers
    const nextModel = p === 'openai' ? OPENAI_DEFAULT_MODEL : OLLAMA_DEFAULT_MODEL;
    // Persist and update
    updateConfig(p, nextModel, p === 'ollama' ? 'medium' : 'none');
  };

  const isThinkingModel = model.includes('o1') || model.includes('o3') || model.includes('gpt-oss');

  // Available models based on active provider
  const getAvailableModels = () => {
    if (provider === 'openai') {
      return [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido/Padrão)' },
        { value: 'gpt-4o', label: 'GPT-4o (Alta Inteligência)' },
        { value: 'o3-mini', label: 'o3-Mini (Raciocínio Avançado)' }
      ];
    } else {
      // Ollama local configuration
      const localCustomModel = localStorage.getItem('vitrinex_ollama_model') || OLLAMA_DEFAULT_MODEL;
      return [
        { value: localCustomModel, label: `${localCustomModel} (Configurado Local)` },
        { value: 'gpt-oss:120b-cloud', label: 'gpt-oss:120b-cloud (Nuvem Ollama)' },
        { value: 'gpt-oss:20b', label: 'gpt-oss:20b (Local Leve)' }
      ];
    }
  };

  return (
    <div className="bg-surface/50 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 justify-between mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
        {/* Provider Toggle */}
        <div className="flex items-center bg-black/30 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => handleProviderChange('openai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              provider === 'openai' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            OpenAI
          </button>
          <button
            onClick={() => handleProviderChange('ollama')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              provider === 'ollama' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CommandLineIcon className="w-4 h-4" />
            Ollama (Local)
          </button>
        </div>

        {/* Model Selector */}
        <div className="flex flex-col gap-1 w-full md:w-56">
          <select
            value={model}
            onChange={(e) => updateConfig(provider, e.target.value, reasoningEffort)}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-primary"
          >
            {getAvailableModels().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reasoning Level (Chain of Thought) */}
        {isThinkingModel && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
              <CpuChipIcon className="w-3.5 h-3.5" />
              Nível Raciocínio:
            </span>
            <select
              value={reasoningEffort}
              onChange={(e) => updateConfig(provider, model, e.target.value as any)}
              className="bg-black/40 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-primary"
            >
              <option value="none">Desativado (none)</option>
              <option value="low">Curto (low)</option>
              <option value="medium">Médio (medium)</option>
              <option value="high">Longo (high)</option>
            </select>
          </div>
        )}
      </div>

      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider select-none hidden lg:block">
        Módulo: {pageKey}
      </div>
    </div>
  );
};

export default AiSettingsSelector;
