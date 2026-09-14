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

import { rgb, setClothColour, sprite } from "./ball";
import type { Skin } from "./ball";
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
 * The room is painted once and blitted thereafter.
 *
 * It used to be repainted every frame on the theory that a few gradients
 * are cheaper than holding a bitmap. That is true at small sizes and badly
 * false at large ones: on a 1080p display with a 2x backing store these
 * gradients, the cloth pattern and the vignette cover eight million pixels
 * a frame, which on its own was holding the break at about fifteen frames
 * a second. Nothing in here moves, so none of it needs redrawing.
 */
let room: { canvas: HTMLCanvasElement; w: number; h: number; dpr: number } | null = null;

export function dropRoomCache(): void {
  room = null;
}

export function drawRoom(ctx: CanvasRenderingContext2D, cam: Cam, w: number, h: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!room || room.w !== w || room.h !== h || room.dpr !== dpr) {
    const canvas = room?.canvas ?? document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintRoom(g, cam, w, h);
    room = { canvas, w, h, dpr };
  }
  ctx.drawImage(room.canvas, 0, 0, w, h);
}

function paintRoom(ctx: CanvasRenderingContext2D, cam: Cam, w: number, h: number): void {
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

  /* the far cushion and the rail behind it, with a sight set into the wood */
  const railH = Math.max(6, h * 0.028);
  const rail = ctx.createLinearGradient(0, hz - railH, 0, hz + railH * 0.3);
  rail.addColorStop(0, "#1d1108");
  rail.addColorStop(0.3, "#5a3a1d");
  rail.addColorStop(0.55, "#33200f");
  rail.addColorStop(1, "#150d06");
  ctx.fillStyle = rail;
  ctx.fillRect(0, hz - railH, w, railH * 1.3);
  ctx.fillStyle = "rgba(226,196,140,.2)";
  ctx.fillRect(0, hz - railH, w, Math.max(1, railH * 0.09));

  /* a cloth-covered lip where the cushion meets the bed */
  const lip = ctx.createLinearGradient(0, hz - railH * 0.12, 0, hz + railH * 0.5);
  lip.addColorStop(0, "#0a2e19");
  lip.addColorStop(1, "#134a28");
  ctx.fillStyle = lip;
  ctx.fillRect(0, hz - railH * 0.12, w, railH * 0.62);

  /* mother-of-pearl diamonds, the giveaway that this is a real table */
  ctx.save();
  ctx.fillStyle = "rgba(240,232,208,.66)";
  for (let i = 1; i <= 6; i++) {
    const dx = (w / 7) * i;
    ctx.save();
    ctx.translate(dx, hz - railH * 0.58);
    ctx.rotate(Math.PI / 4);
    const dsz = Math.max(1.6, railH * 0.16);
    ctx.fillRect(-dsz / 2, -dsz / 2, dsz, dsz);
    ctx.restore();
  }
  ctx.restore();

  /* the bed */
  const bed = ctx.createLinearGradient(0, hz, 0, h);
  bed.addColorStop(0, "#0d3f24");
  bed.addColorStop(0.16, "#186c39");
  bed.addColorStop(0.52, "#1f8a46");
  bed.addColorStop(1, "#11512c");
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
  pool.addColorStop(0, "rgba(212,255,206,.24)");
  pool.addColorStop(0.42, "rgba(110,220,130,.08)");
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
  soft.addColorStop(0, "rgba(5,26,14,.36)");
  soft.addColorStop(0.55, "rgba(5,26,14,.17)");
  soft.addColorStop(1, "rgba(5,26,14,0)");
  ctx.save();
  ctx.translate(p.sx + rr * 0.06, p.sy + rr * 0.04);
  ctx.scale(1, 0.3);
  ctx.translate(-p.sx, -p.sy);
  ctx.fillStyle = soft;
  ctx.fillRect(p.sx - rr * 2, p.sy - rr * 2, rr * 4, rr * 4);
  ctx.restore();

  // and the hard little bite where the ball actually meets the cloth
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#05190d";
  ctx.beginPath();
  ctx.ellipse(p.sx, p.sy + rr * 0.02, rr * 0.6, rr * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Pigment, resolved once per ball. */
const skins = new Map<string, Skin>();
function skinFor(b: Ball): Skin {
  const key = `${b.color}|${b.striped}|${b.cue}|${b.face}`;
  let sk = skins.get(key);
  if (!sk) {
    const [r, g, bl] = rgb(b.color);
    sk = { r, g, b: bl, striped: b.striped, cue: b.cue, face: b.face };
    skins.set(key, sk);
  }
  return sk;
}

export { setClothColour };

/**
 * A ball, blitted from a shaded sphere.
 *
 * Sprites are rendered coarse while the table is busy and fine once it has
 * settled: mid-break every ball is smeared across several stamps anyway, and
 * nobody can see the difference, whereas the six that stop get looked at.
 */
export function drawBall(
  ctx: CanvasRenderingContext2D,
  cam: Cam,
  b: Ball,
  focus: number,
  busy: boolean,
): void {
  const p = project(cam, b.x, b.z, R);
  const r = p.k * R;
  if (r < 0.8 || p.sx < -r * 4 || p.sx > ctx.canvas.width + r * 4) return;

  const cap = busy ? 80 : 256;
  const size = Math.max(16, Math.min(cap, Math.round(r * 2)));
  const pitch = Math.asin(cam.sin);
  const img = sprite(b.id, skinFor(b), b.m, size, pitch);

  const d = r * 2;
  const put = (cx: number, cy: number, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, cx - r, cy - r, d, d);
    ctx.restore();
  };

  // The smear runs along the path the ball actually covered this frame, not
  // along its velocity vector — the two diverge the moment a ball is
  // deflected mid-frame, and the smear peels off the ball.
  const prev = project(cam, b.px, b.pz, R);
  const dx = p.sx - prev.sx;
  const dy = p.sy - prev.sy;
  const travel = Math.hypot(dx, dy);
  if (travel > r * 0.16) {
    const steps = Math.max(3, Math.min(9, Math.round(travel / (r * 0.34))));
    const weight = Math.min(1, travel / (r * 1.5)) * 0.55;
    for (let i = steps; i >= 1; i--) {
      const k = i / (steps + 1);
      put(p.sx - dx * k, p.sy - dy * k, (weight / steps) * (1.9 - k));
    }
  }

  put(p.sx, p.sy, 1);

  // the air between here and there takes a little contrast out
  const hz = haze(b, focus);
  if (hz > 0.01) {
    ctx.save();
    ctx.globalAlpha = hz;
    ctx.fillStyle = "#1c6b3c";
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();
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
  g.addColorStop(0.4, "rgba(224,250,214,.28)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export { BED };
