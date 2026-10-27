<div align="center">

# Олег Барбашин

**Системный аналитик и разработчик ИИ-систем**<br>
Найду, где ИИ снимет рутину с ваших сотрудников, и научу команду с ним работать. Прототипы до вложений и документация, привязанная к коду. Новосибирск.

<a href="https://barbashin1970.github.io/portfolio/"><img src=".github/readme/open-site-ru.svg" alt="Открыть сайт" height="52"></a>&nbsp;
<a href="https://t.me/OlegBarbashin"><img src=".github/readme/telegram-ru.svg" alt="Написать в Telegram" height="52"></a>

[banksnab@gmail.com](mailto:banksnab@gmail.com) · [GitHub](https://github.com/Barbashin1970)

<sub>English version: [README-en.md](README-en.md)</sub>

</div>

---

## Что я делаю

Три вещи — и каждую можно проверить.

- **Где ИИ ускорит ваших сотрудников.** Разбираю цепочку бизнеса — как работа идёт от заявки до результата — и нахожу точки, где ИИ снимет рутину. Проверяем на ваших данных, а потом я учу персонал работать с ИИ на ваших задачах. Пример обучения — курс повышения квалификации для преподавателей НГУ.
- **Прототип, который можно потрогать.** Идея становится работающей системой по ссылке: интерфейс, данные, сценарии, а если нужно — ИИ-модуль на ваших данных. Решение о команде и бюджете вы принимаете после этого, а не вслепую.
- **Документация, привязанная к коду.** ТЗ и комплект по ГОСТ 19, отчёт о НИР и НИОКР. Каждое число в документе идёт вместе с командой, которой получено, а проверки роняют сборку, если документ разошёлся с кодом.

Инструменты: ИИ-агенты в редакторе кода, React и TypeScript для интерфейсов, Python и FastAPI для серверной части, Markdown и сборка DOCX по ГОСТ 19 для документов.

## Избранные проекты

**[РАГРАФ](https://ragraf.up.railway.app/)** — фреймворк, на котором собирают платформы управления. Ядро — это ИИ-система, основанная на знаниях: решение выносит правило, записанное человеком, а не обученная модель. Предметная область задаётся выбором датасетов и регламентов, не разработкой.<br>
<sub>FastAPI · DuckDB · RDF/SHACL · React · React Flow — [демо](https://ragraf.up.railway.app/) · [документация](https://github.com/Barbashin1970/DOCS/tree/main/RAGRAF_DOCS)</sub>

**[LEYKA](https://github.com/Barbashin1970/DOCS/tree/main/LEYKA_DOCS)** — канбан-доска и мессенджер в одном продукте: задачи, обсуждения и сроки команды — в одном окне, с ИИ-модератором и диалоговым ассистентом.<br>
<sub>FastAPI · SQLite · React · TanStack Query — [документация](https://github.com/Barbashin1970/DOCS/tree/main/LEYKA_DOCS); демо открывается только после входа</sub>

**[СИМА — открытые данные Новосибирска](https://nsk-opendata-bot.up.railway.app/)** — отвечает на вопросы о городе по открытым данным: отключения, воздух, транспорт, стройки — без нейросети в рантайме.<br>
<sub>Python · DuckDB · Open-Meteo · OpenStreetMap — [демо](https://nsk-opendata-bot.up.railway.app/) · [код](https://github.com/Barbashin1970/NSK_OpenData_Bot)</sub>

**[ИИ в учебном процессе](https://barbashin1970.github.io/PROMPT-Professor/)** — курс повышения квалификации для преподавателей НГУ: лекции, библиотека промптов, конструктор и тесты.<br>
<sub>Python · Markdown · PWA · JavaScript — [сайт курса](https://barbashin1970.github.io/PROMPT-Professor/) · [код](https://github.com/Barbashin1970/PROMPT-Professor)</sub>

**[Сигма-аудит](https://polinom-sigma-audit.up.railway.app/)** — проверяет публичный GitHub-репозиторий по 26 правилам методологии «Сигма» — за 30 секунд и без установки.<br>
<sub>Python · FastAPI · React · TypeScript — [демо](https://polinom-sigma-audit.up.railway.app/)</sub>

**[Платформа АРХИ](https://archi-nsu.vercel.app/)** — читает графики стройки, применяет регламенты и сама пишет ответственному, когда норма нарушена: объект, предписание, срок.<br>
<sub>FastAPI · SQLite · aiogram · JavaScript — [демо](https://archi-nsu.vercel.app/) · [документация](https://github.com/Barbashin1970/DOCS/tree/main/ARCHI-NSU)</sub>

Всего на витрине 30 проектов, у 26 есть живое демо. Рабочие — в каталоге на сайте, в шести отраслях с фильтром: стройка и промышленность, город и безопасность, наука, образование, бизнес, здоровье. Игры — отдельным блоком, для отдыха.

## Как я работаю: SKICODING

Мой стиль работы с проектами — **ски-кодинг**. Текст и код идут через шаг, как лыжные следы: разбор — код — документы — код. Каждый шаг оставляет то, что можно проверить: документ, коммит, тест.

- **Разбор — до кода.** Сначала карта: что есть, чего не хватает, что делаем сейчас и что откладываем.
- **Шаг не закончен, пока не обновлены документы,** которых он коснулся. Документация не отстаёт от кода.
- **Отложенное записано** в бэклог — с причиной и признаком «когда пора».
- **Число идёт вместе с командой,** которой оно получено. Ненаписанное названо ненаписанным.
- **У каждой фазы есть проверка,** которая без неё падает.

Так держится темп между двумя капканами: «гонкой кода», когда через неделю никто не помнит, почему сделано так, и «параличом документов», когда тексты устаревают раньше, чем появляется код. Заказчик в любой момент видит, что сделано, что отложено и чем это подтверждается.

Метод сложился в проекте РАГРАФ в мае 2026 года. Он опубликован как навык для ИИ-агентов: [SKICODING в NSU-AI-SKILLS](https://github.com/Barbashin1970/NSU-AI-SKILLS/tree/main/skills/skicoding). Этот репозиторий ведётся так же: [план](docs/PLAN.md), [разбор фазы](docs/FAZA-2-RAZBOR.md), [бэклог](docs/BEKLOG.md), [сценарии использования](docs/USE-CASES.md).

## Этот репозиторий

Исходный код сайта-портфолио. Страницы собираются заранее, при сборке, и публикуются на GitHub Pages: поисковик получает готовый текст, а первый экран не ждёт JavaScript.

**Состояние на 2026-10-27:** готовы фазы 1 и 2 из 3 — первый экран с живым графом, избранное с горизонтальной прокруткой, каталог по отраслям с картинками и видео демо, контакт. Дальше — английская версия, SEO и Lighthouse. Опись проектов и числа с командами, которыми они получены, — в [docs/INVENTORY.md](docs/INVENTORY.md).

**Стек:** Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui · GSAP + ScrollTrigger · Lenis · React Bits.

```bash
nvm use          # Node 22 из .nvmrc
npm ci
npm run dev      # http://localhost:5173/portfolio/
npm run check    # линтер, типы, тесты, сборка
```

## Контакты

- Telegram: [@OlegBarbashin](https://t.me/OlegBarbashin)
- Почта: [banksnab@gmail.com](mailto:banksnab@gmail.com)
- GitHub: [Barbashin1970](https://github.com/Barbashin1970)

## Лицензии и компоненты

**Код сайта — [MIT](LICENSE):** берите с указанием авторства. MIT не распространяется на тексты сайта и описания проектов (`src/i18n`, тексты в `src/data`), документы в `docs/` и изображения — они © Олег Барбашин, 2026, все права защищены.

Чужие компоненты остаются под своими лицензиями:

| Компонент | Где на сайте | Лицензия |
|---|---|---|
| [React Bits](https://reactbits.dev) — SplitText, Magnet, Particles, TiltedCard; адаптированные копии в [`src/components/fx`](src/components/fx) | буквы заголовка, «магнитные» кнопки, живой граф, наклон картинок каталога | MIT + Commons Clause — [src/components/fx/LICENSE](src/components/fx/LICENSE): в составе сайта можно, продавать или раздавать сами компоненты нельзя |
| [shadcn/ui](https://ui.shadcn.com) — кнопка, копия в `src/components/ui` | кнопки | MIT |
| [GSAP](https://gsap.com) и @gsap/react | вся анимация | [стандартная бесплатная лицензия GSAP](https://gsap.com/standard-license) |
| [Lenis](https://github.com/darkroomengineering/lenis) | плавная прокрутка | MIT |
| React, Vite, Tailwind CSS, Radix UI, clsx, tailwind-merge | интерфейс и сборка | MIT |
| class-variance-authority | варианты кнопок | Apache-2.0 |
| [Lucide](https://lucide.dev) | иконки | ISC |
| Шрифты Geologica, Onest, JetBrains Mono ([Fontsource](https://fontsource.org)) | заголовки, текст, метки | SIL OFL 1.1 |

Лицензии пакетов сверены по их `package.json` 2026-10-26.
