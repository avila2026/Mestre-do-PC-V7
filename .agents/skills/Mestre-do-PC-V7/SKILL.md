```markdown
# Mestre-do-PC-V7 Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the Mestre-do-PC-V7 JavaScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. While no frameworks or automated workflows were detected, this guide will help you contribute code that fits seamlessly into the project.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.js`, `calculateScore.js`

### Import Style
- Use **relative imports** for modules.
  - Example:
    ```javascript
    import { calculateScore } from './calculateScore.js';
    ```

### Export Style
- Use **named exports**.
  - Example:
    ```javascript
    // In calculateScore.js
    export function calculateScore(data) {
      // ...
    }
    ```
    ```javascript
    // In another file
    import { calculateScore } from './calculateScore.js';
    ```

### Commit Messages
- Follow the **conventional commit** format.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average 48 characters).
  - Example:
    ```
    feat: add user profile validation logic
    ```

## Workflows

_No automated workflows were detected in this repository._

## Testing Patterns

- Test files use the `*.test.*` naming pattern.
  - Example: `calculateScore.test.js`
- The testing framework is **unknown**, but tests are likely colocated with source files or in a dedicated test directory.
- Example test file structure:
  ```javascript
  // calculateScore.test.js
  import { calculateScore } from './calculateScore.js';

  test('returns correct score for valid input', () => {
    expect(calculateScore({ points: 10 })).toBe(10);
  });
  ```

## Commands

| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| /commit-feat   | Start a new feature commit                |
| /run-tests     | Run all test files matching *.test.*      |
| /add-module    | Add a new module using camelCase naming   |
| /import-module | Import a module using relative path       |
```