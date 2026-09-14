/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE BOW — pool balls, rendered rather than drawn.
 *
 *  The previous version painted a ball: a couple of radial gradients, a
 *  rectangle skewed about for the stripe, and the number squashed into an
 *  ellipse. That can't survive a ball rolling — the stripe slides, the
 *  number smears across the face, and the whole thing reads as a cartoon.
 *
 *  This shades a real sphere per pixel. Each ball carries a 3×3 rotation
 *  matrix that the physics turns as it rolls; for every pixel of the
 *  sprite we take the surface normal, rotate it into the ball's own frame,
 *  and ask what is painted there — pigment, the white of a polar cap, or a
 *  number. Then we light it: a key, three fluorescent tubes overhead for
 *  the triple highlight every pool ball has, light bounced up off the
 *  cloth, and a Fresnel falloff at the silhouette.
 *
 *  The expensive half of that — the normals and all the lighting — doesn't
 *  depend on the ball's rotation at all, so it is computed once per sprite
 *  size and reused by every ball on the table.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ── the printed character ─────────────────────────────────────────────── */

const GLYPH = 72;
const glyphs = new Map<string, Uint8ClampedArray>();

/** The character, rendered once, kept as coverage. */
function glyph(ch: string): Uint8ClampedArray {
  const hit = glyphs.get(ch);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = c.height = GLYPH;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.clearRect(0, 0, GLYPH, GLYPH);
  g.fillStyle = "#000";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `800 ${GLYPH * (ch.length > 1 ? 0.62 : 0.78)}px "Big Shoulders Display","Arial Black",sans-serif`;
  g.fillText(ch, GLYPH / 2, GLYPH * 0.52);

  const px = g.getImageData(0, 0, GLYPH, GLYPH).data;
  const cover = new Uint8ClampedArray(GLYPH * GLYPH);
  for (let i = 0; i < cover.length; i++) cover[i] = px[i * 4 + 3];
  glyphs.set(ch, cover);
  return cover;
}

/** Fonts land late; the first glyphs get baked in a fallback face. */
export function dropGlyphCache(): void {
  glyphs.clear();
}

/* ── lighting, which doesn't care how the ball is turned ───────────────── */

interface Shade {
  size: number;
  /** Surface normal in room space. */
  nx: Float32Array;
  ny: Float32Array;
  nz: Float32Array;
  /** Diffuse, specular, bounced light off the cloth, silhouette falloff. */
  dif: Float32Array;
  spec: Float32Array;
  bounce: Float32Array;
  edge: Float32Array;
  /** Coverage, so the silhouette isn't a staircase. */
  cover: Float32Array;
}

const shades = new Map<number, Shade>();

function norm(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

/**
 * The tubes over the table, and the room they sit in. Room space has z
 * running away from the lens, so a light in front of the ball has a
 * negative z — with the sign the other way round every light sits behind
 * the balls and the printed faces come out unlit and grey.
 */
const KEY = norm(-0.3, 0.88, -0.36);
const FILL = norm(0.6, 0.24, -0.62);
const TUBES = [norm(-0.4, 0.9, -0.3), norm(-0.13, 0.96, -0.24), norm(0.14, 0.93, -0.2)];
const TUBE_POWER = [1, 0.72, 0.46];

function shade(size: number, pitch: number): Shade {
  const hit = shades.get(size);
  if (hit) return hit;

  const n = size * size;
  const s: Shade = {
    size,
    nx: new Float32Array(n),
    ny: new Float32Array(n),
    nz: new Float32Array(n),
    dif: new Float32Array(n),
    spec: new Float32Array(n),
    bounce: new Float32Array(n),
    edge: new Float32Array(n),
    cover: new Float32Array(n),
  };

  const rs = size / 2;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = py * size + px;
      // screen space: x right, y up, z out of the screen toward the viewer
      const vx = (px + 0.5 - rs) / rs;
      const vy = -((py + 0.5 - rs) / rs);
      const d2 = vx * vx + vy * vy;
      if (d2 >= 1) {
        s.cover[i] = 0;
        continue;
      }
      const vz = Math.sqrt(1 - d2);
      // a pixel of feathering at the edge, or the silhouette crawls
      s.cover[i] = Math.min(1, (1 - Math.sqrt(d2)) * rs);

      /*
       * Into room space. The camera looks down at the table, so "up" in the
       * room is tipped toward the viewer, and the room's z runs away from
       * the lens — the opposite of the view's z, which runs toward it.
       * Getting that sign wrong mirrors the printed characters, which is
       * only visible on the letters that aren't symmetrical.
       */
      const wx = vx;
      const wy = vy * cp + vz * sp;
      const wz = vy * sp - vz * cp;
      s.nx[i] = wx;
      s.ny[i] = wy;
      s.nz[i] = wz;

      // a hemisphere of soft light from the room over the table, plus the
      // key and a weak fill from the front
      const sky = 0.5 + 0.5 * wy;
      const dif =
        Math.max(0, wx * KEY[0] + wy * KEY[1] + wz * KEY[2]) * 0.72 +
        Math.max(0, wx * FILL[0] + wy * FILL[1] + wz * FILL[2]) * 0.26 +
        sky * 0.26;
      s.dif[i] = dif;

      // Blinn-Phong against each tube, plus a broad sheen off the clear coat
      let spec = 0;
      for (let t = 0; t < TUBES.length; t++) {
        const L = TUBES[t];
        const [hx, hy, hz] = norm(L[0], L[1], L[2] + 1);
        const nh = Math.max(0, wx * hx + wy * hy + wz * hz);
        spec += Math.pow(nh, 230) * 1.15 * TUBE_POWER[t];
        spec += Math.pow(nh, 22) * 0.09 * TUBE_POWER[t];
      }
      s.spec[i] = spec;

      // the cloth throws a little light back up under the equator
      s.bounce[i] = Math.pow(Math.max(0, -wy), 1.4) * 0.5;

      // grazing angles show the dark room rather than the pigment
      s.edge[i] = Math.pow(1 - vz, 3.2);
    }
  }

  shades.set(size, s);
  return s;
}

