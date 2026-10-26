/**
 * Раздача dist/client с той же приставкой, что на Pages (/portfolio/), — для проверок
 * в браузере. Дополнительные страницы (проба вёрстки) кладутся в `extra`.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/** Приставка адресов — из собранного index.html, как в scripts/prerender.mjs. */
export function baseOf(dir) {
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  const base = /(?:src|href)="([^"]*)assets\//.exec(html)?.[1];
  if (!base) throw new Error('В dist/client/index.html нет адресов assets/ — сначала npm run build');
  return base;
}

export function startServer(dir, extra = {}) {
  const base = baseOf(dir);
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (extra[path]) {
      res.writeHead(200, { 'content-type': TYPES['.html'] });
      res.end(extra[path]);
      return;
    }
    if (!path.startsWith(base)) {
      res.writeHead(404).end();
      return;
    }
    let file = normalize(join(dir, path.slice(base.length)));
    if (!file.startsWith(dir)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ origin: `http://127.0.0.1:${port}`, base, close: () => new Promise((done) => server.close(done)) });
    });
  });
}
