import { describe, expect, it } from 'vitest';
import { findLeaks, parseNeedles } from '../scripts/check-private.mjs';

// Настоящие строки списка здесь писать нельзя: этот файл попадает в git, и сторож нашёл бы их.
const needles = parseNeedles('# комментарий\n\nvpn.internal.example\nСекретная Папка\n');

describe('сторож check-private', () => {
  it('читает список без пустых строк и комментариев', () => {
    expect(needles).toEqual(['vpn.internal.example', 'Секретная Папка']);
  });

  it('находит подложенную строку без учёта регистра и называет место', () => {
    const leaks = findLeaks(
      [
        { path: 'docs/PLAN.md', content: 'первая строка\nадрес VPN.Internal.Example/keys\n' },
        { path: 'dist/client/assets/app.js', content: 'const a="секретная папка";' },
      ],
      needles,
    );
    expect(leaks).toEqual([
      { path: 'docs/PLAN.md', line: 2, needle: 'vpn.internal.example' },
      { path: 'dist/client/assets/app.js', line: 1, needle: 'Секретная Папка' },
    ]);
  });

  it('молчит, когда совпадений нет', () => {
    expect(findLeaks([{ path: 'README.md', content: 'vpn.example и секретная' }], needles)).toEqual([]);
  });
});