/** Sprite tables are tied to the camera pitch; drop them when it changes. */
export function dropShadeCache(): void {
  shades.clear();
}

/* ── the ball ──────────────────────────────────────────────────────────── */

export interface Skin {
  /** Pigment, as r/g/b 0-255. */
  r: number;
  g: number;
  b: number;
  striped: boolean;
  cue: boolean;
  face: string;
}

export function rgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Where the white polar caps start on a stripe, and the number circle. */
const CAP = 0.56;
const FACE = 0.855;
const FACE_SCALE = 1 / Math.sqrt(1 - FACE * FACE);

/** Bounced light takes the colour of the cloth. */
let bounceRGB: [number, number, number] = [40, 150, 90];
export function setClothColour(hex: string): void {
  bounceRGB = rgb(hex);
}

const sprites = new Map<string, { canvas: HTMLCanvasElement; key: string }>();

/** One scratch buffer per sprite size, shared by every ball. */
const buffers = new Map<number, ImageData>();
function buffer(ctx: CanvasRenderingContext2D, size: number): ImageData {
  let img = buffers.get(size);
  if (!img) {
    img = ctx.createImageData(size, size);
    buffers.set(size, img);
  }
  return img;
}

/**
 * Renders the ball at `size` pixels across, turned by `m` (a row-major 3×3
 * mapping the ball's own frame into the room), and returns a sprite ready
 * to blit. Sprites are cached on rotation, so a ball at rest costs nothing.
 */
export function sprite(
  id: string,
  skin: Skin,
  m: Float64Array,
  size: number,
  pitch: number,
): HTMLCanvasElement {
  const key =
    `${size}|` +
    `${m[0].toFixed(2)},${m[1].toFixed(2)},${m[2].toFixed(2)},` +
    `${m[3].toFixed(2)},${m[4].toFixed(2)},${m[5].toFixed(2)},` +
    `${m[6].toFixed(2)},${m[7].toFixed(2)},${m[8].toFixed(2)}`;

  const held = sprites.get(id);
  if (held && held.key === key && held.canvas.width === size) return held.canvas;

  const canvas = held?.canvas ?? document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = buffer(ctx, size);
  const out = img.data;

  const s = shade(size, pitch);
  const face = skin.face ? glyph(skin.face) : null;

  const ivoryR = skin.cue ? 247 : 244;
  const ivoryG = skin.cue ? 242 : 237;
  const ivoryB = skin.cue ? 227 : 218;

  for (let i = 0; i < size * size; i++) {
    const cover = s.cover[i];
    if (cover <= 0) {
      out[i * 4 + 3] = 0;
      continue;
    }

    const nx = s.nx[i];
    const ny = s.ny[i];
    const nz = s.nz[i];

    // into the ball's own frame: transpose of the rotation
    const ox = m[0] * nx + m[3] * ny + m[6] * nz;
    const oy = m[1] * nx + m[4] * ny + m[7] * nz;
    const oz = m[2] * nx + m[5] * ny + m[8] * nz;

    let cr: number;
    let cg: number;
    let cb: number;

    const ay = oy < 0 ? -oy : oy;
    if (skin.striped && ay < CAP) {
      cr = skin.r;
      cg = skin.g;
      cb = skin.b;
    } else if (skin.striped || skin.cue) {
      cr = ivoryR;
      cg = ivoryG;
      cb = ivoryB;
    } else {
      cr = skin.r;
      cg = skin.g;
      cb = skin.b;
    }

    if (face && ay > FACE) {
      // the printed circle, and the character inside it
      cr = 250;
      cg = 246;
      cb = 234;
      let u = ox * FACE_SCALE;
      const w = oz * FACE_SCALE;
      if (oy < 0) u = -u;
      const gx = ((u * 0.5 + 0.5) * GLYPH) | 0;
      const gy = ((0.5 - w * 0.5) * GLYPH) | 0;
      if (gx >= 0 && gx < GLYPH && gy >= 0 && gy < GLYPH) {
        const a = face[gy * GLYPH + gx] / 255;
        if (a > 0) {
          cr += (26 - cr) * a;
          cg += (24 - cg) * a;
          cb += (20 - cb) * a;
        }
      }
    }

    const lit = 0.2 + s.dif[i];
    const bo = s.bounce[i];
    const sp = s.spec[i];
    const dark = 1 - s.edge[i] * 0.6;

    let r = (cr * lit + bounceRGB[0] * bo) * dark + 255 * sp;
    let g = (cg * lit + bounceRGB[1] * bo) * dark + 255 * sp;
    let b = (cb * lit + bounceRGB[2] * bo) * dark + 255 * sp;

    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;

    const o = i * 4;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    out[o + 3] = cover * 255;
  }

  ctx.putImageData(img, 0, 0);
  sprites.set(id, { canvas, key });
  return canvas;
}

