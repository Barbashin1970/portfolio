/**
 * Видео демо для карточки: H.264, 30 кадров, без звука, faststart — играет до полной загрузки.
 * Ширина 960 px у горизонтальных записей экрана и 360 px у записей с телефона.
 *
 *   node scripts/encode-video.mjs <файл> <slug> [--portrait] [--crop-top N | --crop W:H:X:Y]
 *                                 [--seconds S | --keep A-B,C-D] [--blur X:Y:W:H@A-B,C-D]
 *
 * --crop-top срезает сверху N пикселей исходника: так у игр убрана рамка мини-приложения
 * Telegram (180 px). --crop оставляет прямоугольник W×H с левым верхним углом X:Y.
 * --keep оставляет из исходника отрезки и склеивает их по порядку; без него берутся
 * первые S секунд. --blur размывает прямоугольник в указанные секунды. Пиксели и секунды
 * в --keep и --blur — исходника, до обрезки: их удобно снимать с кадров записи.
 * Так у LEYKA размыто поле «Исполнитель» с именами коллег (docs/VITRINA-RAZBOR.md).
 *
 * Результат — public/media/<slug>.mp4; затем строка в VIDEOS (src/data/media.ts) — тест
 * проверит, что файл на месте.
 *
 * ffmpeg — из FFMPEG_PATH или из PATH. В проект он не ставится: иначе CI качал бы
 * 70 МБ на каждой сборке. Разово: `npm i ffmpeg-static` в отдельной папке и
 * FFMPEG_PATH=<папка>/node_modules/ffmpeg-static/ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const VALUED = /^--(crop-top|crop|seconds|keep|blur)$/;
const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const [source, slug] = args.filter((arg, i) => !arg.startsWith('--') && !VALUED.test(args[i - 1] ?? ''));
if (!source || !slug) {
  console.error(
    'Использование: node scripts/encode-video.mjs <файл> <slug> [--portrait] [--crop-top N | --crop W:H:X:Y] [--seconds S | --keep A-B,C-D] [--blur X:Y:W:H@A-B,C-D]',
  );
  process.exit(1);
}

const portrait = args.includes('--portrait');
const cropTop = Number(option('--crop-top') ?? 0);
const crop = option('--crop');
const seconds = option('--seconds') ?? (portrait ? '12' : '14');
const ranges = (text) => text.split(',').map((range) => range.split('-').map(Number));
const keep = option('--keep') ? ranges(option('--keep')) : null;
const blur = option('--blur');

// Граф фильтров: размытие → отрезки → обрезка, масштаб, 30 кадров.
const graph = [];
let input = '0:v';
if (blur) {
  const [box, times] = blur.split('@');
  const [x, y, w, h] = box.split(':').map(Number);
  // Радиус размытия: не больше половины меньшей стороны, у цвета — вдвое меньше (yuv420).
  const radius = Math.min(16, Math.floor(Math.min(w, h) / 2) - 1);
  const enable = ranges(times)
    .map(([from, to]) => `between(t,${from},${to})`)
    .join('+');
  graph.push(
    `[${input}]split[base][patch]`,
    `[patch]crop=${w}:${h}:${x}:${y},boxblur=${radius}:3:${Math.floor(radius / 2)}:3[blurred]`,
    `[base][blurred]overlay=${x}:${y}:enable='${enable}'[masked]`,
  );
  input = 'masked';
}
if (keep) {
  graph.push(`[${input}]split=${keep.length}${keep.map((_, i) => `[k${i}]`).join('')}`);
  keep.forEach(([from, to], i) => graph.push(`[k${i}]trim=start=${from}:end=${to},setpts=PTS-STARTPTS[p${i}]`));
  graph.push(`${keep.map((_, i) => `[p${i}]`).join('')}concat=n=${keep.length}:v=1:a=0[joined]`);
  input = 'joined';
}
const frame = [
  crop ? `crop=${crop}` : cropTop ? `crop=iw:ih-${cropTop}:0:${cropTop}` : null,
  `scale=${portrait ? 360 : 960}:-2`,
  'fps=30',
];
graph.push(`[${input}]${frame.filter(Boolean).join(',')}[out]`);

const out = fileURLToPath(new URL(`../public/media/${slug}.mp4`, import.meta.url));
execFileSync(process.env.FFMPEG_PATH ?? 'ffmpeg', [
  '-v', 'error', '-y', '-i', source, ...(keep ? [] : ['-t', seconds]),
  '-filter_complex', graph.join(';'), '-map', '[out]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'main',
  '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out,
]);
console.log(`${slug}: ${Math.round(statSync(out).size / 1024)} КБ → public/media/${slug}.mp4`);
