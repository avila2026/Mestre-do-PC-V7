# Mestre do PC V7 — Guia para Agentes de IA

> Arquivo de referência para agentes de código que trabalham neste projeto. Leia isto antes de fazer qualquer alteração.

---

## Visão Geral do Projeto

O **Mestre do PC V7** é uma suíte de otimização, manutenção e diagnóstico para Windows. Utiliza arquitetura híbrida:

- **Dashboard HTML/JS/CSS** (`MestreDoPC-Ultimate-v7.html`) — interface dark-themed, responsiva, single-file (todo CSS e JS inline).
- **Launcher PowerShell** (`MestreDoPC-Launcher.ps1`) — servidor HTTP local usando `System.Net.HttpListener` na porta **7777**, executa comandos com privilégios de Administrador via jobs assíncronos (`Start-Job`).
- **MCP Server Node.js** (`Sistema/mcp-server/index.js`) — servidor Model Context Protocol (transporte stdio) que expõe ferramentas de manutenção para IDEs e clientes de IA (Claude Desktop, etc.).
- **IA Local via Ollama** (`qwen2.5:1.5b`) — chat integrado no dashboard + análise inteligente de logs do Event Viewer, 100% offline.
- **Binários C#** (`Administrador/*.cs`) — instalador (`install.exe`), desinstalador (`uninstall.exe`) e launcher Windows Forms (`Abrir-MestreDoPC.exe`).

A comunicação entre o HTML e o sistema operacional é feita via `fetch()` REST para `http://127.0.0.1:7777`, porque o navegador não pode executar comandos nativos diretamente.

---

## Estrutura de Diretórios

```
Mestre do PC V7/
├── Administrador/                # Ferramentas do desenvolvedor (não vão para o cliente)
│   ├── Build-MestreDoPC.ps1      # Script de build dos executáveis C#
│   ├── install.cs                # Fonte do instalador
│   ├── uninstall.cs              # Fonte do desinstalador
│   ├── AbrirMestreDoPC.cs        # Launcher Windows Forms oculto
│   ├── GerarLicenca.cs           # Gerador de licenças AES
│   └── GeradorLicenca.exe        # Executável do gerador de licenças
│
├── Sistema/                      # Pacote de distribuição oficial
│   ├── install.exe               # Instalador unificado
│   ├── mestre.lic                # Arquivo de licença
│   ├── start-mestre.bat          # Bootstrap completo para o cliente
│   ├── sync-mestre.ps1           # Sincronização dev → runtime C:\MestreDoPC_V7
│   ├── Create-MestreShortcut.ps1 # Cria atalho na área de trabalho
│   ├── mcp-server/               # Node.js MCP Server
│   │   ├── package.json          # ESM, dependências: @modelcontextprotocol/sdk, dotenv
│   │   ├── index.js              # Servidor MCP com stdio transport
│   │   ├── .env.example          # Template de variáveis de ambiente
│   │   └── .env                  # Gitignored — copiar do .env.example
│   └── Mestre_Dados/             # Runtime copiado para C:\MestreDoPC_V7 pelo instalador
│       ├── MestreDoPC-Ultimate-v7.html
│       ├── MestreDoPC-Launcher.ps1
│       ├── Register-MestreTask.ps1
│       ├── Abrir-MestreDoPC.exe
│       ├── uninstall.exe
│       ├── start-mestre.bat
│       ├── favicon.png
│       ├── icon.ico
│       └── logo-mestre-v7-transparent.png
│
├── Memoria_Aprendizagem/         # Decisões técnicas e lições aprendidas
│   ├── decisoes_tecnicas.md
│   ├── licoes_aprendidas.md
│   ├── proximos_passos.md
│   └── historico_revisoes.md
│
├── Pesquisa_Google_AI/           # Pesquisas e planos de evolução tecnológica
├── programmatic-seo/             # Estratégia SEO (não relacionado ao core app)
├── MestreDoPC-Launcher.ps1       # Launcher de desenvolvimento (raiz do repo)
├── MestreDoPC-Ultimate-v7.html   # Dashboard de desenvolvimento (raiz do repo)
├── AutoInstall_MestreV7.ps1      # Auto-installer one-shot para máquinas novas
├── README.md                     # Documentação principal (pt-BR)
├── .github/copilot-instructions.md
├── .vscode/launch.json           # Configurações de debug (porta 7777)
└── .continue/mcpServers/         # Configurações do Continue IDE
```

---

## Stack Tecnológico

