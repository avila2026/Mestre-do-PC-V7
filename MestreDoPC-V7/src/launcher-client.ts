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

interface RunResponse {
  jobId: string;
  status: string;
}

interface RunStatusResponse {
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

async function postWithRetry(
  url: string,
  command: string,
  requestLogger: typeof logger,
  retries = MAX_RETRIES
): Promise<RunResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const attemptStart = Date.now();
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

      requestLogger.debug({ attempt, latencyMs: Date.now() - attemptStart }, 'Launcher submit attempt succeeded');
      return await (response.json() as Promise<RunResponse>);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      requestLogger.warn(
        { attempt, maxRetries: retries, latencyMs: Date.now() - attemptStart, error: lastError.message },
        'Retry attempt'
      );

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw lastError || new Error('Failed to execute command after all retries');
}

async function pollForCompletion(
  jobId: string,
  requestLogger: typeof logger,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<RunStatusResponse> {
  const startTime = Date.now();
  const pollInterval = 1000;

  while (Date.now() - startTime < timeoutMs) {
    const pollStart = Date.now();
    try {
      const response = await fetch(`${LAUNCHER_BASE_URL}/run-status?jobId=${jobId}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const status = await (response.json() as Promise<RunStatusResponse>);
      const elapsedMs = Date.now() - startTime;
      const pollLatencyMs = Date.now() - pollStart;

      if (status.status !== 'running') {
        requestLogger.info({ jobId, elapsedMs, pollLatencyMs, status: status.status }, 'Launcher job completed state observed');
        return status;
      }

      requestLogger.debug({ jobId, elapsedMs, pollLatencyMs }, 'Still running');
    } catch (error) {
      requestLogger.warn({ jobId, error: (error as Error).message, pollLatencyMs: Date.now() - pollStart }, 'Polling error');
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timeout waiting for job ${jobId} to complete`);
}

export async function executeLauncherCommand(
  toolName: string,
  params: Record<string, string>,
  correlationId?: string
): Promise<any> {
  const requestLogger = logger.child({ correlationId, toolName, params: Object.keys(params) });
  const executionStart = Date.now();

  const validation = validateToolParams(toolName, params);
  if (!validation.isValid) {
    requestLogger.warn({ errors: validation.errors }, 'Invalid parameters');
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }

  for (const [key, value] of Object.entries(params)) {
    if (detectInjection(value)) {
      requestLogger.error({ param: key }, 'Potential injection detected');
      throw new Error(`Security violation: potential command injection in parameter '${key}'`);
    }
  }

  const safeCommand = buildSafeCommand(toolName, params);
  requestLogger.info('Executing safe command');

  if (process.env.SIMULATION_MODE === 'true') {
    requestLogger.info({ totalDurationMs: Date.now() - executionStart }, 'Simulation mode - command not executed');
    return {
      simulated: true,
      command: safeCommand,
      message: 'Command would be executed in simulation mode',
    };
  }

  try {
    const runResponse = await postWithRetry(`${LAUNCHER_BASE_URL}/run`, safeCommand, requestLogger);
    requestLogger.info({ jobId: runResponse.jobId }, 'Command submitted to launcher');

    const result = await pollForCompletion(runResponse.jobId, requestLogger);

    if (result.status === 'failed') {
      throw new Error(result.error || 'Job failed without error message');
    }

    requestLogger.info({ totalDurationMs: Date.now() - executionStart }, 'Tool execution finished');
    return result.result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    requestLogger.error({ error: errorMessage, totalDurationMs: Date.now() - executionStart }, 'Execution failed');
    throw error;
  }
}
