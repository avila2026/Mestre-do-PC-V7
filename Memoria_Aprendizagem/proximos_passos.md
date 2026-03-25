# 🗺️ Próximos Passos — Mestre do PC V7

> Roadmap de melhorias futuras, organizadas por prioridade.
> Marque com ✅ quando concluir cada item.

---

## 🔴 Prioridade Alta — ✅ CONCLUÍDA

- [x] Substituir caminhos fixos no HTML por `{{PROJECT_PATH}}`
- [x] Adicionar substituição de `{{PROJECT_PATH}}` no `install.cs`
- [x] Refatorar JSON no `MestreDoPC-Launcher.ps1` (usar cmdlets nativos)
- [x] Adicionar `@modelcontextprotocol/sdk` ao `package.json` do MCP server

## 🟡 Prioridade Média — ✅ CONCLUÍDA

- [x] Corrigir a porta no `.vscode/launch.json` (8080 → 7777)
- [x] Limpar o `.vscode/extensions.json` (remover Flutter)
- [x] Corrigir erro de sintaxe no comando "Atualizar PowerShell" do HTML
- [x] Atualizar `README.md` do MCP server com caminhos genéricos

## 🧠 Integração Ollama — ✅ CONCLUÍDA

- [x] Modelo `qwen2.5:1.5b` (~900MB) baixado e testado
- [x] Chat modal com streaming integrado ao Dashboard HTML
- [x] System Prompt especializado em manutenção de PC
- [x] Botões "Executar" dentro das sugestões da IA
- [x] Ferramenta `perguntar_ia` adicionada ao MCP Server
- [x] Ferramenta `diagnostico_completo` adicionada ao MCP Server
- [x] CORS do Ollama configurado (`OLLAMA_ORIGINS=*`)
- [x] Decisões registradas em `decisoes_tecnicas.md`

## 🟢 Prioridade Baixa (Fazer Quando Possível)

- [ ] Ofuscar chave de criptografia nos executáveis compilados
- [ ] Gerar chaves de licença mais robustas e únicas por cliente
- [ ] Adicionar comando `icon.ico` à lista de arquivos copiados pelo instalador
- [ ] Adicionar um sistema de versionamento automático (ex: `version.json`)
- [ ] Criar um README geral na raiz do projeto

## 🔮 Futuro (Ideias para V8)

- [ ] Dashboard visual de saúde do PC em tempo real
- [ ] Sistema de temas (claro/escuro selecionável pelo usuário)
- [ ] Backup automático de configurações do usuário
- [ ] Modo "Piloto Automático" — IA executa limpezas sem perguntar

---

Atualizado em: 19/03/2026