| Camada | Tecnologia | Detalhes |
|--------|-----------|----------|
| Frontend | HTML5 + CSS3 + Vanilla JS | Single-file, dark theme neon (HSL), variáveis CSS, sem frameworks |
| Backend Admin | PowerShell 5.1+ / 7.x | `System.Net.HttpListener`, jobs assíncronos, Win32 API |
| MCP Server | Node.js 18+ ESM | `@modelcontextprotocol/sdk` v1.27.1, `dotenv`, stdio transport |
| IA Local | Ollama | Modelo `qwen2.5:1.5b` (~900 MB), porta 11434 |
| Binários | C# (.NET Framework 4.x) | `csc.exe`, AES-128 CBC, Windows Forms |
| Bootstrap | Batch + Scheduled Tasks | `schtasks.exe`, execução silenciosa com privilégios elevados |

---

## Comandos de Build, Dev e Execução

### Launcher PowerShell (modo desenvolvimento)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\MestreDoPC-Launcher.ps1
```

- O launcher auto-eleva para Administrador se necessário (`Start-Process -Verb RunAs`).
- Se a porta 7777 estiver ocupada por um processo PowerShell anterior, ele mata e reinicia.
- Se estiver ocupada por outro processo, aborta.

### Dashboard

Abrir `MestreDoPC-Ultimate-v7.html` diretamente no navegador, ou usar o bootstrap:

```batch
.\Sistema\start-mestre.bat
```

O `start-mestre.bat` faz:
1. Verifica/cria tarefa agendada `MestreDoPC_Admin_Launcher` (privilégios elevados).
2. Executa o launcher pela tarefa agendada.
3. Aguarda health check na porta 7777 (máx. 20s).
4. Abre o HTML no navegador.

### MCP Server

```bash
cd Sistema/mcp-server
copy .env.example .env    # Windows: copy, não cp
npm install
node index.js             # stdio transport — não é servidor HTTP standalone
```

### Build C# (instalador / desinstalador / launcher)

```powershell
cd Administrador
.\Build-MestreDoPC.ps1          # compila tudo
.\Build-MestreDoPC.ps1 -Clean   # limpa e recompila
```

Requisitos: `csc.exe` (.NET Framework 4.x). Saída:
- `Sistema/install.exe`
- `Sistema/Mestre_Dados/uninstall.exe`
- `Sistema/Mestre_Dados/Abrir-MestreDoPC.exe`

### Sincronização Dev → Runtime

```powershell
cd Sistema
.\sync-mestre.ps1         # compila C# + copia para C:\MestreDoPC_V7 com hash check
.\sync-mestre.ps1 -SkipBuild -Silent
```

### Auto-Installer Completo

```powershell
.\AutoInstall_MestreV7.ps1
```

Executa: build C# → instalação → npm install no MCP → configura Claude Desktop → pull do modelo Ollama.

---

## Arquitetura de Runtime

```
[MestreDoPC-Ultimate-v7.html]  ← Dashboard single-file
        │
        ├── POST /run ────────► [MestreDoPC-Launcher.ps1 :7777] (Admin)
        │                           │
        ├── GET  /run-status ◄─────┤  async Start-Job per command
        │                           │
        ├── GET  /ping             └──► OS commands (PowerShell nativo)
        ├── GET  /mcp-status
        ├── GET  /ollama-status
        │
        └── POST /api/chat ──► [Ollama localhost:11434]
                                         ▲
[Claude Desktop] ── stdio ──► [Sistema/mcp-server/index.js] ── HTTP ──► Launcher :7777
```

### Endpoints do Launcher (porta 7777)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/ping` | GET | Health check — retorna `{status, admin, state, activeJobs, pid}` |
| `/run` | POST | Recebe `{"cmd":"..."}`, cria job async, retorna `{success, accepted, jobId, state, activeJobs}` |
| `/run-status?id=<id>` | GET | Retorna estado do job: `{success, jobId, state, output, exitCode, activeJobs}` |
| `/mcp-status` | GET | Retorna `{status: "online"\|"offline"}` do MCP Server |
| `/ollama-status` | GET | Retorna `{status, models}` do Ollama local |
| `/minimize` | POST | Minimiza a janela do terminal do launcher (Win32 API) |
| `/open-terminal` | POST | Abre novo terminal PowerShell no contexto elevado |

- CORS habilitado (`Access-Control-Allow-Origin: *`).
- Timeout de jobs: **900 segundos** (`$JobTimeoutSeconds`).
- Retenção de jobs finalizados: **30 minutos** (`$JobRetentionMinutes`).
- O launcher extrai o último elemento do array de resultados do `Receive-Job` (`@($result)[-1]`) e valida se contém `.success`, `.output`, `.exitCode`.

---

## Organização do Código

### Dashboard HTML (`MestreDoPC-Ultimate-v7.html`)

