/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE BOW — the break.
 *
 *  The physics runs on the cloth, in TABLE SPACE: `x` across the table and
 *  `z` away from the camera, both in units where a ball is R across. The
 *  camera sits low and close, the way the reference footage is shot, so the
 *  renderer projects that flat plane into perspective — nothing in here
 *  knows about pixels.
 *
 *  How it plays:
 *    1. the rack sits mid-frame, the cue comes in from under the camera
 *    2. fifteen balls break — elastic collisions, cloth friction, spin
 *    3. nine of them, and the cue, run off the edges of the frame
 *    4. the six that stay roll together into  T H E   B O W
 * ─────────────────────────────────────────────────────────────────────────
 */

import { easeTo, identity, restMatrix, spin } from "./ball";

/* ── the cloth ────────────────────────────────────────────────────────── */

/** Ball radius. Everything else is expressed in these. */
export const R = 5.6;

/**
 * The bed. The camera never sees the side rails — as in the footage — so
 * the only cushion that matters is the far one, across the top of frame.
 */
export const BED = {
  /** Cushion the camera can see, in front of the dark room beyond it. */
  far: 112,
  /** Past here a ball has left the shot for good. */
  near: -34,
  /**
   * Half-width of the simulated bed. Well outside the frame, but no wider
   * than it needs to be — the nine have to clear it before the sequence
   * ends, and every extra unit is distance they have to cover.
   */
  half: 96,
};

/* ── balls ────────────────────────────────────────────────────────────── */

export interface Ball {
  /** Stable across the whole sequence, so the sprite cache can key on it. */
  id: string;
  /** Staggers when this ball starts making for the edge of frame. */
  clearDelay: number;
  /** Which way out it committed to, latched so it can't dither near centre. */
  clearDir: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  color: string;
  striped: boolean;
  cue: boolean;
  /** Set on the six that spell the name — the marker for "this one stays". */
  letter?: string;
  /** What's printed on the ball right now. */
  face: string;
  /**
   * What the six that stay turn over to once the cue arrives. Racked, they
   * wear their numbers like any other set; the name only appears out of the
   * break, while every ball is tumbling too fast for the change to be seen.
   */
  letterFace?: string;
  /**
   * How the ball is turned: a row-major 3×3 mapping the ball's own frame
   * into the room. Rolling turns it; there is no separate "roll angle",
   * because a ball that has been knocked about doesn't have one.
   */
  m: Float64Array;
  /** Resting slot, for the six that stay. */
  tx: number;
  tz: number;
  /** Position at the start of the frame, so the renderer smears along the
   *  path actually travelled rather than guessing from velocity. */
  px: number;
  pz: number;
  /** Off the edge of the shot. */
  gone: boolean;
}

/**
 * The six that stay. Colours follow the low solids, in the muted, slightly
 * aged register of the room rather than anything fluorescent.
 */
export const NAME = [
  { ch: "T", color: "#edb01c" },
  { ch: "H", color: "#2258b4" },
  { ch: "E", color: "#cf2d22" },
  { ch: "B", color: "#67338f" },
  { ch: "O", color: "#e8721a" },
  { ch: "W", color: "#1a7d4b" },
] as const;

/** The nine that don't: the 7, the 8, and the stripes. */
const REST = [
  { color: "#8e2430", striped: false, face: "7" },
  { color: "#17171a", striped: false, face: "8" },
  { color: "#edb01c", striped: true, face: "9" },
  { color: "#2258b4", striped: true, face: "10" },
  { color: "#cf2d22", striped: true, face: "11" },
  { color: "#67338f", striped: true, face: "12" },
  { color: "#e8721a", striped: true, face: "13" },
  { color: "#1a7d4b", striped: true, face: "14" },
  { color: "#8e2430", striped: true, face: "15" },
] as const;

/** Rack slots for the lettered balls — spread across all five rows. */
const NAME_SLOTS = [0, 2, 6, 9, 11, 14];
/** The 8 is racked dead centre, as it always is. */
const EIGHT_SLOT = 4;

/* ── the stroke ───────────────────────────────────────────────────────── */

/**
 * The camera's downward pitch. The renderer derives the exact figure from
 * the viewport, but it only ever varies by a couple of degrees, and this is
 * used solely to square the printed faces to the lens when the balls stop.
 */
export const CAM_PITCH = 0.23;
const SQUARE = restMatrix(CAM_PITCH);

/** How far a ball is from sitting with its number square to the camera. */
function turned(m: Float64Array): number {
  let d = 0;
  for (let i = 0; i < 9; i++) d += Math.abs(m[i] - SQUARE[i]);
  return d;
}

/**
 * A ball racked at some arbitrary angle, as they always are — except the
 * apex, which is turned so its number faces the lens. It is the ball the
 * shot opens on, and it is what says "an ordinary set" before the break
 * turns the six over to letters.
 */
