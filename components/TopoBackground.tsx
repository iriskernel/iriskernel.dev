"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// The contour-line background of the landing and sign-in pages. A fixed, full-screen layer behind the page:
// the page scrolls over it, it never moves with the content, takes no clicks and is hidden from screen readers.
//   live  - drawn by the graphics card (a WebGL shader computes every pixel), about 20 frames a second;
//           the processor only updates the time and issues one draw call per frame
//   drift - two pre-drawn images (public/topo/{dark,paper}-{lines,accent}.webp) slide very slowly; the browser
//           moves them as layers, nothing is redrawn (phones, touch screens, small screens)
//   still - the same images without motion (reduced motion or data saver)
// mode="auto" picks one. ?perf=1 shows mode, frame rate, render scale, work per frame and WebGL version;
// for testing, ?perf=1&topomode=live|drift|still forces a mode, &topofps=N sets the live frame rate, &topospeed=3 runs faster, &topot0=<seconds>
// starts the field at a later time (to check precision after hours), &topofail=1 pretends WebGL is missing.

type Mode = "auto" | "live" | "drift" | "still";
type Resolved = "live" | "drift" | "still";

const SPEED = 0.5; // field time per second ("Slow")
const FPS = 60; // Smooth 60fps locked to display VSync for fluid motion

const noSubscribe = () => () => {};
function subscribe(onChange: () => void) {
  const queries = ["(prefers-reduced-motion: reduce)", "(pointer: fine) and (hover: hover)", "(min-width: 768px)"].map((q) => window.matchMedia(q));
  queries.forEach((m) => m.addEventListener("change", onChange));
  return () => queries.forEach((m) => m.removeEventListener("change", onChange));
}
function autoMode(): Resolved {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  // The PRIMARY pointer decides (an all-in-one PC with a touch screen still counts as a mouse computer)
  if (window.matchMedia("(pointer: fine) and (hover: hover)").matches && window.matchMedia("(min-width: 768px)").matches) return "live";
  return "drift";
}
const param = (name: string) => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(name));

export default function TopoBackground({ mode = "auto" }: { mode?: Mode; variant?: "hero" | "login" }) {
  const auto = useSyncExternalStore(subscribe, autoMode, () => null);
  const perf = useSyncExternalStore(noSubscribe, () => param("perf") === "1", () => false);
  const forced = useSyncExternalStore(noSubscribe, () => (perf ? param("topomode") : null), () => null);
  // live -> drift if WebGL is missing or lost
  const [noGl, setNoGl] = useState(false);
  const chosen: Resolved | null = forced === "live" || forced === "drift" || forced === "still" ? forced : mode === "auto" ? auto : mode;
  const resolved = chosen === "live" && noGl ? "drift" : chosen;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 overflow-hidden"
      style={{ height: "100lvh", contain: "strict" }}
      data-topo-mode={resolved ?? "pending"}
    >
      {resolved === "live" && <ShaderContours perf={perf} onFail={() => setNoGl(true)} />}
      {(resolved === "drift" || resolved === "still") && <ImageContours drift={resolved === "drift"} perf={perf} />}
      {perf && resolved !== "live" && <PerfBox text={`topo: ${resolved ?? "pending"}${noGl ? " (no WebGL)" : ""}`} />}
    </div>
  );
}

function PerfBox({ text }: { text: string }) {
  return <div className="fixed bottom-2 left-2 z-50 rounded border border-ln bg-bg px-2 py-1 font-mono text-[11px] text-tx">{text}</div>;
}

// Drift: how each picture moves. It eases to `to` over `sec` seconds and back, forever.
const DRIFT = [
  { sec: 120, x: -30, y: -16, rot: 0.9, scale: 0.03 },
  { sec: 88, x: 24, y: 18, rot: -1, scale: 0.04 },
];
// Moves are so slow (under 0.1 px per step) that 4 steps a second looks the same as 60, and every step
// makes the browser recomposite the whole screen, so fewer steps means much less work.
const DRIFT_STEP_MS = 250;

