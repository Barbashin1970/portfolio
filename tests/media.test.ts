import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PHOTO } from '@/data/media';

/**
 * Медиа в открытом репозитории (Р-14, Р-52): история git публична навсегда, поэтому в файлах
 * нет ни места съёмки, ни модели телефона. Снимок с телефона несёт их в EXIF — в WebP блоков
 * EXIF и XMP нет; в видео нет атомов места QuickTime. У фото Олега размеры файлов — как
 * в данных: по ним страница держит место до загрузки.
 */
const pub = (path: string) => new URL(`../public/${path}`, import.meta.url);
const files = readdirSync(pub('media'));

/** Блоки RIFF-контейнера WebP по порядку: 'VP8 ', 'VP8X', 'ICCP', 'EXIF', 'XMP '… */
function chunks(data: Buffer) {
  const found: { tag: string; offset: number }[] = [];
  for (let i = 12; i + 8 <= data.length; ) {
    const size = data.readUInt32LE(i + 4);
    found.push({ tag: data.toString('latin1', i, i + 4), offset: i + 8 });
    i += 8 + size + (size % 2);
  }
  return found;
}

/** Размер кадра из блока 'VP8 ': после метки кадра и стартового кода — по 14 бит ширины и высоты. */
function frameSize(data: Buffer) {
  const vp8 = chunks(data).find((chunk) => chunk.tag === 'VP8 ');
  if (!vp8) return null;
  return { width: data.readUInt16LE(vp8.offset + 6) & 0x3fff, height: data.readUInt16LE(vp8.offset + 8) & 0x3fff };
}

describe('медиа без метаданных съёмки (Р-52)', () => {
  it('в WebP нет блоков EXIF и XMP', () => {
    const webp = files.filter((file) => file.endsWith('.webp'));
    expect(webp.length).toBeGreaterThan(0);
    for (const file of webp) {
      const data = readFileSync(pub(`media/${file}`));
      expect(data.toString('latin1', 0, 4) + data.toString('latin1', 8, 12), file).toBe('RIFFWEBP');
      const tags = chunks(data).map((chunk) => chunk.tag);
      // Контроль разбора: сам кадр нашёлся — иначе отсутствие EXIF ничего не значит.
      expect(tags.some((tag) => tag.startsWith('VP8')), `${file}: ${tags.join(',')}`).toBe(true);
      expect(tags, file).not.toContain('EXIF');
      expect(tags, file).not.toContain('XMP ');
    }
  });

  it('в видео нет места съёмки', () => {
    const videos = files.filter((file) => file.endsWith('.mp4'));
    expect(videos.length).toBeGreaterThan(0);
    for (const file of videos) {
      const data = readFileSync(pub(`media/${file}`));
      expect(data.includes(Buffer.from([0xa9, 0x78, 0x79, 0x7a])), `${file}: атом ©xyz`).toBe(false);
      expect(data.includes('com.apple.quicktime.location'), `${file}: location.ISO6709`).toBe(false);
    }
  });

  it('фото Олега: файлы есть, размеры — как в данных', () => {
    for (const photo of Object.values(PHOTO)) {
      expect(frameSize(readFileSync(pub(photo.file))), photo.file).toEqual({ width: photo.width, height: photo.height });
    }
  });
});
