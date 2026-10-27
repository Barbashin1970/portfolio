<div align="center">

# Олег Барбашин

**Системный аналитик и разработчик ИИ-систем**<br>
От идеи и ТЗ до работающего прототипа — для НГУ, промышленности и стройки. Новосибирск.

<a href="https://barbashin1970.github.io/portfolio/"><img src=".github/readme/open-site-ru.svg" alt="Открыть сайт" height="52"></a>&nbsp;
<a href="https://t.me/OlegBarbashin"><img src=".github/readme/telegram-ru.svg" alt="Написать в Telegram" height="52"></a>

[banksnab@gmail.com](mailto:banksnab@gmail.com) · [GitHub](https://github.com/Barbashin1970)

<sub>English version: [README-en.md](README-en.md)</sub>

</div>

---

## Что я делаю

- **ИИ, который можно проверить.** Гибридный ИИ и ИИ-агенты: решение принимает записанное правило, а система показывает входные данные, формулу и порог.
- **Семантические графы.** RDF и SHACL — онтологии норм и регламентов, по которым работают ассистенты для стройки и охраны труда.
- **Цифровые платформы** для вуза и промышленности — от управления проектами Центра ИИ НГУ до контроля графиков стройки.
- **ТЗ и документация по ГОСТ 19**, отчёты о НИОКР — и инструменты, которые собирают их из Markdown.
- **Прототипы по ссылке:** сайты, PWA, тренажёры и игры. Заказчик открывает и трогает систему, а не смотрит макет в презентации.

## Избранные проекты

**[РАГРАФ](https://ragraf.up.railway.app/)** — ИИ, который можно проверить: каждое решение предъявляет входные данные, формулу и порог.<br>
<sub>FastAPI · DuckDB · RDF/SHACL · React · React Flow — [демо](https://ragraf.up.railway.app/) · [документация](https://github.com/Barbashin1970/DOCS/tree/main/RAGRAF_DOCS)</sub>

**[Сигма — ситуационный центр](https://sigma-operator.vercel.app/operator/hospital-fire)** — ИИ-подсказки оператору ЕДДС: сценарии ЧП, видеостена и тренажёр с аттестацией.<br>
<sub>React 19 · Vite 8 · Tailwind 4 · TypeScript — [демо](https://sigma-operator.vercel.app/operator/hospital-fire) · [код](https://github.com/Barbashin1970/demo-sigma-main)</sub>

**[СИМА — открытые данные Новосибирска](https://nsk-opendata-bot.up.railway.app/)** — отвечает на вопросы о городе по открытым данным: отключения, воздух, транспорт, стройки — без нейросети в рантайме.<br>
<sub>Python · DuckDB · Open-Meteo · OpenStreetMap — [демо](https://nsk-opendata-bot.up.railway.app/) · [код](https://github.com/Barbashin1970/NSK_OpenData_Bot)</sub>

**[ИИ в учебном процессе](https://barbashin1970.github.io/PROMPT-Professor/)** — курс повышения квалификации для преподавателей НГУ: лекции, библиотека промптов, конструктор и тесты.<br>
<sub>Python · Markdown · PWA · JavaScript — [сайт курса](https://barbashin1970.github.io/PROMPT-Professor/) · [код](https://github.com/Barbashin1970/PROMPT-Professor)</sub>

На сайте — каталог всех 28 проектов по семи отраслям: стройка и промышленность, город и безопасность, наука, образование, бизнес, здоровье, игры. У 24 есть живое демо.

## Как я работаю: SKICODING

Мой стиль работы с проектами — **ски-кодинг**. Текст и код идут через шаг, как лыжные следы: разбор — код — документы — код. Каждый шаг оставляет то, что можно проверить: документ, коммит, тест.

- **Разбор — до кода.** Сначала карта: что есть, чего не хватает, что делаем сейчас и что откладываем.
- **Шаг не закончен, пока не обновлены документы,** которых он коснулся. Документация не отстаёт от кода.
- **Отложенное записано** в бэклог — с причиной и признаком «когда пора».
- **Число идёт вместе с командой,** которой оно получено. Ненаписанное названо ненаписанным.
- **У каждой фазы есть проверка,** которая без неё падает.

Так держится темп между двумя капканами: «гонкой кода», когда через неделю никто не помнит, почему сделано так, и «параличом документов», когда тексты устаревают раньше, чем появляется код. Заказчик в любой момент видит, что сделано, что отложено и чем это подтверждается.

Метод сложился в проекте РАГРАФ в мае 2026 года. Он опубликован как навык для ИИ-агентов: [SKICODING в NSU-AI-SKILLS](https://github.com/Barbashin1970/NSU-AI-SKILLS/tree/main/skills/skicoding). Этот репозиторий ведётся так же: [план](docs/PLAN.md), [разбор фазы](docs/FAZA-1-RAZBOR.md), [бэклог](docs/BEKLOG.md), [сценарии использования](docs/USE-CASES.md).

## Этот репозиторий

Исходный код сайта-портфолио. Страницы собираются заранее, при сборке, и публикуются на GitHub Pages: поисковик получает готовый текст, а первый экран не ждёт JavaScript.

**Состояние на 2026-10-26:** готова фаза 1 из 3 — каркас, дизайн-токены, плавная прокрутка и первый экран с живым графом. Дальше — карточки проектов и каталог по отраслям. Опись проектов и числа с командами, которыми они получены, — в [docs/INVENTORY.md](docs/INVENTORY.md).

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
| [React Bits](https://reactbits.dev) — SplitText, Magnet, Particles; адаптированные копии в [`src/components/fx`](src/components/fx) | буквы заголовка, «магнитные» кнопки, живой граф | MIT + Commons Clause — [src/components/fx/LICENSE](src/components/fx/LICENSE): в составе сайта можно, продавать или раздавать сами компоненты нельзя |
| [shadcn/ui](https://ui.shadcn.com) — кнопка, копия в `src/components/ui` | кнопки | MIT |
| [GSAP](https://gsap.com) и @gsap/react | вся анимация | [стандартная бесплатная лицензия GSAP](https://gsap.com/standard-license) |
| [Lenis](https://github.com/darkroomengineering/lenis) | плавная прокрутка | MIT |
| React, Vite, Tailwind CSS, Radix UI, clsx, tailwind-merge | интерфейс и сборка | MIT |
| class-variance-authority | варианты кнопок | Apache-2.0 |
| [Lucide](https://lucide.dev) | иконки | ISC |
| Шрифты Geologica, Onest, JetBrains Mono ([Fontsource](https://fontsource.org)) | заголовки, текст, метки | SIL OFL 1.1 |

Лицензии пакетов сверены по их `package.json` 2026-10-26.
