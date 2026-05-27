# 🧠 Lições Aprendidas — Mestre do PC V7

> Este arquivo documenta erros encontrados e suas soluções.
> O objetivo é NUNCA repetir o mesmo erro duas vezes.

---

## 1. Nunca usar caminhos fixos do desenvolvedor em arquivos distribuíveis

**Erro**: Colocar `C:\Users\Jeanc\OneDrive\...` dentro do HTML que vai para o cliente.
**Por que aconteceu**: Os comandos Git foram criados manualmente durante o desenvolvimento.
**Solução**: Sempre usar placeholders como `{{PROJECT_PATH}}` e substituir automaticamente durante a instalação.
**Regra**: Antes de gerar um build, buscar por `Jeanc` em todos os arquivos. Se aparecer, é um vazamento de caminho.

---

## 2. Nunca montar JSON manualmente no PowerShell

**Erro**: Usar concatenação de strings para criar respostas JSON.
**Por que aconteceu**: O PowerShell não tinha suporte fácil a JSON no passado.
**Solução**: Usar `ConvertFrom-Json` para ler e `ConvertTo-Json -Compress` para escrever.
**Regra**: Qualquer comunicação entre HTML e PowerShell DEVE usar cmdlets nativos de JSON.

---

## 3. Sempre declarar dependências no package.json

**Erro**: O `index.js` importa `@modelcontextprotocol/sdk` mas não está no `package.json`.
**Por que aconteceu**: A dependência foi instalada manualmente sem `--save`.
**Solução**: Sempre usar `npm install --save nome-do-pacote` para registrar automaticamente.
**Regra**: Após criar qualquer servidor Node.js, rodar `npm ls` para verificar se todas as dependências estão declaradas.

---

## 4. Configurações do VS Code devem refletir o projeto atual

**Erro**: `launch.json` com porta 8080 (padrão) e extensão Flutter (irrelevante).
**Por que aconteceu**: Foram geradas automaticamente pelo VS Code e nunca ajustadas.
**Solução**: Atualizar porta para 7777 e listar apenas extensões relevantes.
**Regra**: Sempre revisar o `.vscode/` antes de fazer commit.

---

## 5. Chaves de criptografia devem ser protegidas

**Erro**: Chave AES `MpC$V7!2026@Key#` e IV `1234567890123456` visíveis no código-fonte.
**Nível**: Risco médio para software local.
**Solução futura**: Ofuscar o executável ou usar DPAPI do Windows para proteger a chave.
**Regra**: Nunca deixar chaves como strings literais em código que será distribuído.

---

## 6. LocalStorage é finito — sempre limite e expire dados

**Erro:** Em versões anteriores do console, não havia limite de entradas no `localStorage`.
**Risco:** O `localStorage` tem cota de ~5MB. Sem limite, o histórico de comandos poderia encher e quebrar.
**Solução:** Implementar `MAX_HISTORY = 100` e `HISTORY_RETENTION_MS = 24h` no console avançado.
**Regra:** Qualquer feature que use `localStorage` deve ter: (1) limite máximo, (2) TTL/expire, (3) fallback se storage falhar.

---

## 7. Parsing de output textual é frágil — use `dataset` para metadados

**Erro:** Tentar re-parsear texto do output para aplicar filtros após finalização.
**Por que aconteceu:** O output é texto puro do PowerShell; regex pode falhar com locales diferentes.
**Solução:** Armazenar `dataset.status`, `dataset.exitCode`, `dataset.timestamp` diretamente no DOM da entry.
**Regra:** Nunca confie em re-parsear texto para estado da UI. Sempre guarde metadados estruturados no elemento HTML.

---

*Adicione novas lições seguindo o formato acima quando encontrar novos problemas.*
