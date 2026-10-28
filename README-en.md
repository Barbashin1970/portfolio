<div align="center">

# Oleg Barbashin

**Systems analyst and AI systems developer**<br>
I find where AI takes routine work off your staff, and I train your team to work with it. Prototypes before you invest, and documentation tied to the code. Novosibirsk, Russia.

<a href="https://barbashin1970.github.io/portfolio/"><img src=".github/readme/open-site-en.svg" alt="Open the site" height="52"></a>&nbsp;
<a href="https://t.me/OlegBarbashin"><img src=".github/readme/telegram-en.svg" alt="Message on Telegram" height="52"></a>

[banksnab@gmail.com](mailto:banksnab@gmail.com) · [GitHub](https://github.com/Barbashin1970)

<sub>Russian version: [README.md](README.md)</sub>

</div>

---

## What I do

Three things, and you can check each one.

- **Where AI speeds up your staff.** I go through your business chain — how work flows from a request to a result — and find the points where AI takes routine work off people. We test it on your data, then I train your staff to work with AI on your own tasks. A training example: a continuing-education course for Novosibirsk State University lecturers.
- **A prototype you can try.** Your idea becomes a working system at a link — interface, data, scenarios, and an AI module on your data if needed — before you decide on a team and a budget.
- **Documentation tied to the code.** Specifications and GOST 19 documentation sets, R&D reports. Every number comes with the command that produced it, and the build fails if a document drifts from the code.

## Selected work

- **[RAGRAF](https://ragraf.up.railway.app/)** — a framework for building management platforms. Its core is a knowledge-based AI system: a decision is made by a rule written by a person, not by a trained model. The subject area is set by choosing datasets and regulations, not by development. [Documentation](https://github.com/Barbashin1970/DOCS/tree/main/RAGRAF_DOCS)
- **[LEYKA](https://github.com/Barbashin1970/DOCS/tree/main/LEYKA_DOCS)** — a kanban board and a messenger in one product: a team’s tasks, discussions and deadlines in one window. The demo needs a sign-in. [Documentation](https://github.com/Barbashin1970/DOCS/tree/main/LEYKA_DOCS)
- **[SIMA — Novosibirsk open data](https://nsk-opendata-bot.up.railway.app/)**. SIMA stands for System for Intelligent Municipal Analysis. It answers questions about the city from open data, with no neural network at runtime. [Code](https://github.com/Barbashin1970/NSK_OpenData_Bot)
- **[AI in Teaching](https://barbashin1970.github.io/PROMPT-Professor/)** — a professional development course for NSU faculty. [Code](https://github.com/Barbashin1970/PROMPT-Professor)
- **[Sigma audit](https://polinom-sigma-audit.up.railway.app/)** — audits a public GitHub repository against 26 rules of the Sigma methodology, in 30 seconds and with nothing to install.
- **[ARCHI Platform](https://archi-nsu.vercel.app/)** — reads construction schedules, applies the rules and messages the person in charge when one is broken. [Documentation](https://github.com/Barbashin1970/DOCS/tree/main/ARCHI-NSU)

The portfolio holds 31 projects, 26 of them with a live demo. Work projects are in the site’s catalog across six industries, with a filter; games have their own section, for a break. In 2025–2026: 27 repositories and ≈364k lines of code in TypeScript and Python, ≈42k of them tests; 10 projects have their own server, 5 a database ([how we counted](docs/INVENTORY.md#объём-кода)). That is the ceiling of what one person can personally review by eye — and with AI agents writing code and documentation, such review is mandatory.

## How I work: SKICODING

My way of running projects is **ski-coding**: text and code alternate like ski tracks — analysis, code, documents, code. Every step leaves something you can check: a document, a commit, a test. The analysis comes before the code; a step is not done until the documents it touched are updated; deferred work goes to a backlog with a reason; every number comes with the command that produced it.

It keeps a project clear of two traps: a code rush nobody can explain a week later, and documents that go stale before any code exists. Published as a skill for AI coding agents: [SKICODING in NSU-AI-SKILLS](https://github.com/Barbashin1970/NSU-AI-SKILLS/tree/main/skills/skicoding).

## This repository

The source of the portfolio site: pages are prerendered at build time and published on GitHub Pages. Phases 1 and 2 of 3 are done (October 2026): a first screen with a live graph, featured projects with horizontal scrolling, a catalog by industry with demo screenshots and videos, games, and a contact chat where the request is built with buttons and edited right on the site; the English page, SEO and Lighthouse come next.

Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui · GSAP + ScrollTrigger · Lenis · React Bits.

```bash
nvm use          # Node 22 from .nvmrc
npm ci
npm run dev      # http://localhost:5173/portfolio/
npm run check    # lint, types, tests, build
```

## Licenses and components

**The site's code is [MIT](LICENSE).** The MIT license does not cover the site texts and project descriptions (`src/i18n`, texts in `src/data`), the documents in `docs/` or the images: © Oleg Barbashin, 2026, all rights reserved.

Third-party components keep their own licenses:

- [React Bits](https://reactbits.dev) — SplitText, Magnet, Particles and TiltedCard, adapted copies in [`src/components/fx`](src/components/fx): MIT + Commons Clause, see [src/components/fx/LICENSE](src/components/fx/LICENSE);
- [GSAP](https://gsap.com) and @gsap/react: the [GSAP standard license](https://gsap.com/standard-license);
- shadcn/ui, Lenis, React, Vite, Tailwind CSS, Radix UI, clsx, tailwind-merge: MIT;
- class-variance-authority: Apache-2.0; [Lucide](https://lucide.dev) icons: ISC;
- Geologica, Onest and JetBrains Mono fonts via [Fontsource](https://fontsource.org): SIL OFL 1.1.
