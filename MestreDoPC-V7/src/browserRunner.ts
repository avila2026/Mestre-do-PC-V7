import { createServer, IncomingMessage, ServerResponse } from 'http';
import { spawn } from 'child_process';
import { logger } from './infra/logger';
import { createAndStartServer } from './mcp/server';
import { getToolNames } from './mcp/tools/registry';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);

function openBrowser(url: string): void {
  try {
    const child = spawn('cmd.exe', ['/c', 'start', '', url], {
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    logger.info({ url }, 'Opened local browser window');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown browser error';
    logger.warn({ error: message }, 'Could not open browser automatically');
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mestre do PC V7</title>
    <style>
      body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 2rem; background: #0f172a; color: #f8fafc; }
      main { max-width: 720px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); padding: 2rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
      code { background: rgba(148, 163, 184, 0.2); padding: 0.2rem 0.4rem; border-radius: 6px; }
      a { color: #7dd3fc; }
      .pill { display: inline-block; padding: 0.4rem 0.75rem; border-radius: 999px; background: #2563eb; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Mestre do PC V7</h1>
      <p>O servidor MCP local está ativo e esta página foi aberta automaticamente no navegador.</p>
      <p>Use o endpoint <code>/health</code> para confirmar o estado ou <code>/tools</code> para listar as ferramentas disponíveis.</p>
      <div class="pill">Status: online</div>
    </main>
  </body>
</html>`;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const reqUrl = req.url ?? '/';
  const url = new URL(reqUrl, `http://${host}:${port}`);

  if (url.pathname === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'mestredopc-v7', port });
    return;
  }

  if (url.pathname === '/tools') {
    sendJson(res, 200, { tools: getToolNames() });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(port, host, () => {
  const address = server.address();
  if (!address || typeof address === 'string') {
    logger.error('Unable to determine local web address');
    process.exit(1);
  }

  const url = `http://${host}:${address.port}`;
  logger.info({ url }, 'Local web dashboard started');
  openBrowser(url);

  createAndStartServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message }, 'Failed to start MCP server');
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
