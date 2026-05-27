# 🛡️ Mestre do PC V7 — Ultimate Edition

O **Mestre do PC V7** é uma suíte inteligente e premium de otimização, manutenção e diagnóstico para sistemas operacionais Windows. Unindo o poder de **scripts PowerShell de administração nativa**, **Model Context Protocol (MCP)** e **Inteligência Artificial Local via Ollama**, o sistema oferece uma central unificada e automatizada para a conservação e aceleração de computadores de forma 100% offline.

---

## 🏗️ 1. Arquitetura do Sistema

A arquitetura do Mestre do PC V7 divide-se em três camadas integradas:

```
[ Dashboard HTML/JS/CSS ] (MestreDoPC-Ultimate-v7.html)
        │
        ├── (fetch REST /run) ────────► [ PowerShell HTTP Listener ] (Porta 7777 - Elevado Admin)
        │                                     │
        └── (fetch /api/chat)                 ├─── (Executa Comandos Nativa) ──► [ Sistema Operacional ]
                 │                            │
                 ▼                            └─── (Status do Job & Terminais)
  [ Ollama Local Model ] (qwen2.5:1.5b)
                 ▲
                 │ (fetch /api/chat & perguntar_ia)
                 ▼
     [ Node.js MCP Server ] (Sistema/mcp-server) ◄─── (Stdio Transport) ─── [ Claude Desktop App ]
```

1. **Interface do Usuário (Frontend)**: Um painel web moderno, dark-themed e responsivo baseado em variáveis HSL neon e micro-animações, que se comunica com o backend local via requisições REST `fetch()`.
2. **Servidor HTTP Admin (PowerShell Launcher)**: Um listener local que roda sob privilégios máximos de Administrador na porta **7777**, operando de forma assíncrona (com agendador de jobs paralelos) e controlando de forma segura as ações no sistema do usuário.
3. **Servidor MCP (Model Context Protocol)**: Um servidor Node.js que expõe ferramentas nativas do sistema para IDEs e clientes de inteligência artificial (como o Claude Desktop), fornecendo a capacidade da IA interagir de forma inteligente com o hardware da máquina.
4. **Inteligência Artificial (Ollama)**: Integração com modelo offline local `qwen2.5:1.5b` (~900MB) para chat interativo de suporte a problemas e análise inteligente automatizada de logs de erro extraídos em tempo real do Event Viewer do Windows.

---

## 📁 2. Estrutura de Pastas

* **`.venv/`, `.vscode/`, `.continue/`**: Configurações de workspace do desenvolvedor e ambientes isolados.
* **`Administrador/`**: Contém ferramentas exclusivas do desenvolvedor para compilação e testes:
  * `Build-MestreDoPC.ps1`: Script de automação para compilação de binários C#.
  * `install.cs`/`uninstall.cs`: Fontes do instalador e desinstalador do sistema.
  * `GerarLicenca.cs`/`GeradorLicenca.exe`: Utilitário para encriptar licenças AES e criar arquivos `.lic`.
  * `AbrirMestreDoPC.cs`: Launcher leve que inicializa a suite no Windows Forms de forma oculta.
* **`Memoria_Aprendizagem/`**: Lições aprendidas e histórico de decisões técnicas da aplicação.
* **`Pesquisa_Google_AI/`**: Pesquisas e planos de evolução tecnológica baseados no Google AI.
* **`Sistema/`**: O pacote de distribuição oficial empacotado para o cliente final:
  * `install.exe`: O executável do instalador unificado.
  * `Mestre_Dados/`: Contém os recursos de runtime copiados para a pasta de instalação final do cliente (`C:\MestreDoPC_V7`), incluindo o launcher PowerShell, o HTML de dashboard e executáveis nativos.
  * `mcp-server/`: O servidor MCP em Node.js para conectar IAs ao computador.

---

## 🚀 3. Guia de Instalação e Execução

### Pré-requisitos Obrigatórios

1. **Windows 10 ou 11** com PowerShell v5.1 ou superior.
2. **Node.js LTS (v18.0.0+)** instalado.
3. **Ollama** instalado e rodando localmente ([ollama.com](https://ollama.com/)).
   * Baixe o modelo oficial leve: `ollama run qwen2.5:1.5b`

---

### Executando em Modo de Desenvolvimento Local

1. Abra um terminal **PowerShell como Administrador** e execute o launcher assíncrono na raiz do repositório:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
   .\MestreDoPC-Launcher.ps1
   ```
2. O servidor local subirá na URL `http://localhost:7777`.
3. Dê dois cliques no arquivo `MestreDoPC-Ultimate-v7.html` no seu navegador favorito. O painel identificará o launcher ativo e ficará verde (`🟢 Launcher ativo — Execução direta habilitada!`).
4. Navegue entre as abas e clique em **Executar** em qualquer otimizador de sistema.

---

### Configurando o Servidor MCP no Claude Desktop

1. Acesse a pasta do MCP Server do projeto:
   ```bash
   cd Sistema/mcp-server
   ```
2. Copie o arquivo `.env.example` para `.env` e configure seus parâmetros:
   ```bash
   cp .env.example .env
   ```
3. Instale as dependências de runtime:
   ```bash
   npm install
   ```
4. Abra o arquivo de configuração do seu Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json`) e insira a entrada do servidor `mestre_do_pc`:
   ```json
   {
     "mcpServers": {
       "mestre_do_pc": {
         "command": "node",
         "args": ["SUA_PASTA_AQUI\\Sistema\\mcp-server\\index.js"],
         "env": {
           "MESTRE_PROJETO_PATH": "SUA_PASTA_AQUI"
         }
       }
     }
   }
   ```
5. Reinicie o Claude Desktop. Agora você poderá pedir coisas como *"Claude, qual é o consumo de RAM atual do meu PC?"* ou *"Faça um diagnóstico rápido no meu computador"*, e ele fará isso de forma nativa e integrada.

---

## 🔒 4. Avaliação e Recomendações de Segurança

Ao executar comandos administrativos no sistema operacional a partir de um servidor web na porta `7777`, algumas práticas de proteção devem ser implementadas antes da distribuição:

1. **Remote Code Execution (RCE) via Browser**: O listener PowerShell atual aceita requisições `/run` sem restrição de tokens. Se o usuário visitar uma página externa maliciosa, a página poderia enviar requisições do tipo POST para `http://localhost:7777/run` para comprometer o sistema.
   * *Mitigação*: Implementar nas próximas builds o envio de um header `Authorization: Bearer <TOKEN>` único gerado aleatoriamente no bootstrap da aplicação pelo batch `start-mestre.bat` e validado rigidamente pelo PowerShell Listener.
2. **Criptografia Simétrica**: A senha de licença AES `MpC$V7!2026@Key#` está no código-fonte.
   * *Mitigação*: Evite expor a chave como string estática. Use ofuscação com utilitários C# antes de compilar os executáveis.

---

## 🔮 5. Planejamento de Evolução SaaS (Roadmap V8)

1. **Portal Centralizado na Nuvem**: Migração da interface estática HTML para uma plataforma web SaaS desenvolvida em Next.js e Supabase Auth com cobrança recorrente via Stripe.
2. **Daemon Leve**: Substituição do listener PowerShell por um serviço de segundo plano do Windows nativo desenvolvido em C# ou Rust que estabelece WebSockets seguros (WSS) com os servidores SaaS, permitindo monitoramento remoto.
3. **Piloto Automático Inteligente**: Execução agendada de tarefas preventivas e análises autônomas no PC do usuário através de regras de machine learning pré-definidas na nuvem.