function tumbled(seed: number): Float64Array {
  if (seed === 0) {
    const m = restMatrix(CAM_PITCH);
    // not quite square to the camera, or it reads as a decal
    spin(m, 0, 0, 1, 0.16);
    spin(m, 1, 0, 0, -0.1);
    return m;
  }
  const m = identity();
  spin(m, 0, 1, 0, seed * 1.31);
  spin(m, 1, 0, 0, seed * 0.77 + 0.4);
  spin(m, 0, 0, 1, seed * 2.11);
  return m;
}

/*
 * Cloth drag, units/s². This was steep enough to take the whole break's
 * energy inside a second, which left the tail of the sequence having to
 * re-accelerate balls that had all but stopped. A real break rolls on for
 * several seconds; letting it decay at something closer to that rate is
 * what makes the shot read as one continuous motion.
 */
export const CLOTH_DECEL = 30;
export const BREAK_SPEED = 560;   // a hard, flat break
const CUSHION = 0.7;              // rebound off the far rubber
const BALL_REST = 0.955;          // ball on ball is very nearly elastic

/**
 * Clock marks, seconds from the first frame. The shot holds on the rack,
 * the cue is released, and it reaches the apex a sixth of a second later —
 * the geometry is fixed, so the flash can be timed rather than detected.
 */
export const T_STRIKE = 0.45;
export const T_CONTACT = T_STRIKE + 0.167;
/*
 * These used to sit far enough apart that the break ran out of energy
 * between them: the scatter decayed almost to a standstill, the nine picked
 * themselves up and made for the edge, and then the six accelerated harder
 * than the break itself to reach their slots. Two re-accelerations after a
 * lull is what reads as the animation pausing and starting again. They now
 * overlap, so one continuous decay carries the whole shot.
 */
export const T_CLEAR = T_CONTACT + 0.2;
export const T_ASSEMBLE = T_CONTACT + 0.5;
export const T_COPY = T_CONTACT + 0.2;

/** Where the cue ball waits, just in front of the rack, close to the lens. */
export const CUE_START = { x: 1.6, z: -70 };
/** Apex of the rack. */
const APEX_Z = 40;

/**
 * Rack the table. `stacked` sets the name on two rows (THE over BOW) for
 * tall, narrow frames; otherwise it reads across in one.
 */
export function rack(stacked: boolean): Ball[] {
  const slots = targets(stacked);
  const balls: Ball[] = [];

  const gap = R * 2.03;
  const rowDZ = gap * 0.866;
  const pos: { x: number; z: number }[] = [];
  let n = 0;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i <= row; i++) {
      pos[n] = {
        // a rack is never perfect; a hair of slop keeps the spread organic
        x: (i - row / 2) * gap + Math.sin(n * 31.7) * R * 0.035,
        z: APEX_Z + row * rowDZ,
      };
      n++;
    }
  }

  const fill = REST.filter((_, i) => i !== 1);
  let fillIdx = 0;

  for (let i = 0; i < 15; i++) {
    const nameIdx = NAME_SLOTS.indexOf(i);
    // racked, the six wear their numbers like any other set
    const spec =
      nameIdx >= 0
        ? { color: NAME[nameIdx].color, striped: false, face: String(nameIdx + 1) }
        : i === EIGHT_SLOT
          ? REST[1]
          : fill[fillIdx++];

    balls.push({
      id: `b${i}`,
      clearDelay: (i % 5) * 0.05,
      clearDir: 0,
      x: pos[i].x,
      z: pos[i].z,
      vx: 0,
      vz: 0,
      color: spec.color,
      striped: spec.striped,
      cue: false,
      letter: nameIdx >= 0 ? NAME[nameIdx].ch : undefined,
      face: spec.face,
      letterFace: nameIdx >= 0 ? NAME[nameIdx].ch : undefined,
      m: tumbled(i),
      tx: nameIdx >= 0 ? slots[nameIdx].x : 0,
      tz: nameIdx >= 0 ? slots[nameIdx].z : 0,
      px: pos[i].x,
      pz: pos[i].z,
      gone: false,
    });
  }

  balls.push({
    id: "cue",
    clearDelay: 0.3,
    clearDir: 0,
    x: CUE_START.x,
    z: CUE_START.z,
    vx: 0,
    vz: 0,
    color: "#f4ecd8",
    striped: false,
    cue: true,
    face: "",
    m: identity(),
    tx: 0,
    tz: 0,
    px: CUE_START.x,
    pz: CUE_START.z,
    gone: false,
  });

  return balls;
}

/**
 * Where the six come to rest. They settle a little way back from the lens,
 * far enough that all six are in shot and near enough to fill it.
 */
