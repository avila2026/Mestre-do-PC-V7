# Dependency review and update plan

## Scope

This review covered the Node.js TypeScript MCP service under `MestreDoPC-V7/` and the root wrapper package used by the repository.

## Validation performed

Commands executed locally:

- `npm install`
- `npm run build`
- `npm test -- --runInBand`
- `npm --prefix MestreDoPC-V7 run lint`
- `npm --prefix MestreDoPC-V7 run typecheck`

Current status:

- Build: OK
- Lint: OK
- Typecheck: OK
- Tests: 82/82 passing

## Dependency inventory

### Root package

`/package.json` is a wrapper package with no app dependencies; it delegates build/test to `MestreDoPC-V7/`.

### Direct runtime dependencies (`MestreDoPC-V7/package.json`)

| Package | Version | Role | Notes |
|---|---:|---|---|
| `@modelcontextprotocol/sdk` | `^0.5.0` | Runtime | Direct dependency used by the MCP server transport layer. |
| `pino` | `^8.17.2` | Runtime | Structured logging. |
| `pino-pretty` | `^10.3.1` | Runtime | Pretty console logging for local development. |

### Direct development dependencies (`MestreDoPC-V7/package.json`)

| Package | Version | Role | Notes |
|---|---:|---|---|
| `@types/jest` | `^29.5.11` | Dev | Type definitions for Jest. |
| `@types/node` | `^20.10.6` | Dev | Node.js type definitions. |
| `@typescript-eslint/eslint-plugin` | `^6.17.0` | Dev | Linting support. |
| `@typescript-eslint/parser` | `^6.17.0` | Dev | Parser for ESLint. |
| `eslint` | `^8.56.0` | Dev | Linting. |
| `jest` | `^29.7.0` | Dev | Unit/integration tests. |
| `prettier` | `^3.1.1` | Dev | Formatting. |
| `ts-jest` | `^29.1.1` | Dev | Jest + TypeScript integration. |
| `tsx` | `^4.7.0` | Dev | TS runtime for local execution. |
| `typescript` | `^5.3.3` | Dev | Compiler. |

## Vulnerability scan

Executed with `npm audit` in `MestreDoPC-V7/`.

Current findings:

- 11 vulnerabilities total
- 2 low severity
- 9 high severity
- 0 critical severity

### Highest-priority findings

1. `@modelcontextprotocol/sdk` (high)
   - Advisory: DNS rebinding protection disabled by default.
   - Impact: higher exposure for networked MCP integrations.
   - Recommended action: upgrade to the latest 1.x line.

2. `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/typescript-estree`, `minimatch`, `brace-expansion`, `js-yaml` (high)
   - Impact: primarily development/build tooling, but they increase supply-chain risk and may cause CI instability if left unpatched.
   - Recommended action: upgrade the ESLint toolchain to a supported major version and refresh transitive dependencies.

3. `@babel/core`, `esbuild` (low)
   - Impact: limited to development-time tooling.
   - Recommended action: refresh as part of the toolchain update.

## Risk assessment

- High: runtime dependency risk in the MCP SDK.
- Medium: development toolchain vulnerabilities can still break builds or CI and increase maintenance effort.
- Low: the current codebase is now buildable and testable, but dependency refresh remains necessary to reduce security exposure.

## Proposed atomic PRs

### PR 1 — Stabilize test suite and baseline

- Keep the current fixes already applied in this branch:
  - correct Jest import paths under nested test folders;
  - ensure injection handling raises a security error before validation failures;
  - document the dependency baseline.
- Outcome: build, lint, typecheck, and tests all pass.

### PR 2 — Upgrade the MCP runtime SDK

- Update `@modelcontextprotocol/sdk` to the latest supported 1.x release.
- Validate handshake, transport, and tool registry behavior.
- Outcome: remove the highest-priority runtime vulnerability.

### PR 3 — Upgrade the ESLint/TypeScript toolchain

- Upgrade `eslint`, `@typescript-eslint/*`, and related parser/tooling to supported versions.
- Fix any config or lint-rule breakage.
- Outcome: reduce high-severity dev-toolchain vulnerabilities.

### PR 4 — Refresh remaining runtime/dev dependencies

- Review `pino`, `pino-pretty`, `jest`, `ts-jest`, `tsx`, and `typescript` for current supported versions.
- Re-run `npm audit` and test/build flows after each update.
- Outcome: keep the dependency tree current and easier to maintain.

## Recommended execution order

1. Merge the current stability fixes.
2. Upgrade `@modelcontextprotocol/sdk` first.
3. Upgrade ESLint/TypeScript tooling second.
4. Perform a final dependency refresh pass.
