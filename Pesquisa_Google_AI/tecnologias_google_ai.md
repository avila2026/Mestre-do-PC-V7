# Pesquisa: Novas Funções de IA do Google (Chrome)

Este documento resume as novas tecnologias de IA integradas ao Google Chrome e como elas podem ser aproveitadas.

## 1. Web MCP (Web Model Context Protocol)

- **O que é**: Um protocolo que permite que agentes de IA interajam com sites de forma estruturada, em vez de apenas "raspar" (scraping) o conteúdo do DOM.
- **Tipos**:
  - **Declarativo**: Baseado em HTML.
  - **Imperativo**: Baseado em JavaScript.
- **Vantagem**: Maior confiabilidade e segurança para automações no navegador.

## 2. IA Nativa (Gemini Nano no Chrome)

- **O que é**: O modelo de linguagem Gemini Nano rodando localmente dentro do navegador do usuário.
- **Benefícios**:
  - **Privacidade**: Os dados não saem da máquina do usuário.
  - **Latência**: Respostas instantâneas.
  - **Custo**: Zero custo de servidor para processamento de IA.
- **APIs Disponíveis**:
  - **Prompt API**: Para perguntas e respostas gerais.
  - **Summarizer API**: Para resumir textos longos.
  - **Writer/Rewriter API**: Para auxílio na escrita.
  - **Language Detector/Translator**: Para detecção e tradução local.

## 3. WebGPU

- **O que é**: A nova API de gráficos e computação de alta performance do Chrome (sucessora do WebGL).
- **Vantagem para IA**: Acelera drasticamente a execução de modelos de IA locais (como Transformers.js) usando o poder da GPU do usuário.

## 4. IA em Extensões e DevTools

- **DevTools**: Assistência por IA diretamente no console e debugger para explicar erros e sugerir correções de CSS/Performance.
- **Extensões**: Permite que extensões do Chrome usem o Gemini Nano para processar dados da página com total privacidade.
