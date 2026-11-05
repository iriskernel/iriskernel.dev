// Rainbow Spectrum Controller for TopoBackground & UI Elements

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return [r + m, g + m, b + m];
}

export type RainbowSpeed = "normal" | "fast" | "slow";

export const SPEED_MAP: Record<RainbowSpeed, number> = {
  slow: 16, // ~22.5s per cycle
  normal: 36, // ~10s per cycle
  fast: 90, // ~4s per cycle
};

export interface RainbowState {
  active: boolean;
  hue: number;
  speed: number;
  speedLabel: RainbowSpeed;
  glAccent: Float32Array;
  glMajor: Float32Array;
  glMinor: Float32Array;
}

export const rainbowState: RainbowState = {
  active: false,
  hue: 0,
  speed: SPEED_MAP.normal,
  speedLabel: "normal",
  glAccent: new Float32Array([0.7, 0.4, 0.9, 0.78]),
  glMajor: new Float32Array([0.5, 0.5, 0.6, 0.28]),
  glMinor: new Float32Array([0.4, 0.4, 0.5, 0.12]),
};

type Listener = (active: boolean, state: RainbowState) => void;
const listeners = new Set<Listener>();

let rafId = 0;
let lastTick = 0;

function isDarkMode(): boolean {
  if (typeof document === "undefined") return true;
  const dt = document.documentElement.dataset.theme;
  if (dt === "dark") return true;
  if (dt === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function updateFrame(now: number) {
  if (!rainbowState.active) return;
  rafId = requestAnimationFrame(updateFrame);

  if (!lastTick) lastTick = now;
  const delta = Math.min(now - lastTick, 100) / 1000;
  lastTick = now;

  rainbowState.hue = (rainbowState.hue + rainbowState.speed * delta) % 360;
  const h = rainbowState.hue;
  const dark = isDarkMode();

  // Primary accent (text, links, borders, top contour)
  const lAc = dark ? 0.72 : h >= 40 && h <= 160 ? 0.34 : 0.42;
  const lAc2 = dark ? 0.75 : ((h + 45) % 360 >= 40 && (h + 45) % 360 <= 160 ? 0.34 : 0.44);

  // Compute RGB floats for WebGL
  const [ar, ag, ab] = hslToRgb(h, 0.95, 0.65);
  const [mr, mg, mb] = hslToRgb((h + 35) % 360, 0.7, 0.6);
  const [nr, ng, nb] = hslToRgb((h + 70) % 360, 0.5, 0.55);

  rainbowState.glAccent[0] = ar;
  rainbowState.glAccent[1] = ag;
  rainbowState.glAccent[2] = ab;
  rainbowState.glAccent[3] = dark ? 0.78 : 0.72;

  rainbowState.glMajor[0] = mr;
  rainbowState.glMajor[1] = mg;
  rainbowState.glMajor[2] = mb;
  rainbowState.glMajor[3] = dark ? 0.28 : 0.22;

  rainbowState.glMinor[0] = nr;
  rainbowState.glMinor[1] = ng;
  rainbowState.glMinor[2] = nb;
  rainbowState.glMinor[3] = dark ? 0.12 : 0.09;

  // Update root CSS properties for DOM elements
  const root = document.documentElement;
  root.style.setProperty("--ac", `hsl(${Math.round(h)}, 95%, ${Math.round(lAc * 100)}%)`);
  root.style.setProperty("--ac2", `hsl(${Math.round((h + 45) % 360)}, 95%, ${Math.round(lAc2 * 100)}%)`);
  root.style.setProperty("--topo-accent", `hsla(${Math.round(h)}, 95%, ${Math.round(lAc * 100)}%, ${dark ? 0.78 : 0.72})`);
  root.style.setProperty("--topo-major", `hsla(${Math.round((h + 35) % 360)}, 70%, 65%, ${dark ? 0.28 : 0.22})`);
  root.style.setProperty("--topo-minor", `hsla(${Math.round((h + 70) % 360)}, 50%, 60%, ${dark ? 0.12 : 0.09})`);
  root.style.setProperty("--rainbow-deg", `${Math.round(h)}deg`);
}

function notify() {
  listeners.forEach((fn) => fn(rainbowState.active, rainbowState));
}

export function startRainbow(speed: RainbowSpeed = "normal"): boolean {
  if (typeof window === "undefined") return false;

  rainbowState.active = true;
  rainbowState.speedLabel = speed;
  rainbowState.speed = SPEED_MAP[speed] || SPEED_MAP.normal;

  document.documentElement.dataset.rainbow = "true";
  if (rafId) cancelAnimationFrame(rafId);
  lastTick = 0;
  rafId = requestAnimationFrame(updateFrame);
  notify();
  return true;
}

export function stopRainbow(): boolean {
  if (typeof window === "undefined") return false;

  rainbowState.active = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  const root = document.documentElement;
  delete root.dataset.rainbow;
  root.style.removeProperty("--ac");
  root.style.removeProperty("--ac2");
  root.style.removeProperty("--topo-accent");
  root.style.removeProperty("--topo-major");
  root.style.removeProperty("--topo-minor");
  root.style.removeProperty("--rainbow-deg");

  notify();
  return false;
}

export function toggleRainbow(speed?: RainbowSpeed): boolean {
  if (rainbowState.active) {
    return stopRainbow();
  } else {
    return startRainbow(speed || rainbowState.speedLabel);
  }
}

export function setRainbowSpeed(speed: RainbowSpeed) {
  rainbowState.speedLabel = speed;
  rainbowState.speed = SPEED_MAP[speed] || SPEED_MAP.normal;
  if (rainbowState.active) {
    notify();
  }
}

export function subscribeRainbow(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
