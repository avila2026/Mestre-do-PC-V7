# 🏗️ Decisões Técnicas — Mestre do PC V7

> Este arquivo documenta POR QUE cada decisão técnica foi tomada.
> Use-o para entender a arquitetura antes de fazer mudanças.

---

## Arquitetura Geral

### Por que HTML + PowerShell (e não um app nativo)?

- **Motivo**: Facilidade de manutenção. O HTML pode ser editado sem recompilar.
- **Benefício**: Qualquer pessoa consegue personalizar a interface.
- **Trade-off**: Depende do navegador para funcionar.

### Por que um servidor HTTP local na porta 7777?

- **Motivo**: O navegador não consegue executar comandos do sistema diretamente (segurança do browser).
- **Fluxo**: HTML → fetch() → PowerShell Listener (porta 7777) → Executa comando → Retorna resultado.
- **Alternativa descartada**: Extensão do navegador (muito complexa para o escopo).

### Por que AES para as licenças (e não hash simples)?

- **Motivo**: Precisamos descriptografar a licença para ler o nome do cliente.
- **Detalhes**: AES-128 em modo CBC com chave de 16 bytes.
- **Limitação conhecida**: A chave está no código. É uma proteção básica, não enterprise.

### Por que MCP Server separado?

- **Motivo**: O MCP (Model Context Protocol) permite que IAs como Claude executem ferramentas.
- **Benefício**: O usuário pode pedir para a IA "limpar o PC" e ela sabe qual comando usar.
- **Dependência**: Precisa do Launcher rodando na porta 7777 para funcionar.

### Por que Scheduled Task para o Launcher?

- **Motivo**: Evita que o Windows peça confirmação de Administrador (UAC) toda vez.
- **Como funciona**: O instalador cria uma tarefa agendada que roda com privilégios elevados.

### Por que Ollama (e não Gemini Nano no Chrome)?

- **Motivo**: O Gemini Nano depende de flags experimentais do Chrome e não funciona fora do navegador. O Ollama funciona em qualquer lugar.
- **Modelo escolhido**: `qwen2.5:1.5b` (~900 MB) — rápido, leve e entende português.
- **Benefício**: Funciona 100% offline e pode ser acessado tanto pelo Dashboard (HTML → fetch) quanto por agentes como Claude (MCP → Ollama).
- **Porta**: 11434 (padrão do Ollama).

### Por que o MCP Server tem a ferramenta `perguntar_ia`?

- **Motivo**: Permite que agentes externos (Claude, Cline, etc.) usem a IA local para "pensar" antes de executar comandos.
- **Fluxo**: Agente → MCP → Ollama → Resposta inteligente → Agente decide se executa.
- **Segurança**: A IA local tem um System Prompt que proíbe inventar comandos — só sugere PowerShell real.

---

## Decisões sobre Organização de Pastas

| Pasta                    | Propósito                                        | Quem usa                  |
| ------------------------ | ------------------------------------------------ | ------------------------- |
| `Administrador/`         | Ferramentas do desenvolvedor                     | Apenas você               |
| `Pesquisa_Google_AI/`    | Documentação de pesquisa                         | Apenas você               |
| `Sistema/`               | Arquivos que vão para o cliente                  | O instalador              |
| `Sistema/Mestre_Dados/`  | O "pacote" que é copiado para `C:\MestreDoPC_V7` | O instalador              |
| `Sistema/mcp-server/`    | Servidor para integração com IA                  | Desenvolvedores avançados |
| `Memoria_Aprendizagem/`  | Registro de lições e decisões                    | Você e assistentes de IA  |

---

Atualize este arquivo sempre que tomar uma decisão técnica importante.