// Drift and still: two plain pictures with the theme's colors and the vignette baked in (the CSS classes pick
// the dark or paper pair, so only one pair is downloaded). Drift only slides them; nothing is redrawn.
function ImageContours({ drift, perf }: { drift: boolean; perf: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (!drift) return;
    const speed = perf ? Number(param("topospeed")) || 1 : 1;
    let elapsed = perf ? Number(param("topot0")) || 0 : 0;
    let last = performance.now();
    let timer = 0;
    const step = () => {
      const now = performance.now();
      elapsed += (Math.min(now - last, 1000) / 1000) * speed;
      last = now;
      DRIFT.forEach((d, i) => {
        const el = refs.current[i];
        if (!el) return;
        const k = (1 - Math.cos((elapsed / d.sec) * Math.PI)) / 2; // 0 -> 1 -> 0, eased
        el.style.transform = `translate3d(${(d.x * k).toFixed(2)}px, ${(d.y * k).toFixed(2)}px, 0) rotate(${(d.rot * k).toFixed(3)}deg) scale(${(1 + d.scale * k).toFixed(4)})`;
      });
    };
    const start = () => {
      if (timer || document.visibilityState !== "visible") return;
      last = performance.now();
      step();
      timer = window.setInterval(step, DRIFT_STEP_MS);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [drift, perf]);
  return (
    <>
      {["topo-pic-lines", "topo-pic-accent"].map((cls, i) => (
        <div
          key={cls}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`topo-pic ${cls} absolute -inset-[48px] ${drift ? "topo-drift" : ""}`}
        />
      ))}
    </>
  );
}

// --- Live: the WebGL shader ---------------------------------------------------------------------

const FRAG_BODY = `
uniform vec2 uRes;      // canvas size in CSS pixels
uniform float uScale;   // device pixels per CSS pixel
uniform float uTime;    // field time
uniform vec2 uPeakA;    // precomputed peak A coordinates
uniform vec2 uPeakB;    // precomputed peak B coordinates
uniform vec4 uMinor;    // rgb + alpha of each line class (from the theme)
uniform vec4 uMajor;
uniform vec4 uAccent;
const float FW0 = 0.0012;
const float FW1 = 0.010;
// Overall line strength (1.0 = the theme's alphas exactly)
const float GAIN = 0.85;

// The terrain: same smooth continuous field, with peaks precomputed on CPU
float field(vec2 p, float t) {
  float wx = p.x + 14.0 * sin(.031 * p.y + .6 + .18 * t);
  float wy = p.y + 14.0 * sin(.027 * p.x + 1.1 - .15 * t);
  float v = .9 * sin(.021 * wx + .8 * sin(.013 * wy + 1.0 + .35 * t) + .5 + .12 * t)
          + .7 * sin(.017 * wy - .012 * wx + 1.7 - .1 * t)
          + .45 * sin(.033 * wx + .027 * wy + .3 + .2 * t);
  vec2 da = p - uPeakA;
  v += 1.5 * exp(-dot(da, da) * 0.000078125);
  vec2 db = p - uPeakB;
  v += 1.2 * exp(-dot(db, db) * 0.000102040816);
  return v;
}

// Fixed vignette (stronger toward the edges): 15% in the middle, 45% halfway out, full at the edges.
// Done here rather than with a CSS mask, which would make the browser redo the mask every frame.
float vignette(vec2 p) {
  float d = length(vec2((p.x - 0.5 * uRes.x) / (0.62 * uRes.x), (p.y - 0.46 * uRes.y) / (0.58 * uRes.y)));
  return d < 0.55 ? mix(0.15, 0.45, d / 0.55) : mix(0.45, 1.0, clamp((d - 0.55) / 0.45, 0.0, 1.0));
}

vec4 shade() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uScale - gl_FragCoord.y) / uScale; // CSS pixels, y down
  float s = (field(p, uTime) + 2.0) / 0.26;
  float idx = floor(s + 0.5);
  if (idx < 0.0 || idx > 18.0) return vec4(0.0); // the approved engine draws levels -2.0 .. 2.68 only
  float fw = fwidth(s);
  float dpx = abs(s - idx) / max(fw, 1e-6);
  // Compare with a margin: the graphics card's rounding makes exact float equality unreliable
  bool accent = abs(mod(idx, 7.0) - 3.0) < 0.5;
  bool major = !accent && (mod(idx, 4.0) < 0.5 || mod(idx, 4.0) > 3.5);
  vec4 cls = accent ? uAccent : (major ? uMajor : uMinor);
  float width = (accent || major ? 1.1 : 0.8) * uScale;
  float line = 1.0 - smoothstep(width * 0.5, width * 0.5 + 1.0, dpx);
  float notFlat = smoothstep(FW0, FW1, fw);              // lines ease out where the terrain is almost flat
  float dense = 1.0 - smoothstep(0.25, 0.45, fw);     // ...and where they would be under 3 px apart
  float alpha = min(1.0, line * notFlat * dense * cls.a * GAIN * vignette(p));
  return vec4(cls.rgb * alpha, alpha);                // premultiplied
}
`;
const SHADERS = {
  2: {
    vert: `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,
    frag: `#version 300 es
precision highp float;
out vec4 outColor;
${FRAG_BODY}
void main() { outColor = shade(); }`,
  },
  1: {
    vert: `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,
    frag: `#extension GL_OES_standard_derivatives : enable
precision highp float;
${FRAG_BODY}
void main() { gl_FragColor = shade(); }`,
  },
};

