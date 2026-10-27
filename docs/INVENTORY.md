# Инвентаризация проектов для витрины

Снято 2026-10-26, дополнено 2026-10-27 тремя играми из `ai-point`. Повторять перед
публикацией: адреса демо и числа меняются.
Каждое число идёт вместе с командой, которой получено.

Олег разрешил показывать все проекты, включая приватные. Ссылок на код приватных
репозиториев на сайте нет: у посетителя они открывались бы как 404.

## Источники

| Источник | Что дал |
|---|---|
| Публичный GitHub API, без токена (60 запросов в час) | публичные репозитории и профиль |
| Ответ github.com на адрес репозитория (404 без входа) | какие локальные клоны — приватные |
| Локальные клоны на ноутбуке Олега | приватные проекты, их README, стек из `package.json` и `requirements`, демо-адреса |
| curl по каждому демо-адресу | код ответа, итоговый адрес, `<title>`, загрузка JS-бандла |
| `ai-point` — первая попытка портфолио, приватный репозиторий (октябрь 2025) | три игры, которых нет на GitHub: адреса демо и описания |

## Числа

| Число | Значение | Команда |
|---|---|---|
| Публичных репозиториев | 64 | `curl -s https://api.github.com/users/Barbashin1970 \| grep public_repos` |
| Приватных на GitHub | 17 | `curl -o /dev/null -w '%{http_code}' https://github.com/Barbashin1970/<repo>` по remote локальных клонов |
| Аккаунт на GitHub с | 2022-08-07 | поле `created_at` профиля |
| Коммитов Олега с 2026-01-01 по 29 локальным клонам | 2520 (всего 2534, остальное — github-actions и Rork) | `for d in */; do git -C "$d" rev-list --count --since=2026-01-01 HEAD; done`; авторы — `git log --since=2026-01-01 --format=%an \| sort \| uniq -c` |
| Репозиториев с живым демо | 26 | проверка ниже |
| Проектов на витрине | 31: 6 избранных; в каталоге 22 рабочих проекта, 9 игр — своей секцией; живое демо у 26 | `src/data/projects.ts`, подсчёт по полям `tier`, `audience` и `demoUrl`; с README и описью сверяет `npx vitest run tests/numbers.test.ts` |

Основные языки публичных репозиториев (поле `language`, без форков): Java 35, HTML 6,
Python 4, JavaScript 3, TypeScript 2, CSS 2, Shell 1, Kotlin 1, Batchfile 1. Java — это
2022–2023 годы, задания по автоматизации тестирования. Batchfile у AI-SKLAD — артефакт
подсчёта: там лежит `start.bat`.

## Проекты на витрине

«Бандл 200» — JS-бандл одностраничного приложения отдаётся, а не только пустая оболочка.
Дата — последний коммит, а для репозиториев без локального клона — `pushed_at` из API.

