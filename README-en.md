<div align="center">

# Oleg Barbashin

**Systems analyst and AI systems developer**<br>
A prototype of your idea you can try before investing, and documentation tied to the product’s code. Novosibirsk, Russia.

<a href="https://barbashin1970.github.io/portfolio/"><img src=".github/readme/open-site-en.svg" alt="Open the site" height="52"></a>&nbsp;
<a href="https://t.me/OlegBarbashin"><img src=".github/readme/telegram-en.svg" alt="Message on Telegram" height="52"></a>

[banksnab@gmail.com](mailto:banksnab@gmail.com) · [GitHub](https://github.com/Barbashin1970)

<sub>Russian version: [README.md](README.md)</sub>

</div>

---

## What I do

Two things, and you can check both.

- **A prototype you can try.** Your idea becomes a working system at a link — interface, data, scenarios, and an AI module on your data if needed — before you decide on a team and a budget.
- **Documentation tied to the code.** Specifications and GOST 19 documentation sets, R&D reports. Every number comes with the command that produced it, and the build fails if a document drifts from the code.

## Selected work

- **[RAGRAF](https://ragraf.up.railway.app/)** — AI you can audit: every verdict shows its inputs, formula and threshold. [Documentation](https://github.com/Barbashin1970/DOCS/tree/main/RAGRAF_DOCS)
- **[Sigma — situation centre](https://sigma-operator.vercel.app/operator/hospital-fire)** — AI prompts for emergency dispatch operators: incident scenarios, a video wall and a certification trainer. [Code](https://github.com/Barbashin1970/demo-sigma-main)
- **[SIMA — Novosibirsk open data](https://nsk-opendata-bot.up.railway.app/)** — answers questions about the city from open data, with no neural network at runtime. [Code](https://github.com/Barbashin1970/NSK_OpenData_Bot)
- **[AI in Teaching](https://barbashin1970.github.io/PROMPT-Professor/)** — a professional development course for NSU faculty. [Code](https://github.com/Barbashin1970/PROMPT-Professor)

The portfolio holds 31 projects across seven industries, 27 of them with a live demo; all of them are in the site’s catalog, filterable by industry.

## How I work: SKICODING

My way of running projects is **ski-coding**: text and code alternate like ski tracks — analysis, code, documents, code. Every step leaves something you can check: a document, a commit, a test. The analysis comes before the code; a step is not done until the documents it touched are updated; deferred work goes to a backlog with a reason; every number comes with the command that produced it.

It keeps a project clear of two traps: a code rush nobody can explain a week later, and documents that go stale before any code exists. Published as a skill for AI coding agents: [SKICODING in NSU-AI-SKILLS](https://github.com/Barbashin1970/NSU-AI-SKILLS/tree/main/skills/skicoding).

## This repository

The source of the portfolio site: pages are prerendered at build time and published on GitHub Pages. Phases 1 and 2 of 3 are done (October 2026): a first screen with a live graph, featured projects with horizontal scrolling, a catalog by industry with demo screenshots and videos, and a contact section; the English page, SEO and Lighthouse come next.

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

- [React Bits](https://reactbits.dev) — SplitText, Magnet, Particles, TiltedCard and ClickSpark, adapted copies in [`src/components/fx`](src/components/fx): MIT + Commons Clause, see [src/components/fx/LICENSE](src/components/fx/LICENSE);
- [GSAP](https://gsap.com) and @gsap/react: the [GSAP standard license](https://gsap.com/standard-license);
- shadcn/ui, Lenis, React, Vite, Tailwind CSS, Radix UI, clsx, tailwind-merge: MIT;
- class-variance-authority: Apache-2.0; [Lucide](https://lucide.dev) icons: ISC;
- Geologica, Onest and JetBrains Mono fonts via [Fontsource](https://fontsource.org): SIL OFL 1.1.
