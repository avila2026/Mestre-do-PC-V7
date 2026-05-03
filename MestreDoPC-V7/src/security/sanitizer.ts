/**
 * Command Sanitizer for MestreDoPC V7
 * 
 * Prevents command injection by escaping dangerous characters
 * and validating PowerShell parameters.
 */

/**
 * Characters that need escaping in PowerShell commands
 * Note: backtick is NOT included as it's the escape character itself
 */
const DANGEROUS_CHARS = [';', '&', '|', '>', '<', '$', '"', "'", '(', ')', '{', '}', '[', ']', '*', '?', '@'];

/**
 * Escapes dangerous characters in a string to prevent command injection
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string with escaped characters
 * 
 * @example
 * escapeString('foo; rm -rf /') // 'foo`; rm -rf /'
 * escapeString('test&echo') // 'test`&echo'
 */
export function escapeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  let result = input;
  for (const char of DANGEROUS_CHARS) {
    result = result.replace(new RegExp(`\\${char}`, 'g'), `\`${char}`);
  }

  return result;
}

/**
 * Validates that a parameter name matches allowed pattern
 * 
 * @param paramName - The parameter name to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * isValidParamName('processName') // true
 * isValidParamName('foo;rm') // false
 */
export function isValidParamName(paramName: string): boolean {
  const paramPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return paramPattern.test(paramName);
}

/**
 * Encodes a command to Base64 for safe execution via -EncodedCommand
 * 
 * @param command - The PowerShell command to encode
 * @returns Base64 encoded string (UTF-16LE as required by PowerShell)
 * 
 * @example
 * encodeCommand('Get-Process -Name "notepad"') // 'RwBlAHQALQBQAHIAbwBjAGUAcwBzACAALQBOAGEAbQBlACA AIABuAG8AdABlAHAAYQBkAA=='
 */
export function encodeCommand(command: string): string {
  const buffer = Buffer.from(command, 'utf16le');
  return buffer.toString('base64');
}

/**
 * Builds a safe PowerShell command using -EncodedCommand
 * 
 * @param baseCommand - The base PowerShell command
 * @param args - Optional arguments (will be escaped)
 * @returns Full encoded command ready for execution
 * 
 * @example
 * buildSafeCommand('Get-Process', { Name: 'notepad' })
 * // 'powershell -EncodedCommand RwBlAHQALQ...=='
 */
export function buildSafeCommand(baseCommand: string, args?: Record<string, string>): string {
  let command = baseCommand.trim();

  if (args) {
    const escapedArgs: string[] = [];
    for (const [key, value] of Object.entries(args)) {
      if (!isValidParamName(key)) {
        throw new Error(`Invalid parameter name: ${key}`);
      }
      const escapedValue = escapeString(value);
      escapedArgs.push(`-${key} "${escapedValue}"`);
    }
    command = `${command} ${escapedArgs.join(' ')}`;
  }

  const encoded = encodeCommand(command);
  return `powershell -EncodedCommand ${encoded}`;
}

/**
 * Detects potential command injection attempts
 * 
 * @param input - The string to analyze
 * @returns true if injection is detected, false otherwise
 * 
 * @example
 * detectInjection('notepad') // false
 * detectInjection('foo; rm -rf /') // true
 */
export function detectInjection(input: string): boolean {
  const injectionPatterns = [
    /[;&|]/, // Command separators
    /[<>]/, // Redirection
    /\$\(/, // Command substitution
    /`[^`]/, // Escaped characters
    /\b(rm|del|remove|format|partition)\b/i, // Destructive commands
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}
