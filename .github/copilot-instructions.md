# Copilot Instructions — Mestre do PC V7

## Project Overview

O **Mestre do PC V7** é uma suíte de otimização e manutenção para Windows, com arquitetura híbrida:

- **Dashboard** em HTML/CSS/JS puro (`MestreDoPC-Ultimate-v7.html`) — interface dark-themed responsiva.
- **Launcher** em PowerShell (`MestreDoPC-Launcher.ps1`) — servidor HTTP `System.Net.HttpListener` na porta **7777**, executa comandos com privilégios de Administrador.
- **MCP Server** em Node.js (`Sistema/mcp-server/index.js`) — expõe ferramentas de manutenção via Model Context Protocol (stdio transport).
- **IA Local** via Ollama (`qwen2.5:1.5b`) — chat integrado no dashboard + análise inteligente de logs.
- **Build C#** (`Administrador/*.cs`) — instalador, desinstalador e launcher Windows Forms.

---

## Build, Dev, and Run Commands

### Backend / Launcher (PowerShell)

| Command | Purpose |
|---------|---------|
| `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\MestreDoPC-Launcher.ps1` | Inicia o servidor HTTP admin na porta 7777 |
| `powershell -Command "Start-Process pwsh -Verb RunAs -ArgumentList '-File .\MestreDoPC-Launcher.ps1'"` | Eleva e executa o launcher |

O launcher auto-eleva se não estiver rodando como Administrador (`Start-Process -Verb RunAs`).

### Frontend

O frontend é um arquivo HTML estático. Basta abrir no navegador:

| Command | Purpose |
|---------|---------|
| `start MestreDoPC-Ultimate-v7.html` | Abre o dashboard no navegador padrão |
| `.\Sistema\start-mestre.bat` | Bootstrap completo: verifica/cria tarefa agendada, inicia launcher, abre HTML |

### MCP Server (Node.js)

| Command | Purpose |
|---------|---------|
| `cd Sistema/mcp-server && npm install` | Instala dependências (`@modelcontextprotocol/sdk`, `dotenv`) |
| `cd Sistema/mcp-server && node index.js` | Inicia o MCP Server (stdio transport) |

Config via `Sistema/mcp-server/.env`:
- `MESTRE_LAUNCHER_URL=http://localhost:7777`
- `MESTRE_OLLAMA_URL=http://localhost:11434`
- `MESTRE_OLLAMA_MODEL=qwen2.5:1.5b`
- `MESTRE_PROJETO_PATH=C:\\MestreDoPC_V7`

### Build C# (Instalador / Launcher)

| Command | Purpose |
|---------|---------|
| `cd Administrador && .\Build-MestreDoPC.ps1` | Compila `install.cs`, `uninstall.cs`, `AbrirMestreDoPC.cs` |
| `cd Administrador && .\Build-MestreDoPC.ps1 -Clean` | Limpa binários antes de recompilar |

Requisitos: `csc.exe` (Windows SDK / .NET Framework 4.x). Saída: `Sistema/install.exe`, `Sistema/Mestre_Dados/{uninstall.exe,Abrir-MestreDoPC.exe}`.

---

## High-Level Architecture

```
[MestreDoPC-Ultimate-v7.html]  (Dashboard — JS fetch)
         │
         ├── POST /run  ─────────► [MestreDoPC-Launcher.ps1 :7777]
         │                              │
         ├── GET  /run-status  ◄────────┤ (Jobs async PowerShell)
         │                              │
         ├── GET  /ping      ◄────────┤
         │                              ▼
         ├── GET  /mcp-status           [Comandos PowerShell Admin]
         │                              (limpeza, rede, processos, etc.)
         ├── GET  /ollama-status
         │
         └── (fetch /api/chat) ─────► [Ollama localhost:11434]
                                         ▲
[Claude Desktop / MCP Client] ── stdio ─┘
         │
         └── [Sistema/mcp-server/index.js] ──► Proxy via HTTP para Launcher :7777
```

### Key Data Flows

1. **Execução de Comando**: Dashboard POST `{"cmd":"..."}` para `/run` → Launcher cria um `Start-Job` assíncrono → retorna `jobId` imediatamente. Dashboard polla `/run-status?id=<jobId>` até `state` ser `completed`/`failed`/`timed_out`.
2. **MCP → Launcher**: MCP Server (`index.js`) recebe tool call via stdio → POST para `/run` → polling em `/run-status` → retorna resultado ao cliente MCP (Claude Desktop, etc.).
3. **IA Local**: Chat no dashboard chama `POST /api/chat` direto no Ollama. MCP Server também usa Ollama para `perguntar_ia` e `analisar_logs_sistema`.
4. **Bootstrap Windows**: `start-mestre.bat` usa `schtasks` para criar/executar tarefa agendada `MestreDoPC_Admin_Launcher`, garantindo que o launcher rode com privilégios elevados sem UVM interativo.

---

## Key Conventions

### Portuguese-First Language

