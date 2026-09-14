/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE BOW — rendering the break.
 *
 *  A pinhole camera sitting low and close over the cloth, the way the
 *  reference footage is shot: the bed fills the frame, the far cushion sits
 *  just under the top edge with the dark room above it, and a ball's size
 *  on screen is set entirely by how far away it is.
 *
 *  The cloth is painted in screen space — a plane that fills the frame has
 *  no perspective cues of its own worth chasing. Depth is sold by the balls:
 *  their size, their stacking order, the haze on the far ones, and the smear
 *  on the fast ones.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { BED, R } from "./table";
import type { Ball } from "./table";

/* ── camera ───────────────────────────────────────────────────────────── */

export interface Cam {
  /** Focal length, pixels. */
  f: number;
  /** Height above the cloth, table units. */
  h: number;
  /** How far in front of z = 0 the lens sits. */
  d: number;
  /** Downward pitch, radians. */
  sin: number;
  cos: number;
  tan: number;
  /** Principal point. */
  cx: number;
  cy: number;
  /** Where the cloth runs out, in pixels down the frame. */
  horizon: number;
}

/** A longer lens than a phone camera — it flattens the table the way TV does. */
const FOCAL = 0.92;
const HEIGHT = 29;
const DIST = 52;

/**
 * Builds the camera for a frame of this size, pitched so the far cushion
 * lands just below the top edge and the cloth owns everything under it.
 */
export function makeCam(w: number, h: number): Cam {
  const f = FOCAL * w;
  // taller frames want the horizon higher up, or the cloth swamps the shot
  const horizonFrac = w / h > 1.9 ? 0.155 : 0.125;
  const tan = (h * (0.5 - horizonFrac)) / f;
  const theta = Math.atan(tan);
  return {
    f,
    h: HEIGHT,
    d: DIST,
    sin: Math.sin(theta),
    cos: Math.cos(theta),
    tan,
    cx: w / 2,
    cy: h / 2,
    horizon: h * horizonFrac,
  };
}

export interface Projected {
  sx: number;
  sy: number;
  /** Pixels per table unit at this depth. */
  k: number;
}

/** Projects a point `y` units above the cloth at (x, z). */
export function project(cam: Cam, x: number, z: number, y: number): Projected {
  const vy = y - cam.h;
  const vz = z + cam.d;
  const zc = -vy * cam.sin + vz * cam.cos;
  const safe = Math.max(zc, 1e-3);
  return {
    sx: cam.cx + (cam.f * x) / safe,
    sy: cam.cy - (cam.f * (vy * cam.cos + vz * cam.sin)) / safe,
    k: cam.f / safe,
  };
}

/**
 * The depth at which `span` units of cloth fill `frac` of the frame width —
 * how the wordmark is sized to the viewport instead of guessed at.
 */
export function depthFor(cam: Cam, span: number, frac: number, w: number): number {
  const zc = (cam.f * span) / (frac * w);
  return (zc - (cam.h - R) * cam.sin) / cam.cos - cam.d;
}

/* ── the room ─────────────────────────────────────────────────────────── */

let nap: HTMLCanvasElement | null = null;
function clothNap(): HTMLCanvasElement {
  if (nap) return nap;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 170;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 20;
    }
    g.putImageData(img, 0, 0);
  }
  nap = c;
  return c;
}

/**
 * Cloth, cushion and the dark beyond it. Repainted every frame — it's three
 * gradients and a tile, which costs less than keeping a full-frame bitmap
 * around and blitting it.
 */
