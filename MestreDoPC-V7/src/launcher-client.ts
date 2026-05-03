/**
 * Launcher Client for MestreDoPC V7
 * 
 * Communicates with MestreDoPC-Launcher.ps1 via HTTP (port 7777)
 * to execute PowerShell commands safely.
 */

import { logger } from './logger.js';
import { buildSafeCommand, detectInjection } from './security/sanitizer.js';
import { validateToolParams } from './security/whitelist.js';

/**
 * Launcher configuration
 */
const LAUNCHER_BASE_URL = process.env.LAUNCHER_URL || 'http://localhost:7777';
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Response from launcher /run endpoint
 */
interface RunResponse {
  jobId: string;
  status: string;
}

/**
 * Response from launcher /run-status endpoint
 */
interface RunStatusResponse {
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Executes a command via the launcher with retry logic
 * 
 * @param url - The URL to POST to
 * @param command - The PowerShell command to execute
 * @param retries - Number of retry attempts
 * @returns The run response with jobId
 */
async function postWithRetry(
  url: string,
  command: string,
  retries = MAX_RETRIES
): Promise<RunResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await (response.json() as Promise<RunResponse>);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      logger.warn({ attempt, maxRetries: retries, error: lastError.message }, 'Retry attempt');

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw lastError || new Error('Failed to execute command after all retries');
}

/**
 * Polls for command completion with timeout
 * 
 * @param jobId - The job identifier to poll
 * @param timeoutMs - Maximum time to wait for completion
 * @returns The final status response
 */
async function pollForCompletion(
  jobId: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<RunStatusResponse> {
  const startTime = Date.now();
  const pollInterval = 1000; // 1 second

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`${LAUNCHER_BASE_URL}/run-status?jobId=${jobId}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const status = await (response.json() as Promise<RunStatusResponse>);

      if (status.status !== 'running') {
        return status;
      }

      logger.debug({ jobId, elapsedMs: Date.now() - startTime }, 'Still running');
    } catch (error) {
      logger.warn({ jobId, error: (error as Error).message }, 'Polling error');
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timeout waiting for job ${jobId} to complete`);
}

/**
 * Executes a launcher command with full security validation
 * 
 * @param toolName - The name of the tool to execute
 * @param params - Tool parameters
 * @returns Execution result
 * 
 * @example
 * executeLauncherCommand('limpeza_rapida_completa', { dryRun: 'true' })
 */
export async function executeLauncherCommand(
  toolName: string,
  params: Record<string, string>
): Promise<any> {
  const requestLogger = logger.child({ toolName, params: Object.keys(params) });

  // Validate parameters against whitelist
  const validation = validateToolParams(toolName, params);
  if (!validation.isValid) {
    requestLogger.warn({ errors: validation.errors }, 'Invalid parameters');
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }

  // Check for injection attempts
  for (const [key, value] of Object.entries(params)) {
    if (detectInjection(value)) {
      requestLogger.error({ param: key }, 'Potential injection detected');
      throw new Error(`Security violation: potential command injection in parameter '${key}'`);
    }
  }

  // Build safe command
  const safeCommand = buildSafeCommand(toolName, params);
  requestLogger.info('Executing safe command');

  // Check for simulation mode
  if (process.env.SIMULATION_MODE === 'true') {
    requestLogger.info('Simulation mode - command not executed');
    return {
      simulated: true,
      command: safeCommand,
      message: 'Command would be executed in simulation mode',
    };
  }

  // Execute via launcher
  try {
    const runResponse = await postWithRetry(`${LAUNCHER_BASE_URL}/run`, safeCommand);
    requestLogger.info({ jobId: runResponse.jobId }, 'Command submitted to launcher');

    const result = await pollForCompletion(runResponse.jobId);
    requestLogger.info({ status: result.status }, 'Job completed');

    if (result.status === 'failed') {
      throw new Error(result.error || 'Job failed without error message');
    }

    return result.result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    requestLogger.error({ error: errorMessage }, 'Execution failed');
    throw error;
  }
}