export function dropSprites(): void {
  sprites.clear();
}

/* ── turning the ball ──────────────────────────────────────────────────── */

/** A ball sitting still with its number square to the camera. */
export function restMatrix(pitch: number): Float64Array {
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  // the number faces the lens, and "up" on the ball is up on screen
  return new Float64Array([1, 0, 0, 0, s, c, 0, -c, s]);
}

export function identity(): Float64Array {
  return new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
}

/**
 * Turns `m` by `angle` about `(ax, ay, az)`, in place. Rolling without
 * slipping: a ball moving along the cloth turns about the horizontal axis
 * square to its travel.
 */
export function spin(m: Float64Array, ax: number, ay: number, az: number, angle: number): void {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  const r0 = t * ax * ax + c;
  const r1 = t * ax * ay - s * az;
  const r2 = t * ax * az + s * ay;
  const r3 = t * ax * ay + s * az;
  const r4 = t * ay * ay + c;
  const r5 = t * ay * az - s * ax;
  const r6 = t * ax * az - s * ay;
  const r7 = t * ay * az + s * ax;
  const r8 = t * az * az + c;

  const a = m[0];
  const b = m[1];
  const d = m[2];
  const e = m[3];
  const f = m[4];
  const g = m[5];
  const h = m[6];
  const i = m[7];
  const j = m[8];

  m[0] = r0 * a + r1 * e + r2 * h;
  m[1] = r0 * b + r1 * f + r2 * i;
  m[2] = r0 * d + r1 * g + r2 * j;
  m[3] = r3 * a + r4 * e + r5 * h;
  m[4] = r3 * b + r4 * f + r5 * i;
  m[5] = r3 * d + r4 * g + r5 * j;
  m[6] = r6 * a + r7 * e + r8 * h;
  m[7] = r6 * b + r7 * f + r8 * i;
  m[8] = r6 * d + r7 * g + r8 * j;
}

/** Eases `m` toward `to`, keeping it a rotation. */
export function easeTo(m: Float64Array, to: Float64Array, k: number): void {
  for (let i = 0; i < 9; i++) m[i] += (to[i] - m[i]) * k;
  orthonormalise(m);
}

/** Drags the matrix back onto the rotation group after floating-point drift. */
export function orthonormalise(m: Float64Array): void {
  let ax = m[0];
  let ay = m[1];
  let az = m[2];
  let l = Math.hypot(ax, ay, az) || 1;
  ax /= l;
  ay /= l;
  az /= l;

  let bx = m[3];
  let by = m[4];
  let bz = m[5];
  const d = ax * bx + ay * by + az * bz;
  bx -= ax * d;
  by -= ay * d;
  bz -= az * d;
  l = Math.hypot(bx, by, bz) || 1;
  bx /= l;
  by /= l;
  bz /= l;

  m[0] = ax;
  m[1] = ay;
  m[2] = az;
  m[3] = bx;
  m[4] = by;
  m[5] = bz;
  // third row is the cross product of the first two
  m[6] = ay * bz - az * by;
  m[7] = az * bx - ax * bz;
  m[8] = ax * by - ay * bx;
}