export function drawRoom(ctx: CanvasRenderingContext2D, cam: Cam, w: number, h: number): void {
  const hz = cam.horizon;

  /* the room behind the table */
  const room = ctx.createLinearGradient(0, 0, 0, hz);
  room.addColorStop(0, "#08070a");
  room.addColorStop(1, "#12100f");
  ctx.fillStyle = room;
  ctx.fillRect(0, 0, w, hz);

  /* a single warm lamp somewhere back there */
  const lamp = ctx.createRadialGradient(w * 0.62, hz * 0.1, 0, w * 0.62, hz * 0.5, w * 0.35);
  lamp.addColorStop(0, "rgba(224,165,74,.24)");
  lamp.addColorStop(1, "rgba(224,165,74,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, w, hz * 1.4);

  /* the far cushion: rubber under cloth, catching the light along its top */
  const railH = Math.max(6, h * 0.028);
  const rail = ctx.createLinearGradient(0, hz - railH, 0, hz + railH * 0.3);
  rail.addColorStop(0, "#0a2c36");
  rail.addColorStop(0.42, "#11505f");
  rail.addColorStop(1, "#07242c");
  ctx.fillStyle = rail;
  ctx.fillRect(0, hz - railH, w, railH * 1.3);
  ctx.fillStyle = "rgba(198,232,242,.12)";
  ctx.fillRect(0, hz - railH, w, Math.max(1, railH * 0.09));

  /* the bed */
  const bed = ctx.createLinearGradient(0, hz, 0, h);
  // the cloth at The Bow is electric blue, not the usual green
  bed.addColorStop(0, "#0c5568");
  bed.addColorStop(0.15, "#1487a3");
  bed.addColorStop(0.5, "#1ea9c7");
  bed.addColorStop(1, "#0e6b82");
  ctx.fillStyle = bed;
  ctx.fillRect(0, hz, w, h - hz);

  /* the light over the table, pooling a little left of centre */
  const pool = ctx.createRadialGradient(
    w * 0.44,
    hz + (h - hz) * 0.34,
    0,
    w * 0.44,
    hz + (h - hz) * 0.34,
    Math.max(w, h) * 0.72,
  );
  pool.addColorStop(0, "rgba(196,246,255,.26)");
  pool.addColorStop(0.42, "rgba(96,206,232,.09)");
  pool.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(0, hz, w, h - hz);

  /* nap */
  const tile = ctx.createPattern(clothNap(), "repeat");
  if (tile) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = tile;
    ctx.fillRect(0, hz, w, h - hz);
    ctx.restore();
  }

  /* the frame falls away at the edges, as a fast lens does */
  const vig = ctx.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.28, w / 2, h * 0.5, Math.max(w, h) * 0.78);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,.5)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/* ── balls ────────────────────────────────────────────────────────────── */

/** Far to near, so the near ones overlap the far ones. */
export function inDepthOrder(balls: Ball[]): Ball[] {
  return balls.filter((b) => !b.gone).sort((a, b) => b.z - a.z);
}

/** Air between the lens and a ball further off than the focus plane. */
function haze(b: Ball, focus: number): number {
  return b.z <= focus ? 0 : Math.min(0.4, (b.z - focus) / 210);
}

/**
 * The contact shadow. The camera is low, so it reads as a long, soft smear
 * rather than a disc under the ball.
 */
