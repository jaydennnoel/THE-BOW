import { useCallback, useEffect, useRef, useState } from "react";
import {
  BREAK_SPEED,
  R,
  T_ASSEMBLE,
  T_CONTACT,
  T_COPY,
  T_STRIKE,
  done,
  rack,
  settle,
  step,
  targets,
} from "@/lib/table";
import type { Ball } from "@/lib/table";
import {
  depthFor,
  drawBall,
  drawImpact,
  drawRoom,
  drawShadow,
  inDepthOrder,
  makeCam,
  project,
} from "@/lib/render";
import type { Cam } from "@/lib/render";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Eyebrow } from "./ui/Eyebrow";

/** The cue is struck a hair off centre, so the rack opens instead of stacking. */
const AIM = -0.026;
/** Hard stop: if the physics somehow stalls, the name lands anyway. */
const TIMEOUT = T_ASSEMBLE + 2.8;

/**
 * The break — shot the way you'd shoot it: the camera down on the cloth,
 * close enough that the bed fills the frame and the far cushion sits just
 * under the top edge.
 *
 * The cue comes in from under the lens and strikes. Fifteen balls open up
 * under real physics, smearing as they go. Nine of them and the cue run off
 * the edges of the shot, and the six that are left roll together into
 * T H E   B O W and stop.
 *
 * What it promises:
 *  - the loop stops dead once the name settles; it wakes only for the pointer
 *  - it pauses off-screen and when the tab is hidden
 *  - the headline arrives on the stroke, so copy never waits on the animation
 *  - the wordmark is sized to the viewport, so it fills any frame
 *  - reduced motion draws the final frame and nothing moves
 */