- Arquivo único (~2500 linhas) com CSS e JS inline para portabilidade.
- Categorias de comandos definidas no array `CATS` (13 categorias):
  1. Limpeza Geral
  2. Limpeza Avançada
  3. Memória / RAM
  4. Processos
  5. Disco
  6. Rede Básica
  7. Reparo do Sistema
  8. Saúde do PC
  9. Diagnóstico
  10. Desligamento
  11. Git / Mestre do PC
  12. Remoção Específica
  13. Segurança Geral
  14. Rede Segura
- Cada categoria tem `id`, `label` e array `cmds` de pares `["Label do Botão", "Comando PowerShell"]`.
- Console Avançado V2: histórico persistente no `localStorage` (max 100 entradas, TTL 24h), filtros por status, auto-scroll, timer global, exportação para `.txt`, notificações nativas do navegador e mini métricas visuais (gauges/progress bars) parseadas do output.
- Chat IA: modal `iaOverlay` com streaming de respostas do Ollama, botões "▶ Executar" para blocos de código PowerShell.
- Placeholders `{{PROJECT_PATH}}` são substituídos em runtime pelo caminho de instalação (`C:\MestreDoPC_V7` por padrão).

### MCP Server (`Sistema/mcp-server/index.js`)

- ESM (`"type": "module"` no `package.json`).
- Ferramentas mapeadas no objeto `mestreTools` — nomes amigáveis → comandos PowerShell.
- Placeholders `{{NOME}}`, `{{NOME_SERVICO}}` no comando geram schemas dinâmicos de parâmetros no MCP automaticamente.
- Sanitização básica de argumentos: remove backticks, aspas duplas e simples antes de substituir.
- Placeholders não preenchidos retornam erro explicitamente.
- Ferramentas de IA (`perguntar_ia`, `analisar_logs_sistema`, `verificar_modelo_ollama`) comunicam diretamente com Ollama via `fetch`.
- System Prompt fixo em português brasileiro, proibindo inventar comandos.

### Launcher PowerShell

- Usa `[hashtable]::Synchronized(@{})` para `$CommandJobs` (thread-safe).
- `Cleanup-CommandJobs` roda a cada 5 segundos via timer.
- Contrato de resultado esperado: `{success: bool, output: string, exitCode: int}`.
- Gerenciamento de PID via arquivo `.pid` para evitar múltiplas instâncias.

---

## Convenções de Código e Estilo

### Idioma

**TUDO é em Português do Brasil (pt-BR)**: UI do HTML, mensagens do PowerShell, descrições de ferramentas MCP, prompts de IA, README, comentários de código e documentação. Novos comandos e interfaces devem manter este padrão rigorosamente.

### PowerShell

1. **Nunca montar JSON por concatenação de strings** — sempre usar `ConvertTo-Json -Compress` e `ConvertFrom-Json`.
2. **Nunca hardcode caminhos do desenvolvedor** — antes de gerar build, buscar por `Jeanc` ou `C:\Users` em todos os arquivos. Usar `{{PROJECT_PATH}}` como placeholder em arquivos distribuíveis.
3. **$ErrorActionPreference = "Stop"** em scripts de build e setup para falha rápida.
4. Contrato de job: comandos devem retornar objeto com `success`, `output`, `exitCode`.

### Node.js / MCP

1. **Sempre usar `npm install --save`** ao adicionar pacotes. O `package.json` deve declarar todas as dependências de runtime.
2. O servidor é ESM — usar `import/export`, não `require/module.exports`.
3. Variáveis de ambiente via `dotenv/config` (arquivo `.env` gitignored).

### C#

1. Compilado com `csc.exe` (.NET Framework 4.x), flags `/nologo /optimize+`.
2. `AbrirMestreDoPC.cs` usa `System.Windows.Forms.dll` com target `winexe`.
3. Ícone aplicado via `/win32icon` apontando para `Mestre_Dados/icon.ico`.

### HTML / CSS / JS

1. Single-file para portabilidade — todo CSS e JS inline.
2. Variáveis CSS no `:root` para tema dark neon (`--bg`, `--panel`, `--accent`, `--accent2`, etc.).
3. `localStorage` deve ter limite máximo, TTL/expire e fallback se falhar.
4. Metadados estruturados (`dataset`) no DOM para estado da UI — nunca re-parsear texto do output.

---

## Estratégia de Testes

O projeto **não possui suite de testes automatizados** (o `npm test` do MCP server retorna placeholder de erro). A validação é feita manualmente:

1. **Health check**: `GET http://127.0.0.1:7777/ping` deve retornar `status: "ok"`.
2. **Execução de comando**: Executar uma limpeza rápida pelo dashboard e verificar o console avançado.
3. **MCP**: Conectar via Claude Desktop e executar `verificar_informacoes_sistema`.
4. **Ollama**: Verificar se `qwen2.5:1.5b` responde no chat do dashboard.
5. **Build C#**: Validar que os 3 executáveis são gerados sem erros (`install.exe`, `uninstall.exe`, `Abrir-MestreDoPC.exe`).
6. **Sync**: Executar `sync-mestre.ps1` e validar hashes SHA256.

Pontos pendentes de teste (registrados em `Memoria_Aprendizagem/proximos_passos.md`):
- Métricas com múltiplos discos (D:, E:, etc.).
- Notificações nativas no Windows 11.
- Persistência de histórico após fechar/reabrir navegador.

---

## Segurança

1. **Execução como Administrador obrigatória**: O launcher roda com privilégios máximos. O `start-mestre.bat` usa tarefa agendada (`schtasks`) para evitar prompt UAC interativo.
2. **RCE via Browser**: O listener aceita requisições `/run` de qualquer origem (CORS `*`). Uma página maliciosa externa poderia enviar POST para `localhost:7777/run`. A mitigação planejada é adicionar um header `Authorization: Bearer <TOKEN>` gerado no bootstrap.
3. **Chave AES no código-fonte**: A chave `MpC$V7!2026@Key#` e o IV `1234567890123456` estão em `install.cs` como strings literais. Isso é uma proteção básica, não enterprise. A mitigação futura é ofuscação ou uso do DPAPI do Windows.
4. **Licenças**: Arquivos `.lic` são criptografados com AES-128 CBC. O instalador valida a licença antes da cópia dos arquivos.
5. **Nunca commitar arquivos sensíveis**: `.env`, `.lic`, `node_modules/`, `*.pid`, `*.log`, `*.tmp`, `*.bak` estão no `.gitignore`.

---

## Deploy e Distribuição

### Fluxo de build para distribuição

1. Desenvolvedor edita na raiz do repo (`MestreDoPC-Ultimate-v7.html`, `MestreDoPC-Launcher.ps1`, etc.).
2. Build C#: `cd Administrador && .\Build-MestreDoPC.ps1` → gera `.exe` em `Sistema/` e `Sistema/Mestre_Dados/`.
3. Sincronização: `cd Sistema && .\sync-mestre.ps1` → copia para `C:\MestreDoPC_V7` com verificação SHA256.
4. Instalador: `Sistema/install.exe` copia `Mestre_Dados/` para `C:\MestreDoPC_V7` no cliente, cria tarefa agendada e atalho na área de trabalho.
5. Auto-installer (`AutoInstall_MestreV7.ps1`) automatiza todo o fluxo incluindo configuração do Claude Desktop.

### Diretórios de propriedade

| Caminho | Finalidade | Quem usa |
|---------|-----------|----------|
| `Administrador/` | Ferramentas de build e fontes C# | Apenas desenvolvedor |
| `Sistema/` | Pacote de distribuição oficial | Instalador |
| `Sistema/Mestre_Dados/` | Runtime copiado para `C:\MestreDoPC_V7` | Cliente final |
| `Sistema/mcp-server/` | Node.js MCP Server | Integração com IA |
| `Memoria_Aprendizagem/` | Decisões técnicas e lições | Desenvolvedor + agentes IA |
| `Pesquisa_Google_AI/` | Pesquisas tecnológicas | Apenas desenvolvedor |
| `programmatic-seo/` | Estratégia SEO (side project) | Marketing |

---

## Variáveis de Ambiente

Arquivo `Sistema/mcp-server/.env` (gitignored — copiar de `.env.example`):

```env
MESTRE_LAUNCHER_URL=http://localhost:7777
MESTRE_PROJETO_PATH=C:\MestreDoPC_V7
MESTRE_OLLAMA_URL=http://localhost:11434
MESTRE_OLLAMA_MODEL=qwen2.5:1.5b
```

---

## Pré-requisitos

- Windows 10/11, PowerShell 5.1+ ou PowerShell 7.x
- Node.js LTS v18+ (para o MCP server)
- Ollama instalado + modelo `qwen2.5:1.5b` baixado (`ollama pull qwen2.5:1.5b`)
- Permissões de Administrador (o launcher auto-eleva)
- `csc.exe` (.NET Framework 4.x) para compilar C#

---

## Leituras Complementares

- `Memoria_Aprendizagem/licoes_aprendidas.md` — erros passados e soluções
- `Memoria_Aprendizagem/decisoes_tecnicas.md` — justificativas das escolhas arquiteturais
- `.github/copilot-instructions.md` — endpoints detalhados e schemas de ferramentas MCP
- `README.md` — guia de instalação e uso para usuários finais