export function drawShadow(ctx: CanvasRenderingContext2D, cam: Cam, b: Ball): void {
  const p = project(cam, b.x, b.z, 0);
  const rr = p.k * R;
  if (rr < 0.6) return;

  ctx.save();
  // the penumbra, thrown wide by the tubes overhead
  const soft = ctx.createRadialGradient(p.sx, p.sy, rr * 0.1, p.sx, p.sy, rr * 1.5);
  soft.addColorStop(0, "rgba(4,22,30,.34)");
  soft.addColorStop(0.55, "rgba(4,22,30,.16)");
  soft.addColorStop(1, "rgba(4,22,30,0)");
  ctx.save();
  ctx.translate(p.sx + rr * 0.06, p.sy + rr * 0.04);
  ctx.scale(1, 0.3);
  ctx.translate(-p.sx, -p.sy);
  ctx.fillStyle = soft;
  ctx.fillRect(p.sx - rr * 2, p.sy - rr * 2, rr * 4, rr * 4);
  ctx.restore();

  // and the hard little bite where the ball actually meets the cloth
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#04161e";
  ctx.beginPath();
  ctx.ellipse(p.sx, p.sy + rr * 0.02, rr * 0.6, rr * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A ball. Lit from above and slightly behind — the overhead tubes — with the
 * printed face wrapped onto the surface so it slides and foreshortens as the
 * ball turns, and the far pole swinging into view on the other half of the
 * roll. Fast balls are smeared along their own path, which is most of what
 * sells a break as a break.
 */
export function drawBall(ctx: CanvasRenderingContext2D, cam: Cam, b: Ball, focus: number): void {
  const p = project(cam, b.x, b.z, R);
  const r = p.k * R;
  if (r < 0.8 || p.sx < -r * 4 || p.sx > ctx.canvas.width + r * 4) return;

  // The smear runs along the path the ball actually covered this frame,
  // not along its velocity vector — at these speeds the two diverge as soon
  // as a ball is deflected mid-frame, and the smear peels off the ball.
  const prev = project(cam, b.px, b.pz, R);
  const dx = p.sx - prev.sx;
  const dy = p.sy - prev.sy;
  const travel = Math.hypot(dx, dy);
  if (travel > r * 0.16) {
    const steps = Math.max(4, Math.min(14, Math.round(travel / (r * 0.22))));
    const weight = Math.min(1, travel / (r * 1.6)) * 0.5;
    for (let i = steps; i >= 1; i--) {
      const k = i / (steps + 1);
      ctx.save();
      ctx.globalAlpha = (weight / steps) * (1.9 - k);
      body(ctx, b, p.sx - dx * k, p.sy - dy * k, r, focus, true);
      ctx.restore();
    }
  }

  body(ctx, b, p.sx, p.sy, r, focus, false);
}

function body(
  ctx: CanvasRenderingContext2D,
  b: Ball,
  x: number,
  y: number,
  r: number,
  focus: number,
  flat: boolean,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  /* pigment under the clear coat */
  const ivory = b.cue ? "#f7f2e3" : "#f4edda";
  ctx.fillStyle = b.striped || b.cue ? ivory : b.color;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  if (b.striped) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(b.rz, b.rx) * 0.35);
    ctx.fillStyle = b.color;
    ctx.fillRect(-r * 1.4, -r * 0.62 + Math.sin(b.roll) * r * 0.34, r * 2.8, r * 1.24);
    ctx.restore();
  }

  if (!flat && !b.cue && b.face && r > 5) face(ctx, b, x, y, r);

  if (!flat) {
    /*
     * Shading, in the order light actually arrives. Every layer is a soft
     * gradient — the previous version painted a white ellipse on top of a
     * two-stop ramp, which is exactly what makes a sphere look like a
     * sticker on a disc.
     */

    /* the tubes overhead: broad diffuse, terminator low and right */
    const key = ctx.createRadialGradient(
      x - r * 0.3,
      y - r * 0.46,
      r * 0.02,
      x - r * 0.04,
      y - r * 0.08,
      r * 1.32,
    );
    key.addColorStop(0, "rgba(255,253,248,.22)");
    key.addColorStop(0.17, "rgba(255,251,242,.1)");
    key.addColorStop(0.4, "rgba(255,255,255,.015)");
    key.addColorStop(0.64, "rgba(0,0,0,.05)");
    key.addColorStop(0.86, "rgba(0,0,0,.22)");
    key.addColorStop(1, "rgba(0,0,0,.38)");
    ctx.fillStyle = key;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    /* the dark room wrapping the silhouette — a sphere turns away from the
       lens at its edge, and this is what reads as roundness rather than an
       outline drawn round a circle */
    const edge = ctx.createRadialGradient(x, y, r * 0.66, x, y, r);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(0.6, "rgba(3,10,14,.1)");
    edge.addColorStop(0.88, "rgba(3,9,13,.28)");
    edge.addColorStop(1, "rgba(2,6,9,.52)");
    ctx.fillStyle = edge;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    /* cloth bounced back up under the equator */
    const bounce = ctx.createRadialGradient(x, y + r * 0.78, r * 0.02, x, y + r * 0.5, r * 1);
    bounce.addColorStop(0, "rgba(120,214,240,.3)");
    bounce.addColorStop(0.55, "rgba(120,214,240,.09)");
    bounce.addColorStop(1, "rgba(120,214,240,0)");
    ctx.fillStyle = bounce;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    /* clear coat: a wide, very soft sheen over the top third */
    const sheen = ctx.createRadialGradient(
      x - r * 0.18,
      y - r * 0.62,
      r * 0.04,
      x - r * 0.18,
      y - r * 0.5,
      r * 0.92,
    );
    sheen.addColorStop(0, "rgba(255,255,255,.1)");
    sheen.addColorStop(0.5, "rgba(255,255,255,.025)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    /* and the tubes themselves, caught on the polish: soft-edged, small */
    const tube = (ox: number, oy: number, w: number, hgt: number, a: number) => {
      ctx.save();
      ctx.translate(x + r * ox, y + r * oy);
      ctx.rotate(0.14);
      ctx.scale(w, hgt);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.38, `rgba(255,255,255,${a * 0.5})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    tube(-0.27, -0.5, 0.055, 0.2, 0.9);
    tube(-0.09, -0.55, 0.045, 0.16, 0.66);
    tube(0.09, -0.52, 0.038, 0.12, 0.42);
  }
  ctx.restore();

  if (flat) return;

  // the air between here and there takes a little contrast out
  const hz = haze(b, focus);
  if (hz > 0.01) {
    ctx.save();
    ctx.globalAlpha = hz;
    ctx.fillStyle = "#18809b";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** The printed circle and its character, wrapped onto the rolling surface. */
function face(ctx: CanvasRenderingContext2D, b: Ball, x: number, y: number, r: number): void {
  // both poles carry the face, so one is always swinging into view
  for (const pole of [0, Math.PI]) {
    const depth = Math.cos(b.roll + pole);
    if (depth <= 0.08) continue;

    const slide = Math.sin(b.roll + pole);
    // the roll axis lies on the cloth, so on screen it is mostly horizontal
    const ang = Math.atan2(b.rz * 0.32, b.rx);

    ctx.save();
    ctx.translate(x + b.rx * slide * r * 0.5, y + b.rz * slide * r * 0.2);
    ctx.rotate(ang);
    ctx.scale(Math.max(0.08, depth), 1);
    ctx.rotate(-ang);
    ctx.globalAlpha = Math.min(1, depth * 2.2);

    // the circle is under the clear coat, so its edge is soft and it picks
    // up the same light the ball does rather than sitting flat and white
    const disc = ctx.createRadialGradient(-r * 0.14, -r * 0.16, r * 0.04, 0, 0, r * 0.54);
    disc.addColorStop(0, "#fffdf6");
    disc.addColorStop(0.62, "#f5eeddff");
    disc.addColorStop(1, "#e3d9c2");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.1)";
    ctx.lineWidth = r * 0.02;
    ctx.stroke();

    ctx.fillStyle = "#15130e";
    ctx.font = `800 ${(r * (b.face.length > 1 ? 0.56 : 0.72)).toFixed(2)}px "Big Shoulders Display","Arial Black",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.face, 0, r * 0.03);
    ctx.restore();
  }
}

/** The hit: chalk dust and a hard flash of light, gone in a quarter second. */
export function drawImpact(ctx: CanvasRenderingContext2D, cam: Cam, ball: { x: number; z: number }, k: number): void {
  const p = project(cam, ball.x, ball.z, R);
  const r = p.k * R * (1.2 + k * 4);
  ctx.save();
  ctx.globalAlpha = (1 - k) * 0.6;
  const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r);
  g.addColorStop(0, "rgba(255,252,242,.9)");
  g.addColorStop(0.4, "rgba(210,240,250,.28)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export { BED };
