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

/* ── the cloth ────────────────────────────────────────────────────────── */

/** Ball radius. Everything else is expressed in these. */
export const R = 5.6;

/**
 * The bed. The camera never sees the side rails — as in the footage — so
 * the only cushion that matters is the far one, across the top of frame.
 */
export const BED = {
  /** Cushion the camera can see, in front of the dark room beyond it. */
  far: 138,
  /** Past here a ball has left the shot for good. */
  near: -34,
  /** Half-width of the simulated bed; well outside the frame. */
  half: 150,
};

/* ── balls ────────────────────────────────────────────────────────────── */

export interface Ball {
  x: number;
  z: number;
  vx: number;
  vz: number;
  color: string;
  striped: boolean;
  cue: boolean;
  /** Set on the six that spell the name — the marker for "this one stays". */
  letter?: string;
  /** What's printed on the ball. */
  face: string;
  /** Accumulated roll, radians. Drives the printed face and the stripe. */
  roll: number;
  /** Roll axis — the direction the ball was last travelling. */
  rx: number;
  rz: number;
  /** Resting slot, for the six that stay. */
  tx: number;
  tz: number;
  /** Speed last frame, so the renderer can smear the ball along its path. */
  blur: number;
  /** Off the edge of the shot. */
  gone: boolean;
}

/**
 * The six that stay. Colours follow the low solids, in the muted, slightly
 * aged register of the room rather than anything fluorescent.
 */
export const NAME = [
  { ch: "T", color: "#e0a51f" },
  { ch: "H", color: "#1f4f9e" },
  { ch: "E", color: "#b62a22" },
  { ch: "B", color: "#5b2d7e" },
  { ch: "O", color: "#d9691a" },
  { ch: "W", color: "#15683f" },
] as const;

/** The nine that don't: the 7, the 8, and the stripes. */
const REST = [
  { color: "#7d2029", striped: false, face: "7" },
  { color: "#141414", striped: false, face: "8" },
  { color: "#e0a51f", striped: true, face: "9" },
  { color: "#1f4f9e", striped: true, face: "10" },
  { color: "#b62a22", striped: true, face: "11" },
  { color: "#5b2d7e", striped: true, face: "12" },
  { color: "#d9691a", striped: true, face: "13" },
  { color: "#15683f", striped: true, face: "14" },
  { color: "#7d2029", striped: true, face: "15" },
] as const;

/** Rack slots for the lettered balls — spread across all five rows. */
const NAME_SLOTS = [0, 2, 6, 9, 11, 14];
/** The 8 is racked dead centre, as it always is. */
const EIGHT_SLOT = 4;

/* ── the stroke ───────────────────────────────────────────────────────── */

export const CLOTH_DECEL = 96;    // units/s², cloth drag on a rolling ball
export const BREAK_SPEED = 560;   // a hard, flat break
const CUSHION = 0.7;              // rebound off the far rubber
const BALL_REST = 0.955;          // ball on ball is very nearly elastic

/**
 * Clock marks, seconds from the first frame. The shot holds on the rack,
 * the cue is released, and it reaches the apex a sixth of a second later —
 * the geometry is fixed, so the flash can be timed rather than detected.
 */
export const T_STRIKE = 0.72;
export const T_CONTACT = T_STRIKE + 0.167;
export const T_CLEAR = T_CONTACT + 0.95;
export const T_ASSEMBLE = T_CONTACT + 1.4;
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
    const spec =
      nameIdx >= 0
        ? { color: NAME[nameIdx].color, striped: false, face: NAME[nameIdx].ch }
        : i === EIGHT_SLOT
          ? REST[1]
          : fill[fillIdx++];

    balls.push({
      x: pos[i].x,
      z: pos[i].z,
      vx: 0,
      vz: 0,
      color: spec.color,
      striped: spec.striped,
      cue: false,
      letter: nameIdx >= 0 ? NAME[nameIdx].ch : undefined,
      face: spec.face,
      roll: (i * 1.7) % (Math.PI * 2),
      rx: 0,
      rz: 1,
      tx: nameIdx >= 0 ? slots[nameIdx].x : 0,
      tz: nameIdx >= 0 ? slots[nameIdx].z : 0,
      blur: 0,
      gone: false,
    });
  }

  balls.push({
    x: CUE_START.x,
    z: CUE_START.z,
    vx: 0,
    vz: 0,
    color: "#f4ecd8",
    striped: false,
    cue: true,
    face: "",
    roll: 0,
    rx: 0,
    rz: 1,
    tx: 0,
    tz: 0,
    blur: 0,
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
    if (!b.letter) {
      b.gone = true;
      continue;
    }
    b.x = b.tx;
    b.z = b.tz;
    b.vx = 0;
    b.vz = 0;
    b.roll = 0;
    b.rx = 0;
    b.rz = 1;
    b.blur = 0;
  }
}