Todo o projeto é em **Português do Brasil**: UI do HTML, mensagens do PowerShell, prompts da IA, descrições de ferramentas MCP, e README. Novos comandos e interfaces devem manter este padrão.

### Launcher HTTP API (Porta 7777)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Health check. Retorna `{status, admin, state, activeJobs, pid}` |
| `/run` | POST | Recebe `{"cmd":"..."}`, cria job async, retorna `{success, accepted, jobId, state, activeJobs}` |
| `/run-status?id=<id>` | GET | Retorna estado do job: `{success, jobId, state, output, exitCode, activeJobs}` |
| `/mcp-status` | GET | Retorna `{status: "online"|"offline"}` do Node.js MCP Server |
| `/ollama-status` | GET | Retorna `{status, models}` do Ollama local |
| `/minimize` | POST | Minimiza a janela do terminal do launcher |
| `/open-terminal` | POST | Abre novo terminal PowerShell no contexto elevado |

- CORS habilitado (`Access-Control-Allow-Origin: *`).
- Timeout de jobs: **900 segundos** (`$JobTimeoutSeconds`).
- Retenção de jobs finalizados: **30 minutos** (`$JobRetentionMinutes`).
- Máximo de jobs concorrentes limitado apenas pelo pool de threads do PowerShell.

### Command Mapping System (MCP Server)

As ferramentas do MCP (`mestreTools` em `index.js`) mapeiam nomes amigáveis para comandos PowerShell:

```js
const mestreTools = {
  limpeza_rapida_completa: {
    description: "...",
    command: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -EA 0; ...',
  },
  // ...
};
```

- Comandos com placeholders (`{{NOME}}`, `{{NOME_SERVICO}}`) geram schemas dinâmicos de parâmetros no MCP.
- Sanitização básica: remove backticks, aspas duplas e simples dos argumentos antes de substituir.
- Placeholders não preenchidos retornam erro explicitamente.

### MCP Tool Categories

As ferramentas expostas via MCP seguem estas categorias:

1. **Limpeza Geral** (`limpeza_rapida_completa`, `esvaziar_lixeira`, `limpar_cache_windows_update`)
2. **Limpeza Avançada** (`limpar_logs_event_viewer`, `limpar_cache_thumbnail`)
3. **Memória / RAM** (`liberar_memoria_ram`, `ver_uso_ram`, `listar_processos_alto_consumo_ram`)
4. **Processos** (`reiniciar_explorer`, `encerrar_processo` com `nome`, `desativar_servico` com `nome_servico`)
5. **Disco** (`verificar_espaco_disco`, `verificar_saude_disco`)
6. **Rede** (`diagnostico_rede`, `renovar_ip`)
7. **Reparo do Sistema** (`reparar_arquivos_sfc`, `reparar_imagem_dism`)
8. **Diagnóstico** (`verificar_informacoes_sistema`, `verificar_temperatura_cpu`, `diagnostico_completo`)
9. **Git** (`git_status`, `git_pull`) — usam `PROJETO_PATH` do `.env`
10. **Segurança** (`verificar_defender`, `scan_defender_rapido`)
11. **IA** (`perguntar_ia` com `pergunta`, `analisar_logs_sistema`, `verificar_modelo_ollama`)

### Dashboard HTML Structure

- Single-file HTML com CSS e JS inline (arquivo único para portabilidade).
- Categorias de comandos definidas no array `CATS` no `<script>`.
- Cada categoria tem `id`, `label`, e array `cmds` de pares `["Label do Botão", "Comando PowerShell"]`.
- Comunicação com launcher via `fetch()` para `http://127.0.0.1:7777`.
- Modal de chat IA (`iaOverlay`) com histórico de mensagens e conexão ao Ollama.

### C# Build Conventions

- **Fontes**: `install.cs`, `uninstall.cs`, `AbrirMestreDoPC.cs`
- **Saída**: Compilados com `csc.exe` para `Sistema/` e `Sistema/Mestre_Dados/`
- **Referências**: `AbrirMestreDoPC.cs` requer `System.Windows.Forms.dll` (target `winexe`)
- **Ícone**: Usa `/win32icon` apontando para `Mestre_Dados/icon.ico`

### PowerShell Job Result Contract

O launcher espera que comandos retornem um objeto com:
- `success` (bool)
- `output` (string)
- `exitCode` (int)

O `Receive-Job` extrai o último elemento do array (`@($result)[-1]`) e valida se tem `.success`, `.output`, `.exitCode`. Comandos que não retornam este formato são interpretados pelo estado do job (`Completed`/`Failed`).

---

## Environment Notes

- **Ollama**: Esperado em `http://localhost:11434`. Se não estiver rodando, o dashboard mostra status offline e o MCP Server falha graciosamente.
- **Porta 7777**: Se já estiver ocupada por outro processo (não PowerShell), o launcher aborta. Se estiver ocupada por um launcher anterior, ele mata o processo e reinicia.
- **Windows**: Requer Windows 10/11 com PowerShell 5.1+ ou PowerShell 7.x.
