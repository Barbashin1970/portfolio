/**
 * Видео демо для карточки: H.264, 30 кадров, без звука, faststart — играет до полной загрузки.
 * Ширина 960 px у горизонтальных записей экрана и 360 px у записей с телефона.
 *
 *   node scripts/encode-video.mjs <файл> <slug> [--portrait] [--crop-top N] [--seconds S]
 *
 * --crop-top срезает сверху N пикселей исходника: так у игр убрана рамка мини-приложения
 * Telegram (180 px). Результат — public/media/<slug>.mp4; затем строка в VIDEOS
 * (src/data/media.ts) — тест проверит, что файл на месте.
 *
 * ffmpeg — из FFMPEG_PATH или из PATH. В проект он не ставится: иначе CI качал бы
 * 70 МБ на каждой сборке. Разово: `npm i ffmpeg-static` в отдельной папке и
 * FFMPEG_PATH=<папка>/node_modules/ffmpeg-static/ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const [source, slug] = args.filter((arg, i) => !arg.startsWith('--') && !args[i - 1]?.match(/^--(crop-top|seconds)$/));
if (!source || !slug) {
  console.error('Использование: node scripts/encode-video.mjs <файл> <slug> [--portrait] [--crop-top N] [--seconds S]');
  process.exit(1);
}

const portrait = args.includes('--portrait');
const cropTop = Number(option('--crop-top') ?? 0);
const seconds = option('--seconds') ?? (portrait ? '12' : '14');
const filters = [cropTop ? `crop=iw:ih-${cropTop}:0:${cropTop}` : null, `scale=${portrait ? 360 : 960}:-2`, 'fps=30'];
const out = fileURLToPath(new URL(`../public/media/${slug}.mp4`, import.meta.url));

execFileSync(process.env.FFMPEG_PATH ?? 'ffmpeg', [
  '-v', 'error', '-y', '-i', source, '-t', seconds,
  '-vf', filters.filter(Boolean).join(','),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'main',
  '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out,
]);
console.log(`${slug}: ${Math.round(statSync(out).size / 1024)} КБ → public/media/${slug}.mp4`);
