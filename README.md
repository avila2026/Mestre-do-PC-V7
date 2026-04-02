# Mestre do PC V7 🖥️

Ferramenta de administração e manutenção de PC para Windows, com interface moderna em HTML5 e execução de comandos PowerShell como Administrador.

---

## ✅ Pré-requisitos

- Windows 10 ou Windows 11
- PowerShell 5.1 (já incluso no Windows) ou PowerShell 7+
- Qualquer navegador moderno (Chrome, Edge, Firefox)
- Acesso de Administrador no computador

---

## 🚀 Como instalar e usar

### Passo 1 — Baixar os arquivos

Baixe ou clone este repositório numa pasta de sua preferência, por exemplo:

```
C:\MestreDoPC_V7\
```

Certifique-se de que todos estes arquivos estão na mesma pasta:

```
MestreDoPC_V7/
├── start-mestre.bat               ← Inicializador
├── MestreDoPC-Launcher.ps1        ← Servidor backend
├── MestreDoPC-Ultimate-v7.html    ← Interface do usuário
├── favicon.png
└── logo-mestre-v7-transparent.png
```

### Passo 2 — Iniciar o servidor

1. Clique com o botão **direito** em `start-mestre.bat`
2. Selecione **"Executar como administrador"**
3. Aguarde a janela do PowerShell abrir com a mensagem `SERVIDOR ATIVO`
4. O navegador abrirá automaticamente com a interface

> ⚠️ **Importante:** O servidor PowerShell precisa ficar aberto enquanto você usa a ferramenta. Fechar a janela encerra o servidor.

### Passo 3 — Usar a interface

- Selecione uma categoria no menu lateral
- Clique em **[Executar]** no comando desejado
- O resultado aparece no painel de saída à direita

---

## 🤖 Funcionalidade de IA (Opcional)

Para usar o assistente de IA integrado, instale o [Ollama](https://ollama.ai):

```powershell
# 1. Baixe e instale o Ollama em: https://ollama.ai
# 2. Baixe um modelo (recomendado):
ollama pull qwen2.5:1.5b

# 3. O Ollama inicia automaticamente — a IA ficará disponível na interface
```

---

## ⚙️ Solução de Problemas

### ❌ "Launcher offline" aparece na interface

**Causa:** O servidor PowerShell não está rodando ou não foi iniciado como Administrador.

**Solução:**
1. Feche o HTML no navegador
2. Clique com o botão direito em `start-mestre.bat` → **Executar como administrador**
3. Aguarde a mensagem `SERVIDOR ATIVO` na janela do PowerShell
4. Abra novamente o HTML no navegador

---

### ❌ "A execução de scripts foi desabilitada neste sistema"

**Causa:** A política de execução do PowerShell está bloqueando scripts.

**Solução:** O `start-mestre.bat` já usa `-ExecutionPolicy Bypass` automaticamente. Se ainda assim falhar, execute manualmente no PowerShell como Admin:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

### ❌ Erro de porta 7777 em uso

**Causa:** Outro programa está usando a porta 7777.

**Solução:** Verifique qual processo está usando a porta e encerre-o:

```powershell
netstat -ano | findstr :7777
# Anote o PID e encerre com:
taskkill /PID <numero_do_pid> /F
```

---

### ❌ MCP Server "offline"

**Causa:** O Node.js MCP Server é um componente opcional para funcionalidades avançadas de Git.

**Solução:** Esta funcionalidade requer instalação separada do Node.js e do servidor MCP. Para uso geral do Mestre do PC, o MCP não é obrigatório.

---

## 📋 Categorias de Comandos

| Categoria | Nº de Comandos |
|-----------|----------------|
| Limpeza Geral | 10 |
| Limpeza Avançada | 11 |
| Memória / RAM | 7 |
| Processos | 9 |
| Disco | 9 |
| Rede Básica | 8 |
| Reparo do Sistema | 10 |
| Diagnóstico | 9 |
| Desligamento | 8 |
| Git / Mestre do PC | 8 |
| Remoção de Bloatware | 8 |
| Segurança Geral | 8 |
| Rede Segura | 8 |

---

## 🔒 Segurança

- O servidor HTTP roda **apenas em localhost** (127.0.0.1:7777) — nenhuma porta é exposta na rede
- Os comandos são executados localmente com privilégios de Administrador
- Use somente em computadores de sua propriedade ou sob sua responsabilidade
