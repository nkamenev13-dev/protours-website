import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./dist', import.meta.url));
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function findFile(pathname) {
  const path = resolve(root, `.${pathname}`);
  if (path !== root && !path.startsWith(`${root}${sep}`)) return null;

  const candidates = pathname.endsWith('/') ? [join(path, 'index.html')]
    : extname(path) ? [path] : [`${path}.html`, join(path, 'index.html')];
  for (const candidate of candidates) {
    const info = await stat(candidate).catch(error => {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
    });
    if (info?.isFile()) return { path: candidate, size: info.size, directory: candidate === join(path, 'index.html') };
  }
  return null;
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let url;
  let pathname;
  try {
    url = new URL(req.url, 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) throw new Error('Invalid path');
  } catch {
    res.writeHead(400).end();
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': types['.txt'] }).end('ok');
    return;
  }

  try {
    const file = await findFile(pathname);
    if (!file) {
      res.writeHead(404, { 'Content-Type': types['.txt'] }).end('Not found');
      return;
    }
    if (file.directory && !pathname.endsWith('/')) {
      const directory = url.pathname.replace(/^\/+/, '/');
      res.writeHead(308, { Location: `${directory}/${url.search}` }).end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[extname(file.path)] ?? 'application/octet-stream',
      'Content-Length': file.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else await pipeline(createReadStream(file.path), res);
  } catch (error) {
    if (error.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error(error);
    if (!res.headersSent) res.writeHead(500).end();
  }
}).listen(Number(process.env.PORT ?? 8080), '0.0.0.0');
