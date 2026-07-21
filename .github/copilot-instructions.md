# Mestre do PC V7 Copilot Instructions

## Project layout and commands

The repository root is a wrapper package for the TypeScript MCP server in
`MestreDoPC-V7/`. Run application commands from that directory, or use
`npm --prefix MestreDoPC-V7 ...` from the repository root. CI runs on Windows
with Node 20; the package supports Node 18+.

```powershell
# Install the MCP server dependencies
npm --prefix MestreDoPC-V7 ci

# Validate the entire project
npm --prefix MestreDoPC-V7 run lint
npm --prefix MestreDoPC-V7 run typecheck
npm --prefix MestreDoPC-V7 test
npm --prefix MestreDoPC-V7 run build

# Run one Jest test file
npm --prefix MestreDoPC-V7 test -- tests/unit/sanitizer.test.ts

# Local entry points
npm --prefix MestreDoPC-V7 run dev          # browser dashboard + MCP server, watch mode
npm --prefix MestreDoPC-V7 start            # compiled browser dashboard + MCP server
npm --prefix MestreDoPC-V7 run start:stdio  # compiled MCP stdio server only
```

`format` writes changes to `src/**/*.ts` and `tests/**/*.ts`; use it only when
formatting is intended. The root `npm run build` and `npm test` delegate to the
nested package.

## Architecture

Mestre do PC is a Windows-maintenance MCP server. The normal runtime path is:

```text
MCP client --stdio--> src/mcp/server.ts --> MCP handlers --> tool registry
                                                        |--> local Ollama API
                                                        `--> HTTP launcher at :7777 --> Windows tools
```

- `src/index.ts` starts the stdio-only MCP server. `src/browserRunner.ts`, used
  by `start` and `dev`, also starts a localhost dashboard (`/health`, `/tools`)
  and then connects the same stdio MCP server.
- `src/mcp/handlers/` lists registered tools and dispatches calls. Incoming MCP
  argument values are normalized to `Record<string, string>`; handlers accept
  both direct arguments and a nested `params` object.
- `src/mcp/tools/registry.ts` is the single registration point. Tool classes
  extend `BaseTool`, which derives MCP JSON Schema from `parameters` and
  performs security validation before `executeImpl`.
- Windows-tool implementations build an encoded PowerShell command, submit it
  to the launcher via `POST /run`, and poll `GET /run-status`. The launcher
  client is deliberately raw HTTP; retry and polling are separate
  infrastructure utilities. `perguntar_ia` calls Ollama directly instead.
- `src/config/index.ts` owns runtime settings: launcher URL/timeouts/retries,
  logging, simulation mode, and the Ollama URL. Defaults target localhost.

## Tool and security contract

Tool execution is security-sensitive. Do not bypass `BaseTool.execute`,
`validateToolCall`, or `buildSafeCommand` for a Windows command. Validation
rejects unknown or malformed parameters and injection-like values before the
command builder escapes arguments and encodes the PowerShell command as
UTF-16LE Base64 for `-EncodedCommand`.

When adding or changing a tool, update these surfaces together:

1. Implement a `BaseTool` subclass in `src/mcp/tools/implementations/` with
   `name`, `description`, `parameters`, and `executeImpl`.
2. Register its instance in `src/mcp/tools/registry.ts`.
3. Add the matching required/optional parameter schema and value patterns to
   `TOOL_PARAM_WHITELIST` in `src/security/whitelist.ts`.
4. Update focused tool, handler, and security tests. Test command execution
   through mocked launcher/Ollama clients rather than a real Windows command.

Keep the MCP `parameters` metadata and whitelist aligned. The former exposes
the client-facing schema; the latter is the execution-time allowlist.

## Code and test conventions

- TypeScript is strict, targets ES2022/CommonJS, and excludes tests from
  production compilation. Use explicit return types for new exported
  functions; unused parameters must be prefixed with `_`. Do not use
  `console`; use the Pino logger from `src/infra/logger.ts`.
- Use camelCase filenames, relative imports, named exports, 2-space
  indentation, single quotes, semicolons, trailing commas, and a 100-column
  Prettier width.
- Tests are Jest + ts-jest files under `MestreDoPC-V7/tests/`, grouped by
  `unit`, `integration`, `security`, `mcp`, and `infra`. Mock external
  launcher and Ollama boundaries in integration tests.
- Keep personal credentials and private MCP configuration out of the
  repository. `.codex/config.toml` is the repository's shared MCP baseline.