// "rgba(255, 255, 255, 0.14)", "#rrggbb" or "#rrggbbaa" (Firefox reports custom properties that way)
// -> [r, g, b, a] in 0..1
function parseColor(css: string): [number, number, number, number] {
  const m = css.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\s*\)/);
  if (m) return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255, m[4] === undefined ? 1 : Number(m[4])];
  const h = css.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (h) {
    const n = (i: number) => parseInt(h[1].slice(i, i + 2), 16) / 255;
    return [n(0), n(2), n(4), h[2] ? parseInt(h[2], 16) / 255 : 1];
  }
  return [0.5, 0.5, 0.5, 0.2];
}

function ShaderContours({ perf, onFail }: { perf: boolean; onFail: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState("topo: live");
  const fail = useRef(onFail);
  useEffect(() => {
    fail.current = onFail;
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false };
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = param("topofail") === "1" ? null : (canvas.getContext("webgl2", opts) as WebGL2RenderingContext | null);
    let version: 1 | 2 = 2;
    if (!gl && param("topofail") !== "1") {
      const gl1 = canvas.getContext("webgl", opts) as WebGLRenderingContext | null;
      if (gl1 && gl1.getExtension("OES_standard_derivatives")) {
        gl = gl1;
        version = 1;
      }
    }
    if (!gl) {
      fail.current(); // no usable WebGL: the drift picture instead
      return;
    }
    const g = gl;
    const compile = (type: number, src: string) => {
      const sh = g.createShader(type)!;
      g.shaderSource(sh, src);
      g.compileShader(sh);
      if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(sh) ?? "shader failed");
      return sh;
    };
    let prog: WebGLProgram;
    try {
      prog = g.createProgram()!;
      g.attachShader(prog, compile(g.VERTEX_SHADER, SHADERS[version].vert));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, SHADERS[version].frag));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error("link failed");
    } catch (e) {
      if (perf) console.warn("topo shader:", e instanceof Error ? e.message : e);
      fail.current();
      return;
    }
    g.useProgram(prog);
    // One triangle that covers the whole screen; no geometry, no textures
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const aPos = g.getAttribLocation(prog, "aPos");
    g.enableVertexAttribArray(aPos);
    g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);
    const u = (n: string) => g.getUniformLocation(prog, n);
    const uRes = u("uRes"), uScale = u("uScale"), uTime = u("uTime"), uMinor = u("uMinor"), uMajor = u("uMajor"), uAccent = u("uAccent"), uPeakA = u("uPeakA"), uPeakB = u("uPeakB");

    // Theme colors, read from the CSS variables now and whenever the theme changes
    const style = getComputedStyle(canvas);
    const setColors = () => {
      g.uniform4fv(uMinor, parseColor(style.getPropertyValue("--topo-minor")));
      g.uniform4fv(uMajor, parseColor(style.getPropertyValue("--topo-major")));
      g.uniform4fv(uAccent, parseColor(style.getPropertyValue("--topo-accent")));
    };
    setColors();

    const speed = SPEED * (perf ? Number(param("topospeed")) || 1 : 1);
    const FRAME_MS = 1000 / (perf ? Number(param("topofps")) || FPS : FPS);
    let fieldTime = perf ? Number(param("topot0")) || 0 : 0;
    let cw = 0, ch = 0;
    const base = Math.min(window.devicePixelRatio || 1, 1.0); // 1.0x scale keeps lines razor sharp while saving millions of calculations on HiDPI displays
    let raf = 0, lastTick = 0, lastDraw = 0;
    let workSum = 0, workN = 0, frames = 0, fpsStart = performance.now(), maxWork = 0;
    const counters = { frames: 0, running: false, mode: "live", webgl: version, scale: base, avgMs: 0, maxMs: 0 };
    if (perf) (window as unknown as { __topo: typeof counters }).__topo = counters;

    const draw = () => {
      const aX = 0.8 * cw + 30.0 * Math.sin(0.08 * fieldTime);
      const aY = 0.27 * ch + 20.0 * Math.cos(0.07 * fieldTime);
      const bX = 0.17 * cw + 25.0 * Math.cos(0.06 * fieldTime);
      const bY = 0.64 * ch + 18.0 * Math.sin(0.09 * fieldTime);
      g.uniform2f(uPeakA, aX, aY);
      g.uniform2f(uPeakB, bX, bY);
      g.uniform1f(uTime, fieldTime);
      g.drawArrays(g.TRIANGLES, 0, 3);
    };
    const size = () => {
      cw = window.innerWidth;
      ch = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(cw * base));
      canvas.height = Math.max(1, Math.round(ch * base));
      g.viewport(0, 0, canvas.width, canvas.height);
      g.uniform2f(uRes, cw, ch);
      g.uniform1f(uScale, canvas.width / cw);
    };
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      setColors();
      draw();
    };
    scheme.addEventListener("change", onScheme);
    const themeObserver = new MutationObserver(onScheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (lastDraw && now - lastDraw < FRAME_MS - 2) return;
      lastDraw = now;
      fieldTime += (Math.min(now - (lastTick || now), 100) / 1000) * speed; // continuous, never jumps
      lastTick = now;
      const t0 = performance.now();
      draw();
      const work = performance.now() - t0;
      workSum += work;
      workN++;
      frames++;
      counters.frames++;
      if (work > maxWork) maxWork = work;
      if (workN === 60) {
        counters.avgMs = Math.round((workSum / workN) * 100) / 100;
        counters.maxMs = Math.round(maxWork * 100) / 100;
        if (perf) {
          const fps = (frames * 1000) / (performance.now() - fpsStart);
          setStats(`topo: live · WebGL${version} · ${fps.toFixed(0)} fps · scale ${counters.scale} · ${counters.avgMs} ms/frame`);
        }
        workSum = 0;
        workN = 0;
        frames = 0;
        maxWork = 0;
        fpsStart = performance.now();
      }
    };
    const start = () => {
      if (raf || document.visibilityState !== "visible") return;
      lastTick = 0;
      lastDraw = 0;
      counters.running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      counters.running = false;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    const onResize = () => {
      size();
      draw();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      fail.current(); // the graphics card dropped us: switch to the drift picture
    };
    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    size();
    draw();
    start();
    return () => {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      scheme.removeEventListener("change", onScheme);
      themeObserver.disconnect();
      g.deleteBuffer(buf);
      g.deleteProgram(prog);
    };
  }, [perf]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {perf && <PerfBox text={stats} />}
    </>
  );
}