export function targets(stacked: boolean): { x: number; z: number }[] {
  const step = R * 2.5;
  const wordGap = R * 1.7;
  const out: { x: number; z: number }[] = [];

  if (stacked) {
    const rows = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    rows.forEach((row, ri) => {
      const span = step * (row.length - 1);
      row.forEach((idx, i) => {
        out[idx] = {
          x: -span / 2 + i * step,
          // THE sits deeper than BOW, so on screen it lands above it and the
          // name reads top to bottom the way it's written
          z: 46 + (1 - ri) * R * 3.6,
        };
      });
    });
  } else {
    const span = step * 5 + wordGap;
    let x = -span / 2;
    for (let i = 0; i < 6; i++) {
      out[i] = { x, z: 40 };
      x += step + (i === 2 ? wordGap : 0);
    }
  }
  return out;
}

/** Drop straight to the end state — the reduced-motion frame. */
export function settle(balls: Ball[]): void {
  for (const b of balls) {
    if (b.letterFace) b.face = b.letterFace;
    if (!b.letter) {
      b.gone = true;
      continue;
    }
    b.x = b.tx;
    b.z = b.tz;
    b.vx = 0;
    b.vz = 0;
    b.m = restMatrix(CAM_PITCH);
    b.px = b.x;
    b.pz = b.z;
  }
}

/* ── simulation ───────────────────────────────────────────────────────── */

/**
 * Two balls on their way to different slots sometimes have to swap sides.
 * Head on, the spring pulling each one forward and the contact pushing it
 * back reach a standstill, and the pair settle into each other's slots — the
 * name comes out misspelt. This nudges each of them across the contact, in
 * whichever direction takes it nearer its own slot, so they roll around one
 * another instead of jamming.
 *
 * The earlier fix was to stop resolving these contacts once the balls were
 * close to home. That sorted the spelling but let them pass through each
 * other in plain view.
 */
function slide(a: Ball, b: Ball, dt: number): void {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const d = Math.hypot(dx, dz);
  if (d < 1e-4 || d > R * 2.4) return;
  const nx = dx / d;
  const nz = dz / d;
  const gain = 190 * dt;

  const nudge = (ball: Ball, sx: number, sz: number) => {
    const gx = ball.tx - ball.x;
    const gz = ball.tz - ball.z;
    const into = gx * sx + gz * sz;
    if (into <= 0) return; // already heading away from the contact
    let tx = gx - into * sx;
    let tz = gz - into * sz;
    let len = Math.hypot(tx, tz);
    if (len < 1e-3) {
      // dead head-on: break the symmetry the same way every time, so the
      // pair always resolves, and always resolves identically
      tx = -sz;
      tz = sx;
      if (ball.tx < ball.x) {
        tx = -tx;
        tz = -tz;
      }
      len = 1;
    }
    ball.vx += (tx / len) * gain;
    ball.vz += (tz / len) * gain;
  };

  nudge(a, nx, nz);
  nudge(b, -nx, -nz);
}

/** Elastic impulse along the contact normal, with the overlap pushed out. */
export function collide(a: Ball, b: Ball, restitution: number): void {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const d2 = dx * dx + dz * dz;
  const min = R * 2;
  if (d2 <= 1e-6 || d2 >= min * min) return;

  const d = Math.sqrt(d2);
  const nx = dx / d;
  const nz = dz / d;
  const push = (min - d) * 0.5;
  a.x -= nx * push;
  a.z -= nz * push;
  b.x += nx * push;
  b.z += nz * push;

  const sep = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
  if (sep > 0) return;
  const j = (-(1 + restitution) * sep) / 2;
  a.vx -= j * nx;
  a.vz -= j * nz;
  b.vx += j * nx;
  b.vz += j * nz;
}

/**
 * The simulation runs on a fixed step regardless of frame rate.
 *
 * On a break the cue is doing 620 units/s, which is close to two ball
 * widths in a single 60fps frame. Integrating that in one go means balls
 * pass through each other, contacts resolve a frame late, and the whole
 * scatter arrives in visible chunks. Stepping at 1/360s costs a handful of
 * cheap iterations and the break comes out smooth and properly ordered.
 */
const SUBSTEP = 1 / 360;
const MAX_SUBSTEPS = 32;

export function step(balls: Ball[], dt: number, t: number): boolean {
  for (const b of balls) {
    b.px = b.x;
    b.pz = b.z;
  }

  let moving = false;
  let done = 0;
  let clock = t - dt;
  let n = 0;
  while (done < dt - 1e-7 && n++ < MAX_SUBSTEPS) {
    const h = Math.min(SUBSTEP, dt - done);
    done += h;
    clock += h;
    if (substep(balls, h, clock)) moving = true;
  }
  return moving;
}