| Проект (`slug`) | Репозиторий | Видимость | Последний коммит | Демо | Проверка |
|---|---|---|---|---|---|
| ★ РАГРАФ (`ragraf`) | RAGRAF; документация — DOCS | приватный; DOCS публичный | 2026-10-23 | ragraf.up.railway.app | 200, бандл 200 |
| Сигма (`sigma`) | demo-sigma-main; ранний прототип — Sigma | публичные | 2026-04-29 | sigma-operator.vercel.app/operator/hospital-fire; sigma-three-theta.vercel.app | 200, бандл 200; 200 |
| ★ СИМА (`sima`) | NSK_OpenData_Bot | публичный | 2026-08-20 | nsk-opendata-bot.up.railway.app | 200 |
| ★ ИИ в учебном процессе (`prompt-professor`) | PROMPT-Professor | публичный | 2026-10-14 | barbashin1970.github.io/PROMPT-Professor/; ai-in-the-education.vercel.app | 200 и 200 |
| ★ Платформа АРХИ (`archi`) | ARCHI-NSU-Public — визитка; документация — DOCS | приватный | 2026-09-19 | archi-nsu.vercel.app | 200 |
| PRECONSTRUCTION (`preconstruction`) | PRECONSTRUCTION | публичный | 2026-06-13 | — | ссылка на репозиторий |
| НормаСтрой AI (`normastroy`) | NORMA-STROY | приватный | 2026-09-25 | — | демо нет, стенд локальный; на карточке — пометка об этом (Р-49) |
| Тест по ИИ для строителей (`stroyka-test`) | stroyka-test | публичный | 2026-04-13 | stroyka-alpha.vercel.app | 200 |
| Промпт-конструктор умного города (`smartcityprompt`) | smartcityprompt | публичный | 2026-03-25 | smartcityprompt.vercel.app | 200 |
| ★ Сигма-аудит (`sigma-audit`) | POLINOM | приватный | 2026-06-13 | polinom-sigma-audit.up.railway.app | 200, переадресует на `/ru` |
| NSU-AI-SKILLS (`nsu-ai-skills`) | NSU-AI-SKILLS | публичный | 2026-10-15 | — | ссылка на репозиторий |
| md2gostdocx (`md2gostdocx`) | MD-DOCX-CONVERTER | публичный | 2026-09-06 | — (в PyPI пакета нет: 404) | ссылка на репозиторий |
| Инженерный калькулятор (`engineer`) | ENGINEER | публичный | 2026-10-06 | barbashin1970.github.io/ENGINEER/ | 200 |
| ★ LEYKA (`leyka`), отрасль «Бизнес» | LEYKA; документация — DOCS | приватный | 2026-10-26 | leyka-nsu.vercel.app — только экран входа, гостевого доступа нет | карточка ведёт на документацию; DOCS/LEYKA_DOCS — 200; скриншот и видео — записи экрана Олега 2026-10-27 |
| Конструктор промптов (`prompt-education`) | prompt | публичный | 2025-11-13 | prompt-education.vercel.app | 200 |
| ИИ в образовании (`ai-in-edtech`) | Ai-in-edtech | публичный | 2025-10-25 | ai-in-edtech.vercel.app | 200 |
| Профессия инженер ПТО (`pto-presentation`) | pto-presentation | публичный | 2025-09-08 | pto-presentation.vercel.app | 200 |
| ИИ-аналитик остатков (`ai-sklad`) | AI-SKLAD | публичный | 2026-04-30 | ai-sklad.vercel.app | 200 |
| Мадам Беримаж (`berimaj`) | BERIMAJ | приватный | 2026-09-09 | berimaj.vercel.app | 200, бандл 200 |
| SILL (`sill`) | SILL | приватный | 2026-08-21 | silltime.vercel.app | 200, бандл 200 |
| Арома София (`aroma-sofia`) | SOFIAROMA — RU; SOFIA — международная | приватные | 2026-08-31 | sofia-ru.vercel.app; sofia-europe.vercel.app | 200 и 200, бандлы 200 |
| Workout Coach (`workout`) | workout | публичный | 2026-01-12 | workout-eight-flax.vercel.app → 307 → workout-gogo.vercel.app | 200 |
| GONKA (`gonka`) | GONKA | приватный | 2026-04-21 | gonka-two.vercel.app | 200, бандл 200 |
| Tigra (`tigra`) | KNIFFEL | приватный | 2026-08-03 | tigra-dice.vercel.app | 200, бандл 200; `tigra.vercel.app` — 402 |
| СМАРТ (`smart-5`) | FIVELETTERS | приватный | 2026-09-08 | fiveletters.vercel.app | 200, бандл 200 |
| REDJOHN (`redjohn`) | REDJOHN | приватный | 2026-08-21 | redjohngame.vercel.app | 200, бандл 200 |
| Boardway (`boardway`) | boardway | приватный | 2026-05-31 | boardway-nsk.vercel.app (адрес дал Олег) | 200, бандл 200, в бандле текст игры |
| Гарри Поттер — Magic Quiz (`harry-quiz`) | harrypotterquiz | публичный | 2026-05-31 | harryquiz.vercel.app | 200, бандл 200 |
| Пятнашки (`puzzle-15`) | из `ai-point`, на GitHub нет | — | 2025, по `ai-point` | 15-puzzle-mu.vercel.app | 200, бандл 200, `<title>` «Пятнашки» (2026-10-27) |
| Boston Consulter (`boston-consulter`) | из `ai-point`, на GitHub нет | — | 2025, по `ai-point` | junior-consulter.vercel.app | 200, бандл 200, `<title>` «Boston Consulter» |
| Profconsalt — раннер (`profconsalt`) | из `ai-point`, на GitHub нет | — | 2025, по `ai-point` | profconsalt.vercel.app | 200, бандл 200, `<title>` «Profconsalt» |

★ — избранные: горизонтальная галерея. Документация DOCS проверена по трём папкам:
`RAGRAF_DOCS`, `LEYKA_DOCS`, `ARCHI-NSU` — все отвечают 200.

## Медиа карточек

