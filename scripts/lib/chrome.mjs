/**
 * Headless Chrome по протоколу DevTools — без Puppeteer: WebSocket встроен в Node 22.
 * Эмуляция устройства вместо окна нужной ширины: окно headless Chrome на macOS
 * не сужается меньше 500 px. Время настоящее — под --virtual-time-budget
 * CSS-анимации и requestAnimationFrame стоят, и интро не доходит до конца.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const CHROME =
  process.env.CHROME_PATH ??
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    (path) => existsSync(path),
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function launchChrome() {
  if (!CHROME) throw new Error('Не нашёл Chrome — задайте CHROME_PATH');
  const profile = mkdtempSync(join(tmpdir(), 'portfolio-chrome-'));
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const wsUrl = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Chrome не открыл порт DevTools за 15 с')), 15000);
    proc.stderr.on('data', (chunk) => {
      log += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(log);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    proc.on('exit', (code) => reject(new Error(`Chrome завершился с кодом ${code}`)));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('Не подключиться к DevTools'));
  });
  let lastId = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const waiter = message.id && pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
    else waiter.resolve(message.result);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++lastId;
      pending.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  /** Вкладка с эмуляцией экрана и, если нужно, reduced-motion. */
  async function openPage({ width, height, mobile, scale = 1, reduce = false }) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const call = (method, params) => send(method, params, sessionId);
    await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
    if (reduce) {
      await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    }
    const evaluate = async (expression) => {
      const { result, exceptionDetails } = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(`Ошибка в странице: ${exceptionDetails.text}`);
      return result.value;
    };
    return {
      /** Любой метод протокола DevTools — например, Input.synthesizeScrollGesture. */
      call,
      goto: (url) => call('Page.navigate', { url }),
      evaluate,
      /** Ждёт, пока выражение станет истинным; false — не дождались. */
      async until(expression, timeoutMs) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          if (await evaluate(expression).catch(() => false)) return true;
          await sleep(200);
        }
        return false;
      },
      screenshot: async () => Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'),
      close: () => send('Target.closeTarget', { targetId }),
    };
  }

  return {
    openPage,
    async close() {
      ws.close();
      proc.kill();
      await sleep(300);
      rmSync(profile, { recursive: true, force: true });
    },
  };
}