/* ── simulation ───────────────────────────────────────────────────────── */

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
 * One tick. `t` is the clock, and the phase falls out of it rather than
 * being tracked separately, so a resize or a replay can't desynchronise.
 * Returns true while anything is still moving.
 */
export function step(balls: Ball[], dt: number, t: number): boolean {
  let moving = false;
  const assembling = t >= T_ASSEMBLE;

  for (const b of balls) {
    if (b.gone) continue;

    if (b.letter && assembling) {
      // critically damped: it arrives, and it doesn't wobble when it does
      const k = Math.min(1, (t - T_ASSEMBLE) / 0.45);
      const pull = 24 + 32 * k;
      b.vx += (b.tx - b.x) * pull * dt;
      b.vz += (b.tz - b.z) * pull * dt;
      const damp = Math.pow(0.9 - 0.13 * k, dt * 60);
      b.vx *= damp;
      b.vz *= damp;
    } else if (!b.letter && t >= T_CLEAR) {
      // the nine and the cue keep rolling until they're out of the shot,
      // the way a break actually scatters them past the edges of frame
      const lean = Math.min(1, (t - T_CLEAR) * 2.2);
      const speed = Math.max(Math.hypot(b.vx, b.vz), 150);
      const away = b.x >= 0 ? 1 : -1;
      const ux = b.vx || away;
      const uz = b.vz;
      const us = Math.hypot(ux, uz) || 1;
      // steer toward the nearest side of frame, drifting forward past the lens
      const gx = away * 0.93;
      const gz = -0.37;
      const nx = ux / us + (gx - ux / us) * lean;
      const nz = uz / us + (gz - uz / us) * lean;
      const ns = Math.hypot(nx, nz) || 1;
      b.vx = (nx / ns) * speed;
      b.vz = (nz / ns) * speed;
    }

    // cloth: a rolling ball sheds speed at a near-constant rate. The six on
    // their way to a slot are carried by the spring instead — constant drag
    // would overpower it within a ball's width and park them short.
    const guided = !!b.letter && assembling;
    const sp = Math.hypot(b.vx, b.vz);
    b.blur = sp;
    if (sp > 0) {
      const next = guided ? sp : Math.max(0, sp - CLOTH_DECEL * dt);
      if (next <= (guided ? 0.12 : 0.6)) {
        b.vx = 0;
        b.vz = 0;
        b.blur = 0;
      } else {
        b.vx = (b.vx / sp) * next;
        b.vz = (b.vz / sp) * next;
        b.rx = b.vx / next;
        b.rz = b.vz / next;
        b.roll += (next / R) * dt;
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
      // ease the printed face upright as the ball comes to rest
      b.roll *= Math.pow(0.85, dt * 60);
      if (Math.abs(b.tx - b.x) + Math.abs(b.tz - b.z) > 0.4) moving = true;
    }
  }

  const rest = assembling ? 0.35 : BALL_REST;
  const sorting = t > T_ASSEMBLE + 0.5;
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.gone) continue;
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      if (b.gone) continue;
      if (sorting && a.letter && b.letter) continue;
      collide(a, b, rest);
    }
  }

  return moving;
}

/** True once the six are home and everyone else has left the shot. */
export function done(balls: Ball[]): boolean {
  for (const b of balls) {
    if (!b.letter) {
      if (!b.gone) return false;
    } else if (Math.abs(b.tx - b.x) + Math.abs(b.tz - b.z) > 0.5 || Math.abs(b.roll) > 0.05) {
      return false;
    }
  }
  return true;
}