Снято 2026-10-27. Картинка есть у каждой карточки: скриншот публичного экрана демо,
у LEYKA — снимок экрана Олега, а у трёх проектов без демо — запасной граф.

| Что | Сколько | Команда |
|---|---|---|
| Скриншоты демо, WebP: десктоп 960×600, мобильные приложения 390×844 (список — `PHONE_FIRST` в `src/data/media.ts`; GONKA и Tigra — десктоп: игры для браузера, Р-38) | 26 файлов, 607 386 байт | снять — `node scripts/capture-shots.mjs`; посчитать — `ls public/media/*.webp \| grep -v leyka \| wc -l`, `cat $(ls public/media/*.webp \| grep -v leyka) \| wc -c` |
| Скриншот LEYKA — снимок экрана Олега: доска задач, кадр 1280×800 CSS px без полосы окна | 1 файл, 27 686 байт | `ffmpeg -i <снимок>.png -vf "crop=2560:1600:0:74,scale=960:600:flags=lanczos" -c:v libwebp -quality 72 public/media/leyka.webp` |
| Видео из `ai-point`: ПТО, Boardway, Profconsalt, Boston Consulter, Пятнашки — H.264, 12–14 с, без звука | 5 файлов, от 53 до 150 КБ, вместе 484 512 байт | сжать — `node scripts/encode-video.mjs <файл> <slug> [--portrait] [--crop-top 180]`; посчитать — `cat public/media/{pto-presentation,boardway,profconsalt,boston-consulter,puzzle-15}.mp4 \| wc -c` |
| Видео LEYKA — запись экрана Олега: доска и две задачи, 11,9 с; прокрутка карточки вырезана, поле «Исполнитель» размыто | 1 файл, 299 467 байт | `node scripts/encode-video.mjs <запись>.mov leyka --crop 2560:1600:0:74 --keep 29.2-32.5,34.75-43.45 --blur 1630:470:400:65@30.3-36.45,38-43.6`; посчитать — `wc -c public/media/leyka.mp4` |

Видео Сигмы из `ai-point` не взято: в нём ранний прототип фреймворка, а не демо ЕДДС.
У игр срезана рамка мини-приложения Telegram (`--crop-top 180`). ffmpeg в зависимости
проекта не входит — путь к нему в `FFMPEG_PATH`.

В записи LEYKA полные имена коллег, второй адрес Google и KPI центра — что взято и почему,
по секундам, — в [VITRINA-RAZBOR.md](VITRINA-RAZBOR.md). Скриншот опубликован как есть
по решению Олега: у людей на доске только инициалы.

## Не на витрине

| Что | Почему |
|---|---|
| ИИ-помощник по ТБ (`safety`, safety-builder.streamlit.app) | снят с витрины 2026-10-27: «слабоват — старая архитектура» (Олег) |
| POLINOM-JAVA | публичного адреса нет: его GitHub Pages отвечает 404 |
| SMART-DUEL | сборка «СМАРТ» под Яндекс Игры; публичного адреса пока нет, сама игра на витрине как `smart-5` |
| FREEWAY | личная инфраструктура, не проект для заказчика |
| ARCHI-NSU | изделие лежит во внутреннем git НГУ; на витрине его визитка `archi` |
| MY-VOLUME | граф знаний, а не проект для заказчика |
| `boardway.vercel.app` | чужой проект (англоязычная игра-монополия); адрес угадан и отброшен по содержимому |
| 35 Java-репозиториев 2022–2023 | учебные и тестовые задания по автоматизации тестирования; как опыт QA — да, как карточки — нет |
| форки html, core, Unit_Test_Diplom_1; GameSphere; профильный Barbashin1970 | не свои или пустые |

## Как повторить проверку ссылок

```bash
# код ответа, итоговый адрес, <title>; -L идёт по редиректам
curl -sS -L --max-time 40 -o page.html -w "%{http_code} %{url_effective}\n" "$URL"
grep -o -i '<title[^>]*>[^<]*' page.html | head -1
# для одностраничных приложений — что отдаётся сам бандл
src=$(grep -oE '<script[^>]*src="[^"]+"' page.html | grep -oE 'src="[^"]+"' | head -1)
# Streamlit без cookie зацикливается — нужен cookie-jar
curl -sS -L --max-redirs 10 -c jar.txt -b jar.txt -o /dev/null -w "%{http_code}\n" https://safety-builder.streamlit.app/
```

Позже эти проверки станут сценарием `scripts/check-links.mjs`, который читает адреса
прямо из `src/data/projects.ts`.