export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const balls = useRef<Ball[]>([]);
  const cam = useRef<Cam | null>(null);
  const focus = useRef(40);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const clock = useRef(0);
  const running = useRef(true);
  const size = useRef({ w: 0, h: 0 });
  const pointer = useRef({ x: 0, z: 0, on: false });

  const [struck, setStruck] = useState(false);
  const [copyIn, setCopyIn] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();

  /* ── layout ─────────────────────────────────────────────────────────── */

  /**
   * Sizes the canvas, builds the camera, and picks the depth the six come
   * to rest at — the depth where the wordmark spans most of the frame, so
   * it reads the same on a phone as on a desktop.
   */
  const measure = useCallback((rebuild: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const box = canvas.getBoundingClientRect();
    if (!ctx || !box.width) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = box.width;
    const h = box.height;
    size.current = { w, h };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = makeCam(w, h);
    cam.current = c;

    // two rows need real vertical room, so the name only breaks in two when
    // the frame is genuinely narrow; anything landscape-ish reads across
    const stacked = w / h < 1.15;
    const slots = targets(stacked);
    const spanX = Math.max(...slots.map((p) => p.x)) - Math.min(...slots.map((p) => p.x)) + R * 2;
    const base = Math.min(...slots.map((p) => p.z));

    /** Lowest point the arrangement reaches on screen when placed at `z`. */
    const foot = (z: number) => {
      let bottom = -Infinity;
      for (const p of slots) {
        const q = project(c, p.x, p.z - base + z, R);
        bottom = Math.max(bottom, q.sy + q.k * R);
      }
      return bottom;
    };

    // Wide enough to fill the frame…
    let z = depthFor(c, spanX, stacked ? 0.8 : 0.78, w);

    // …but never so near that the balls sit on the headline. Pushing the
    // arrangement back moves it up the frame and shrinks it at the same
    // time, so the lowest point falls off monotonically and bisects cleanly.
    const copy = copyRef.current;
    if (copy) {
      const limit = copy.offsetTop - h * 0.02;
      if (foot(z) > limit) {
        let lo = z;
        let hi = z + 320;
        for (let i = 0; i < 22; i++) {
          const mid = (lo + hi) / 2;
          if (foot(mid) > limit) lo = mid;
          else hi = mid;
        }
        z = hi;
      }
    }

    for (const p of slots) p.z += z - base;
    focus.current = z;

    if (rebuild) balls.current = rack(stacked);
    for (const b of balls.current) {
      const i = b.letter ? "THEBOW".indexOf(b.letter) : -1;
      if (i < 0) continue;
      b.tx = slots[i].x;
      b.tz = slots[i].z;
    }
  }, []);

  /* ── drawing ────────────────────────────────────────────────────────── */

  const paint = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    const c = cam.current;
    if (!ctx || !c) return;
    const { w, h } = size.current;

    drawRoom(ctx, c, w, h);


    const order = inDepthOrder(balls.current);
    for (const b of order) drawShadow(ctx, c, b);
    for (const b of order) drawBall(ctx, c, b, focus.current);

    const cue = balls.current[balls.current.length - 1];
    if (running.current && cue && !cue.gone) {
      const since = clock.current - T_CONTACT;
      if (since >= 0 && since < 0.24) drawImpact(ctx, c, cue, since / 0.24);
    }
  }, []);

  /* ── the loop ───────────────────────────────────────────────────────── */

  const land = useCallback(() => {
    running.current = false;
    settle(balls.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    last.current = 0;
    paint();
    setStruck(true);
    setCopyIn(true);
    setReady(true);
  }, [paint]);

  const loop = useCallback(
    (now: number) => {
      if (!last.current) last.current = now;
      const dt = Math.min((now - last.current) / 1000, 0.034);
      last.current = now;

      if (running.current) {
        clock.current += dt;
        const t = clock.current;

        if (t >= T_STRIKE) setStruck((v) => v || true);
        if (t >= T_COPY) setCopyIn((v) => v || true);

        const cue = balls.current[balls.current.length - 1];
        if (cue && t >= T_STRIKE && !cue.vz && !cue.gone) {
          cue.vx = Math.sin(AIM) * BREAK_SPEED;
          cue.vz = Math.cos(AIM) * BREAK_SPEED;
        }

        step(balls.current, dt, t);
        paint();

        if (t > TIMEOUT || (t > T_ASSEMBLE && done(balls.current))) {
          land();
          return;
        }
        raf.current = requestAnimationFrame(loop);
        return;
      }

      // settled: the six answer the pointer, then go quiet again
      if (pointer.current.on) {
        for (const b of balls.current) {
          if (!b.letter) continue;
          const dx = b.x - pointer.current.x;
          const dz = b.z - pointer.current.z;
          const d2 = dx * dx + dz * dz;
          const reach = R * 3.6;
          if (d2 < reach * reach && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / reach) * 520;
            b.vx += (dx / d) * f * dt;
            b.vz += (dz / d) * f * dt;
          }
        }
      }
      const moving = step(balls.current, dt, clock.current);
      paint();
      if (moving || pointer.current.on) {
        raf.current = requestAnimationFrame(loop);
      } else {
        raf.current = null;
        last.current = 0;
      }
    },
    [land, paint],
  );

  const start = useCallback(() => {
    measure(true);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    clock.current = 0;
    last.current = 0;

    if (reduced) {
      land();
      return;
    }

    running.current = true;
    setStruck(false);
    setCopyIn(false);
    setReady(false);
    paint();
    raf.current = requestAnimationFrame(loop);
  }, [land, loop, measure, paint, reduced]);

  const wake = useCallback(() => {
    if (!running.current && !raf.current) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  useEffect(() => {
    start();

    let timer: number;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const settled = !running.current;
        measure(false);
        if (settled) land();
        else paint();
      }, 170);
    };

    const pause = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
    const resume = () => {
      if (running.current && !raf.current) {
        last.current = 0;
        raf.current = requestAnimationFrame(loop);
      }
    };
    const onVisibility = () => (document.hidden ? pause() : resume());

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    let obs: IntersectionObserver | undefined;
    const canvas = canvasRef.current;
    if (canvas && typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver(([en]) => (en.isIntersecting ? resume() : pause()), {
        threshold: 0,
      });
      obs.observe(canvas);
    }

    // the printed faces are set in the display face — redraw once it arrives
    document.fonts?.ready.then(() => {
      if (!raf.current) paint();
    });

    return () => {
      pause();
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      obs?.disconnect();
    };
  }, [land, loop, measure, paint, start]);

  return (
    <section
      id="home"
      data-struck={struck}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink pb-[clamp(1.75rem,5vh,4rem)] pt-header"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 block h-full w-full touch-pan-y"
        onPointerMove={(e) => {
          const c = cam.current;
          if (reduced || running.current || !c || e.pointerType !== "mouse") return;
          // walk the depth back from the focus plane — near enough for a nudge
          const box = e.currentTarget.getBoundingClientRect();
          const zc = -(R - c.h) * c.sin + (focus.current + c.d) * c.cos;
          pointer.current = {
            x: ((e.clientX - box.left - c.cx) * zc) / c.f,
            z: focus.current,
            on: true,
          };
          wake();
        }}
        onPointerLeave={() => {
          pointer.current = { x: 0, z: 0, on: false };
          wake();
        }}
      />

      {/* the shot hands off to the dark room before it reaches the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg,rgba(10,10,9,.5) 0%,transparent 18%,transparent 46%," +
            "rgba(10,10,9,.78) 72%,#0a0a09 92%)",
        }}
      />

      {!reduced && (
        <button
          type="button"
          onClick={ready ? start : land}
          aria-label={ready ? "Play the break again" : "Skip the break"}
          className="absolute right-gutter top-[calc(theme(spacing.header)+1rem)] z-[6] rounded-edge border border-hair bg-ink/40 px-3 py-2.5 font-mono text-[.64rem] uppercase leading-none tracking-[.2em] text-cream-faint backdrop-blur-sm transition-colors hover:border-cream hover:text-cream"
        >
          {ready ? "Re-rack" : "Skip"}
        </button>
      )}

      <h1 className="sr-only">The Bow — burgers, brews and billiards</h1>

      <div ref={copyRef} className="shell relative z-[5]">
        <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-[clamp(1.5rem,4vw,4rem)]">
          <div
            className={`transition-[opacity,transform] duration-[900ms] ease-cue ${
              copyIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <Eyebrow className="mb-5">Bar · Kitchen · Pool hall</Eyebrow>
            {/* monochrome puts the emphasis on the brightest phrase, not the
                loudest colour, so the lead-in recedes and the payoff doesn't */}
            <p className="display mb-5 text-[clamp(2.5rem,1.1rem+5.9vw,5.4rem)] text-cream-dim">
              Eat. Drink. <span className="text-cream">Rack 'em.</span>
            </p>
            <p className="max-w-[46ch] text-[clamp(.95rem,.92rem+.2vw,1.08rem)] text-cream-dim">
              Burgers off the flat top, cold beer, and a room full of open tables. No bookings — walk
              in and put your name up.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a className="btn max-sm:flex-1" href="#menu">
                See the menu
              </a>
              <a className="btn btn-ghost max-sm:flex-1" href="#pool">
                The pool hall
              </a>
              <a className="btn btn-ghost max-sm:w-full" href="#contact">
                Find us
              </a>
            </div>
          </div>

          <div
            className={`hidden flex-col items-end gap-4 pb-1 text-right transition-[opacity,transform] delay-100 duration-[900ms] ease-cue sm:flex ${
              copyIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <p className="font-mono text-[.7rem] uppercase leading-[1.9] tracking-[.16em] text-cream-faint">
              <span className="text-cream">Mon – Sat</span>
              <br />
              Kitchen &amp; tables
            </p>
            <p className="font-mono text-[.7rem] uppercase leading-[1.9] tracking-[.16em] text-cream-faint">
              <span className="text-cream">Walk in</span>
              <br />
              first come, first rack
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
