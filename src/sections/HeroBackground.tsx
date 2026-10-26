import { lazy, Suspense, useEffect, useRef, useState, type Ref } from 'react';
import { useTheme } from '@/lib/theme';
import { gsap } from '@/motion/gsap';
import { DUR, EASE, GRAPH, MEDIA } from '@/motion/tokens';

/** WebGL-фон — отдельный чанк: на телефон и при reduced-motion он не грузится вовсе. */
const Particles = lazy(() => import('@/components/fx/Particles'));

// В Safari нет requestIdleCallback — там пауза браузера заменяется коротким таймером.
const requestIdle = (callback: () => void): number =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(callback)
    : window.setTimeout(callback, 200);

const cancelIdle = (id: number) =>
  typeof window.cancelIdleCallback === 'function' ? window.cancelIdleCallback(id) : window.clearTimeout(id);

/** Цвета графа — из токенов текущей темы: тихие узлы, циан — данные, один оранжевый. */
function graphColors(): string[] {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const [node, data, hub] = [token('--text-subtle'), token('--accent-2'), token('--accent')];
  return [node, node, node, node, data, data, hub];
}

/**
 * Фон hero — граф знаний (Р-07). Статичный SVG есть всегда: его отдаёт предсборка,
 * он остаётся на телефоне, при reduced-motion и без WebGL2. На десктопе после интро,
 * события load и паузы браузера поверх встаёт живой граф, а SVG гаснет.
 */
export function HeroBackground({ start }: { start: boolean }) {
  const light = useTheme() === 'light';
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!start) return undefined;
    if (!window.matchMedia(MEDIA.desktopMotion).matches || !('WebGL2RenderingContext' in window)) return undefined;
    let idle = 0;
    const go = () => {
      idle = requestIdle(() => setLive(true));
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      cancelIdle(idle);
    };
  }, [start]);

  useEffect(() => {
    if (!ready || !svgRef.current) return undefined;
    const tween = gsap.to(svgRef.current, { autoAlpha: 0, duration: DUR.slow, ease: EASE.inOut });
    return () => {
      tween.kill();
    };
  }, [ready]);

  return (
    <div className="hero-bg" aria-hidden="true" data-graph={ready ? 'live' : 'static'}>
      <StaticGraph ref={svgRef} />
      {live && (
        <Suspense fallback={null}>
          <Particles
            style={{ position: 'absolute', inset: 0 }}
            particleCount={GRAPH.count}
            particleSpread={GRAPH.spread}
            speed={GRAPH.speed}
            particleBaseSize={GRAPH.baseSize}
            cameraDistance={GRAPH.camera}
            particleColors={graphColors()}
            particleHoverFactor={GRAPH.hoverFactor}
            twinkle={GRAPH.twinkle}
            glow={light ? GRAPH.glow.light : GRAPH.glow.dark}
            connections
            connectionDistance={GRAPH.connectionDistance}
            clickBurst={false}
            introDuration={DUR.intro}
            onReady={() => setReady(true)}
          />
        </Suspense>
      )}
    </div>
  );
}

/** Граф из макета docs/design-preview.html: узлы и связи справа, акцентный узел в центре. */
function StaticGraph({ ref }: { ref: Ref<SVGSVGElement> }) {
  return (
    <svg ref={ref} className="hero-graph" viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid slice" focusable="false">
      <g className="graph-edges">
        <line x1="760" y1="120" x2="880" y2="80" /><line x1="880" y1="80" x2="1010" y2="140" /><line x1="1010" y1="140" x2="1120" y2="90" />
        <line x1="760" y1="120" x2="820" y2="240" /><line x1="880" y1="80" x2="820" y2="240" /><line x1="820" y1="240" x2="950" y2="260" />
        <line x1="1010" y1="140" x2="950" y2="260" /><line x1="950" y1="260" x2="1080" y2="230" /><line x1="1120" y1="90" x2="1080" y2="230" />
        <line x1="1080" y1="230" x2="1180" y2="190" /><line x1="1120" y1="90" x2="1180" y2="190" /><line x1="820" y1="240" x2="700" y2="330" />
        <line x1="700" y1="330" x2="860" y2="380" /><line x1="950" y1="260" x2="860" y2="380" /><line x1="860" y1="380" x2="1000" y2="370" />
        <line x1="1080" y1="230" x2="1000" y2="370" /><line x1="1000" y1="370" x2="1140" y2="330" /><line x1="1140" y1="330" x2="1170" y2="450" />
        <line x1="860" y1="380" x2="760" y2="480" /><line x1="760" y1="480" x2="920" y2="500" /><line x1="920" y1="500" x2="1060" y2="470" />
        <line x1="1000" y1="370" x2="1060" y2="470" /><line x1="1060" y1="470" x2="1170" y2="450" /><line x1="760" y1="120" x2="640" y2="200" />
        <line x1="640" y1="200" x2="700" y2="330" /><line x1="700" y1="330" x2="600" y2="420" /><line x1="600" y1="420" x2="760" y2="480" />
        <line x1="1140" y1="330" x2="1180" y2="190" />
      </g>
      <g className="graph-node">
        <circle cx="760" cy="120" r="3.5" /><circle cx="1120" cy="90" r="3" /><circle cx="700" cy="330" r="3" /><circle cx="1140" cy="330" r="3.5" />
        <circle cx="760" cy="480" r="3" /><circle cx="1060" cy="470" r="3" /><circle cx="640" cy="200" r="2.5" /><circle cx="600" cy="420" r="2.5" />
        <circle cx="1180" cy="190" r="2.5" /><circle cx="1170" cy="450" r="3" /><circle cx="820" cy="240" r="3" />
      </g>
      <g className="graph-data">
        <circle cx="880" cy="80" r="4" /><circle cx="1010" cy="140" r="4.5" /><circle cx="1080" cy="230" r="4" /><circle cx="860" cy="380" r="4.5" />
        <circle cx="1000" cy="370" r="4" /><circle cx="920" cy="500" r="3.5" />
      </g>
      <circle className="graph-hub" cx="950" cy="260" r="7" />
      <circle className="graph-halo" cx="950" cy="260" r="16" />
    </svg>
  );
}