/** One fixed step of the simulation. */
function substep(balls: Ball[], dt: number, t: number): boolean {
  let moving = false;
  const assembling = t >= T_ASSEMBLE;

  for (const b of balls) {
    if (b.gone) continue;

    if (b.letterFace && t >= T_CONTACT) b.face = b.letterFace;

    if (b.letter && assembling) {
      // critically damped: it arrives, and it doesn't wobble when it does
      /*
       * Force is stiffness times distance, so the stiffness has to start low
       * and finish high: gentle while the balls are still far out, or they
       * surge; firm once they are close, or the last half a ball's width
       * takes seconds to close and the sequence overruns its own timeout.
       */
      const k = Math.min(1, (t - T_ASSEMBLE) / 0.85);
      const pull = 8 + 36 * k;
      b.vx += (b.tx - b.x) * pull * dt;
      b.vz += (b.tz - b.z) * pull * dt;
      const damp = Math.pow(0.88 - 0.14 * k, dt * 60);
      b.vx *= damp;
      b.vz *= damp;
    } else if (!b.letter && t >= T_CLEAR + b.clearDelay) {
      /*
       * The nine and the cue drift out of the shot. This is a steady push
       * toward the nearest edge, eased in — not a floor under their speed.
       * A floor is a step: every ball that had slowed below it got snapped
       * back up to pace on a single tick, which is the lurch that read as
       * the animation stopping and starting again.
       */
      const lean = Math.min(1, (t - T_CLEAR - b.clearDelay) * 2.5);
      const ease = lean * lean * (3 - 2 * lean);
      // commit to a side once, or a ball sitting near the centre line will
      // dither as its x creeps across zero and never get anywhere
      if (!b.clearDir) b.clearDir = b.x >= 0 ? 1 : -1;
      const push = 95 * ease;
      b.vx += b.clearDir * 0.86 * push * dt;
      b.vz += -0.5 * push * dt;
    }

    // cloth: a rolling ball sheds speed at a near-constant rate. The six on
    // their way to a slot are carried by the spring instead — constant drag
    // would overpower it within a ball's width and park them short.
    const guided = !!b.letter && assembling;
    const sp = Math.hypot(b.vx, b.vz);
    if (sp > 0) {
      const next = guided ? sp : Math.max(0, sp - CLOTH_DECEL * dt);
      if (next <= (guided ? 0.12 : 0.6)) {
        b.vx = 0;
        b.vz = 0;
      } else {
        b.vx = (b.vx / sp) * next;
        b.vz = (b.vz / sp) * next;
        // rolling without slipping: v = omega x (contact point), which puts
        // the axis flat on the cloth and square to the direction of travel
        spin(b.m, -b.vz / next, 0, b.vx / next, (next / R) * dt);
        moving = true;
      }
    }

    b.x += b.vx * dt;
    b.z += b.vz * dt;

    // only the far cushion is in shot; the six never leave the bed
    if (b.z > BED.far - R) {
      b.z = BED.far - R;
      b.vz = -Math.abs(b.vz) * CUSHION;
      b.vx *= 0.94;
    }
    if (b.letter) {
      if (b.z < BED.near + R * 2) {
        b.z = BED.near + R * 2;
        b.vz = Math.abs(b.vz) * CUSHION;
      }
      if (Math.abs(b.x) > BED.half - R) {
        b.x = Math.sign(b.x) * (BED.half - R);
        b.vx = -b.vx * CUSHION;
      }
    } else if (t >= T_CONTACT && (b.z < BED.near || Math.abs(b.x) > BED.half)) {
      // not before contact: the cue ball waits outside the shot until then,
      // and culling on position alone would retire it before it ever runs
      b.gone = true;
    }

    if (b.letter && assembling) {
      // bring the printed face square to the lens as the ball comes to rest
      easeTo(b.m, SQUARE, 1 - Math.pow(0.86, dt * 60));
      if (Math.abs(b.tx - b.x) + Math.abs(b.tz - b.z) > 0.4) moving = true;
    }
  }

  const rest = assembling ? 0.35 : BALL_REST;
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.gone) continue;
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      if (b.gone) continue;
      collide(a, b, rest);
      if (assembling && a.letter && b.letter) slide(a, b, dt);
    }
  }

  return moving;
}

/** True once the six are home and everyone else has left the shot. */
export function done(balls: Ball[]): boolean {
  for (const b of balls) {
    if (!b.letter) {
      if (!b.gone) return false;
      // a third of a millimetre on a real ball: past this the spring is
      // still converging but nothing on screen is moving any more
    } else if (Math.abs(b.tx - b.x) + Math.abs(b.tz - b.z) > 0.8 || turned(b.m) > 0.05) {
      return false;
    }
  }
  return true;
}
