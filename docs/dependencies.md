# Dependency Review and Update Plan

## Scope
- Repository root: `C:\Users\Jeanc\Mestre-do-PC-V7`
- Main application package: `MestreDoPC-V7/`
- Package manager: `npm` with `package-lock.json`
- Runtime target: Node `>=18` (declared in `MestreDoPC-V7/package.json`)

## Current status
- Build: `npm run build` passed.
- Tests: `npm test -- --runInBand` passed with 12/12 suites and 82/82 tests.
- Vulnerability scan: `npm audit` reports 11 vulnerabilities (2 low, 9 high, 0 critical).

## Dependency inventory

### Root wrapper package
- `mestredopc-v7-vercel-root`
  - `scripts.postinstall`: installs the nested package
  - no direct runtime dependencies

### Runtime dependencies (`MestreDoPC-V7/package.json`)
| Package | Version | Notes |
| --- | --- | --- |
| `@modelcontextprotocol/sdk` | `0.5.0` | Direct runtime dependency; currently vulnerable. |
| `pino` | `8.21.0` | Logging runtime dependency. |
| `pino-pretty` | `10.3.1` | Logging formatter for local/dev output. |

### Development dependencies (`MestreDoPC-V7/package.json`)
| Package | Version | Notes |
| --- | --- | --- |
| `@types/jest` | `29.5.14` | Jest type definitions. |
| `@types/node` | `20.19.41` | Node type definitions. |
| `@typescript-eslint/eslint-plugin` | `6.21.0` | Linting plugin. |
| `@typescript-eslint/parser` | `6.21.0` | Parser for ESLint. |
| `eslint` | `8.57.1` | Linting tool. |
| `jest` | `29.7.0` | Test runner. |
| `prettier` | `3.8.3` | Formatting tool. |
| `ts-jest` | `29.4.11` | Jest TS transformer. |
| `tsx` | `4.22.3` | TypeScript execution runtime. |
| `typescript` | `5.9.3` | TypeScript compiler. |

## Vulnerability findings

### High severity
- `@modelcontextprotocol/sdk@0.5.0`
  - Advisory: DNS rebinding protection disabled by default.
  - Fix target: `>=1.24.0` (npm audit suggests `1.29.0`).
  - Risk: runtime exposure for the MCP server transport layer.
- `@typescript-eslint/eslint-plugin@6.x`
- `@typescript-eslint/parser@6.x`
- `@typescript-eslint/typescript-estree@6.x`
- `@typescript-eslint/utils@6.x`
- `@typescript-eslint/type-utils@6.x`
- `brace-expansion` (transitive via ESLint stack)
- `minimatch` (transitive via `@typescript-eslint` stack)
- `js-yaml` (transitive via ESLint toolchain)

### Low severity
- `@babel/core` (transitive, dev environment)
- `esbuild` (transitive, dev environment)

## Risks and assessment
1. Runtime security risk is the highest priority because the vulnerable package is a direct dependency for the MCP integration layer.
2. The ESLint/TypeScript toolchain is currently carrying high-severity advisories and should be updated in a dedicated PR to reduce churn and keep validation predictable.
3. The dependency tree still includes several transitive packages that may be pulled by the dev toolchain; the update strategy should target the top-level packages first and let the lockfile resolve the rest.
4. The repository now has stable local build/test behavior, but future dependency upgrades should be validated with the same commands before merge:
   - `npm run build`
   - `npm test -- --runInBand`

## Recommended atomic PR plan

### PR 1 — Runtime security upgrade
- Update `@modelcontextprotocol/sdk` from `0.5.0` to `1.29.0`.
- Validate MCP server startup, tool registration, and integration tests.
- Reason: direct high-severity vulnerability and runtime impact.

### PR 2 — Linting and TypeScript toolchain refresh
- Update `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, and related transitive lint packages to the latest compatible major versions.
- Verify ESLint configuration, formatter behavior, and lint script output.
- Reason: removes the majority of high-severity dev vulnerabilities with a contained scope.

### PR 3 — Test and type dependency modernization
- Update `jest`, `ts-jest`, `@types/jest`, and `@types/node` to current supported versions.
- Keep `typescript` aligned with the chosen Jest/ts-jest stack and re-run the full test suite.
- Reason: reduces test runner drift and prepares the project for future Node/runtime upgrades.

### PR 4 — Logging/runtime minor upgrades (optional, lower risk)
- Review `pino`, `pino-pretty`, `tsx`, and `prettier` updates separately.
- Reason: lower immediate security risk, but they provide a cleaner baseline for future stability work.

## Notes from the local review
- The local test suite was failing initially due to incorrect relative imports in nested test folders and a security error ordering issue in `src/mcp/tools/base.ts`.
- Those issues were corrected so the repository now builds and tests successfully locally.
- The dependency review should be treated as a follow-up to that stabilization work, not as a replacement for it.
