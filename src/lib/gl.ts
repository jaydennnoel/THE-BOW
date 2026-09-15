/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE BOW — the balls, on the GPU.
 *
 *  Shading spheres per pixel in JavaScript hit a wall. To keep the frame
 *  budget the sprites had to be rendered well below the display's real
 *  resolution and scaled up, which is what made the balls look pixelated;
 *  the number circle was a hard threshold and the character a
 *  nearest-neighbour lookup, which is what made their edges crawl; and
 *  re-rendering a sprite whenever the rotation changed made the lighting
 *  pop from frame to frame.
 *
 *  Here each ball is one quad and the fragment shader intersects the
 *  sphere analytically. That renders at the display's true resolution
 *  whatever it is, antialiases the silhouette and the printed circle
 *  against the pixel footprint, samples the character bilinearly, and has
 *  the budget for a specular per light and a reflection of the room.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface BallDraw {
  /** Centre in device pixels. */
  x: number;
  y: number;
  /** Radius in device pixels. */
  r: number;
  /** Object → room, column-major. */
  m: Float32Array;
  colour: [number, number, number];
  striped: boolean;
  cue: boolean;
  /** Index into the glyph atlas, or -1 for the cue ball. */
  glyph: number;
  alpha: number;
}

export interface ShadowDraw {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

const VERT = `
attribute vec2 aCorner;
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform vec2 uViewport;
varying vec2 vPos;
void main() {
  vPos = aCorner;
  vec2 p = uCenter + aCorner * uRadius;
  vec2 clip = (p / uViewport) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const BALL_FRAG = `
precision highp float;

varying vec2 vPos;

uniform mat3 uRot;          // object -> room
uniform vec3 uColour;       // pigment
uniform float uStriped;
uniform float uCue;
uniform float uGlyph;       // atlas cell, -1 for none
uniform float uAlpha;
uniform float uPixRadius;   // device px, for the antialiasing footprint
uniform float uPitch;       // camera tilt
uniform vec3 uCloth;        // colour of the light coming off the cloth
uniform sampler2D uAtlas;
uniform float uAtlasCols;

const float CAP = 0.56;     // where the white poles start on a stripe
const float FACE = 0.855;   // and where the printed circle does

vec3 lightDir(vec3 d) { return normalize(d); }

void main() {
  float r2 = dot(vPos, vPos);
  float rad = sqrt(r2);

  // one pixel of feather, measured against this ball's size on screen
  float aa = 1.4 / max(uPixRadius, 1.0);
  float cover = 1.0 - smoothstep(1.0 - aa, 1.0, rad);
  if (cover <= 0.0) discard;

  // the sphere, in view space: x right, y up, z toward the lens
  float nz = sqrt(max(0.0, 1.0 - r2));
  vec3 n = vec3(vPos.x, -vPos.y, nz);

  // and in room space, where z runs away from the lens
  float cp = cos(uPitch);
  float sp = sin(uPitch);
  vec3 w = vec3(n.x, n.y * cp + n.z * sp, n.y * sp - n.z * cp);

  // into the ball's own frame
  vec3 o = w * uRot;

  // ── what is painted here ────────────────────────────────────────────
  float ay = abs(o.y);
  // the footprint of one pixel in "ay", so the bands can be antialiased
  float ayAA = max(aa * 1.6, 0.004);

  vec3 base = uColour;
  vec3 ivory = mix(vec3(0.957, 0.929, 0.855), vec3(0.969, 0.949, 0.890), uCue);
  // a stripe is a band about the ball's equator; a solid has none
  float capMix = uStriped * smoothstep(CAP - ayAA, CAP + ayAA, ay);
  base = mix(base, ivory, max(capMix, uCue));

  // the printed circle, and the character inside it
  float disc = smoothstep(FACE - ayAA, FACE + ayAA, ay);
  if (uGlyph >= 0.0 && disc > 0.0) {
    vec3 paper = vec3(0.980, 0.965, 0.918);
    float scale = 1.0 / sqrt(1.0 - FACE * FACE);
    // the far pole is seen from behind, so its character reads mirrored
    float u = o.x * scale * (o.y < 0.0 ? -1.0 : 1.0);
    float v = o.z * scale;
    vec2 cell = vec2(mod(uGlyph, uAtlasCols), floor(uGlyph / uAtlasCols));
    vec2 uv = (cell + clamp(vec2(u, -v) * 0.5 + 0.5, 0.0, 1.0)) / uAtlasCols;
    float ink = texture2D(uAtlas, uv).a;
    vec3 face = mix(paper, vec3(0.075, 0.07, 0.055), ink);
    base = mix(base, face, disc);
  }

  // ── the light in the room ───────────────────────────────────────────
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 key = lightDir(vec3(-0.30, 0.88, -0.36));
  vec3 fill = lightDir(vec3(0.60, 0.24, -0.62));
  vec3 tube1 = lightDir(vec3(-0.40, 0.90, -0.30));
  vec3 tube2 = lightDir(vec3(-0.13, 0.96, -0.24));
  vec3 tube3 = lightDir(vec3(0.14, 0.93, -0.20));

  float sky = 0.5 + 0.5 * w.y;
  float dif =
    max(0.0, dot(w, key)) * 0.72 +
    max(0.0, dot(w, fill)) * 0.26 +
    sky * 0.26;

  // the view vector has to be taken back into room space too
  vec3 Vw = vec3(V.x, V.y * cp + V.z * sp, V.y * sp - V.z * cp);

  float spec = 0.0;
  spec += pow(max(0.0, dot(w, normalize(tube1 + Vw))), 240.0) * 1.15;
  spec += pow(max(0.0, dot(w, normalize(tube2 + Vw))), 240.0) * 0.82;
  spec += pow(max(0.0, dot(w, normalize(tube3 + Vw))), 240.0) * 0.52;
  spec += pow(max(0.0, dot(w, normalize(key + Vw))), 26.0) * 0.1;

  // light thrown back up off the cloth, under the equator
  float bounce = pow(max(0.0, -w.y), 1.4) * 0.5;

  // the room, reflected: cloth below the horizon, dark ceiling above it
  vec3 refl = reflect(-Vw, w);
  float horizon = smoothstep(-0.12, 0.25, refl.y);
  vec3 env = mix(uCloth * 0.7, vec3(0.055, 0.05, 0.045), horizon);
  float fres = pow(1.0 - max(0.0, nz), 3.2);

  vec3 col = base * (0.2 + dif) + uCloth * bounce;
  col = mix(col, env, fres * 0.55);
  col += vec3(spec);

  gl_FragColor = vec4(col, 1.0) * (cover * uAlpha);
}`;


/**
 * The motion-blur stamps. These land at a few percent alpha under the ball
 * itself, so they get pigment and a rough sense of where the light is and
 * nothing else — no printed face, no reflection of the room. Running the
 * full shader on them was most of the cost of a frame during the break.
 */
const GHOST_FRAG = `
precision mediump float;
varying vec2 vPos;
uniform mat3 uRot;
uniform vec3 uColour;
uniform float uStriped;
uniform float uCue;
uniform float uAlpha;
uniform float uPixRadius;
uniform float uPitch;

const float CAP = 0.56;

void main() {
  float r2 = dot(vPos, vPos);
  float aa = 1.4 / max(uPixRadius, 1.0);
  float cover = 1.0 - smoothstep(1.0 - aa, 1.0, sqrt(r2));
  if (cover <= 0.0) discard;

  float nz = sqrt(max(0.0, 1.0 - r2));
  vec3 n = vec3(vPos.x, -vPos.y, nz);
  float cp = cos(uPitch);
  float sp = sin(uPitch);
  vec3 w = vec3(n.x, n.y * cp + n.z * sp, n.y * sp - n.z * cp);
  vec3 o = w * uRot;

  vec3 ivory = vec3(0.957, 0.929, 0.855);
  float capMix = uStriped * step(CAP, abs(o.y));
  vec3 base = mix(uColour, ivory, max(capMix, uCue));

  float dif = 0.2 + max(0.0, dot(w, normalize(vec3(-0.30, 0.88, -0.36)))) * 0.8;
  gl_FragColor = vec4(base * dif, 1.0) * (cover * uAlpha);
}`;

const SHADOW_FRAG = `
precision mediump float;
varying vec2 vPos;
uniform float uAlpha;
void main() {
  float d = length(vPos);
  // a tight core inside a wide penumbra, the way a diffuse tube casts
  float core = 1.0 - smoothstep(0.0, 0.46, d);
  float soft = 1.0 - smoothstep(0.1, 1.0, d);
  float a = (core * 0.45 + soft * 0.4) * uAlpha;
  gl_FragColor = vec4(0.016, 0.075, 0.043, 1.0) * a;
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[bow] shader failed to compile:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram | null {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("[bow] program failed to link:", gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

const ATLAS_COLS = 8;
const ATLAS_CELL = 128; // 8 x 128 = 1024, a power of two

/** The printed characters, all on one texture. */
function atlasCanvas(chars: string[]): HTMLCanvasElement {
  const size = ATLAS_COLS * ATLAS_CELL;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, size, size);
  g.fillStyle = "#000";
  g.textAlign = "center";
  g.textBaseline = "middle";
  chars.forEach((ch, i) => {
    const cx = (i % ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    const cy = Math.floor(i / ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    g.font = `800 ${ATLAS_CELL * (ch.length > 1 ? 0.5 : 0.62)}px "Big Shoulders Display","Arial Black",sans-serif`;
    g.fillText(ch, cx, cy + ATLAS_CELL * 0.01);
  });
  return c;
}

export interface Renderer {
  resize(w: number, h: number, dpr: number): void;
  setGlyphs(chars: string[]): void;
  setCloth(rgb: [number, number, number]): void;
  frame(shadows: ShadowDraw[], balls: BallDraw[], pitch: number): void;
  glyphIndex(ch: string): number;
  lost(): boolean;
}

/** Null when the browser can't give us a context; the caller falls back. */
export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = (canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true }) ??
    canvas.getContext("experimental-webgl", { alpha: true })) as WebGLRenderingContext | null;
  if (!gl) return null;

  const ballProg = link(gl, VERT, BALL_FRAG);
  const ghostProg = link(gl, VERT, GHOST_FRAG);
  const shadowProg = link(gl, VERT, SHADOW_FRAG);
  if (!ballProg || !ghostProg || !shadowProg) return null;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let chars: string[] = [];
  let cloth: [number, number, number] = [0.12, 0.54, 0.27];
  const viewport = { w: 1, h: 1 };

  const bu = {
    corner: gl.getAttribLocation(ballProg, "aCorner"),
    center: gl.getUniformLocation(ballProg, "uCenter"),
    radius: gl.getUniformLocation(ballProg, "uRadius"),
    viewport: gl.getUniformLocation(ballProg, "uViewport"),
    rot: gl.getUniformLocation(ballProg, "uRot"),
    colour: gl.getUniformLocation(ballProg, "uColour"),
    striped: gl.getUniformLocation(ballProg, "uStriped"),
    cue: gl.getUniformLocation(ballProg, "uCue"),
    glyph: gl.getUniformLocation(ballProg, "uGlyph"),
    alpha: gl.getUniformLocation(ballProg, "uAlpha"),
    rpx: gl.getUniformLocation(ballProg, "uPixRadius"),
    pitch: gl.getUniformLocation(ballProg, "uPitch"),
    cloth: gl.getUniformLocation(ballProg, "uCloth"),
    atlas: gl.getUniformLocation(ballProg, "uAtlas"),
    cols: gl.getUniformLocation(ballProg, "uAtlasCols"),
  };
  const gu = {
    corner: gl.getAttribLocation(ghostProg, "aCorner"),
    center: gl.getUniformLocation(ghostProg, "uCenter"),
    radius: gl.getUniformLocation(ghostProg, "uRadius"),
    viewport: gl.getUniformLocation(ghostProg, "uViewport"),
    rot: gl.getUniformLocation(ghostProg, "uRot"),
    colour: gl.getUniformLocation(ghostProg, "uColour"),
    striped: gl.getUniformLocation(ghostProg, "uStriped"),
    cue: gl.getUniformLocation(ghostProg, "uCue"),
    alpha: gl.getUniformLocation(ghostProg, "uAlpha"),
    rpx: gl.getUniformLocation(ghostProg, "uPixRadius"),
    pitch: gl.getUniformLocation(ghostProg, "uPitch"),
  };
  const su = {
    corner: gl.getAttribLocation(shadowProg, "aCorner"),
    center: gl.getUniformLocation(shadowProg, "uCenter"),
    radius: gl.getUniformLocation(shadowProg, "uRadius"),
    viewport: gl.getUniformLocation(shadowProg, "uViewport"),
    alpha: gl.getUniformLocation(shadowProg, "uAlpha"),
  };

  return {
    lost: () => gl.isContextLost(),

    resize(w, h, dpr) {
      const dw = Math.max(1, Math.round(w * dpr));
      const dh = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== dw || canvas.height !== dh) {
        canvas.width = dw;
        canvas.height = dh;
      }
      viewport.w = dw;
      viewport.h = dh;
      gl.viewport(0, 0, dw, dh);
    },

    setGlyphs(next) {
      chars = next;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas(next));
      gl.generateMipmap(gl.TEXTURE_2D);
    },

    setCloth(rgb) {
      cloth = rgb;
    },

    glyphIndex(ch) {
      return chars.indexOf(ch);
    },

    frame(shadows, balls, pitch) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      // everything is written premultiplied, so this is the right blend for
      // both the shadows and the motion-blurred stamps
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.bindBuffer(gl.ARRAY_BUFFER, quad);

      gl.useProgram(shadowProg);
      gl.enableVertexAttribArray(su.corner);
      gl.vertexAttribPointer(su.corner, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(su.viewport, viewport.w, viewport.h);
      for (const s of shadows) {
        gl.uniform2f(su.center, s.x, s.y);
        // the camera is low, so the shadow is a long flat smear
        gl.uniform2f(su.radius, s.r * 1.5, s.r * 0.45);
        gl.uniform1f(su.alpha, s.alpha);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      // the ghosts first, so the ball itself lands on top of its own smear
      let ghosts = false;
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].alpha < 1) {
          ghosts = true;
          break;
        }
      }
      if (ghosts) {
        gl.useProgram(ghostProg);
        gl.enableVertexAttribArray(gu.corner);
        gl.vertexAttribPointer(gu.corner, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(gu.viewport, viewport.w, viewport.h);
        gl.uniform1f(gu.pitch, pitch);
        for (const b of balls) {
          if (b.alpha >= 1) continue;
          gl.uniform2f(gu.center, b.x, b.y);
          gl.uniform2f(gu.radius, b.r, b.r);
          gl.uniform1f(gu.rpx, b.r);
          gl.uniformMatrix3fv(gu.rot, false, b.m);
          gl.uniform3f(gu.colour, b.colour[0], b.colour[1], b.colour[2]);
          gl.uniform1f(gu.striped, b.striped ? 1 : 0);
          gl.uniform1f(gu.cue, b.cue ? 1 : 0);
          gl.uniform1f(gu.alpha, b.alpha);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }

      gl.useProgram(ballProg);
      gl.enableVertexAttribArray(bu.corner);
      gl.vertexAttribPointer(bu.corner, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(bu.viewport, viewport.w, viewport.h);
      gl.uniform1f(bu.pitch, pitch);
      gl.uniform3f(bu.cloth, cloth[0], cloth[1], cloth[2]);
      gl.uniform1f(bu.cols, ATLAS_COLS);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(bu.atlas, 0);

      for (const b of balls) {
        if (b.alpha < 1) continue;
        gl.uniform2f(bu.center, b.x, b.y);
        gl.uniform2f(bu.radius, b.r, b.r);
        gl.uniform1f(bu.rpx, b.r);
        gl.uniformMatrix3fv(bu.rot, false, b.m);
        gl.uniform3f(bu.colour, b.colour[0], b.colour[1], b.colour[2]);
        gl.uniform1f(bu.striped, b.striped ? 1 : 0);
        gl.uniform1f(bu.cue, b.cue ? 1 : 0);
        gl.uniform1f(bu.glyph, b.glyph);
        gl.uniform1f(bu.alpha, b.alpha);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    },
  };
}
