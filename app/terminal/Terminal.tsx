"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import {
  startRainbow,
  stopRainbow,
  toggleRainbow,
  setRainbowSpeed,
} from "@/lib/rainbow";

type Block = { id: number; command?: string; output: React.ReactNode };

type DestructType = "rm" | "forkbomb" | "dd" | "shutdown";

const shortcutCommands = [
  "help",
  "neofetch",
  "projects",
  "garage",
  "dmesg",
  "about",
  "rainbow",
  "rm -rf /",
  "clear",
] as const;

const allCommands = [
  "help",
  "neofetch",
  "fastfetch",
  "projects",
  "garage",
  "dmesg",
  "whoami",
  "uname",
  "groupy",
  "radio",
  "about",
  "contact",
  "clear",
  "ls",
  "sudo",
  "cat",
  "rm",
  "shutdown",
  "poweroff",
  "reboot",
  "forkbomb",
  "rainbow",
] as const;

const link = (href: string, text: string) => (
  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-ac2 hover:underline">
    {text}
  </a>
);

function isSelfDestructCommand(raw: string): { isDestruct: boolean; type: DestructType } | null {
  const norm = raw.trim().toLowerCase().replace(/\s+/g, " ");

  // 1. Fork bomb patterns
  if (
    norm.includes(":(){:|:&};:") ||
    norm.includes(":(){ :|:& };:") ||
    norm.includes(":() { :|:& }; :") ||
    norm === "forkbomb" ||
    norm === "fork bomb"
  ) {
    return { isDestruct: true, type: "forkbomb" };
  }

  // 2. rm -rf patterns
  if (
    norm.includes("rm -rf") ||
    norm.includes("rm -fr") ||
    norm.includes("rm -r -f") ||
    norm.includes("rm -f -r") ||
    norm.includes("no-preserve-root")
  ) {
    return { isDestruct: true, type: "rm" };
  }

  // 3. Disk zeroing & filesystem wipe
  if (
    norm.startsWith("dd if=") ||
    norm.includes("of=/dev/sda") ||
    norm.includes("of=/dev/nvme") ||
    norm.startsWith("mkfs")
  ) {
    return { isDestruct: true, type: "dd" };
  }

  // 4. Shutdown / halt / killall
  if (
    norm.startsWith("shutdown") ||
    norm.startsWith("poweroff") ||
    norm.startsWith("halt") ||
    norm === "init 0" ||
    norm.includes("kill -9 -1") ||
    norm.includes("killall -9") ||
    norm.includes("sysrq-trigger")
  ) {
    return { isDestruct: true, type: "shutdown" };
  }

  // 5. Explicit aliases
  if (/^(self-destruct|destruct|destroy|explode|boom|wipe|crash)$/.test(norm)) {
    return { isDestruct: true, type: "rm" };
  }

  return null;
}

function renderDestructionLog(type: DestructType): React.ReactNode {
  switch (type) {
    case "forkbomb":
      return (
        <div className="flex flex-col gap-1 font-mono text-xs text-danger">
          <p className="font-bold">-bash: fork: retry: Resource temporarily unavailable</p>
          <p>-bash: fork: retry: Resource temporarily unavailable</p>
          <p>[ALERT] Out of memory: Kill process 1 (init) score 1000</p>
          <p>[ALERT] Thread pool exhausted: 32768 processes active</p>
          <p className="mt-1 w-fit bg-danger px-1 font-bold text-white">[STACK OVERFLOW] CPU core thermal runaway imminent!</p>
          <p className="animate-pulse text-[11px] text-danger">Fatal error: thread exhaustion. Web environment deconstructing...</p>
        </div>
      );

    case "dd":
      return (
        <div className="flex flex-col gap-1 font-mono text-xs text-danger">
          <p className="font-bold">dd: overwriting /dev/sda with zero-stream...</p>
          <p>512+0 records in</p>
          <p>512+0 records out</p>
          <p>[CORRUPT] Master Boot Record (MBR) and partition table wiped!</p>
          <p>[CORRUPT] Filesystem superblocks destroyed!</p>
          <p className="mt-1 w-fit bg-danger px-1 font-bold text-white">[IO PANIC] Unrecoverable disk error on primary drive</p>
          <p className="animate-pulse text-[11px] text-danger">Fatal error: storage zeroed out. Web environment collapsing...</p>
        </div>
      );

    case "shutdown":
      return (
        <div className="flex flex-col gap-1 font-mono text-xs text-mu">
          <p className="font-bold text-tx">Broadcast message from root@dev: system is shutting down NOW!</p>
          <p>[  OK  ] Stopped target Graphical Interface.</p>
          <p>[  OK  ] Unmounting /home, /boot, /root...</p>
          <p>[  OK  ] Deactivating virtual memory paging...</p>
          <p>[  OK  ] Powering down system bus devices...</p>
          <p className="font-bold text-danger">[HALT] System halted. Power down imminent.</p>
        </div>
      );

    case "rm":
    default:
      return (
        <div className="flex flex-col gap-1 font-mono text-xs text-danger">
          <p className="font-bold">[CRITICAL] Bypassing safety check: unlinking root filesystem...</p>
          <p>rm: removing &apos;/boot/vmlinuz-6.12.0-custom-ik&apos;</p>
          <p>rm: removing &apos;/bin/bash&apos;</p>
          <p>rm: removing &apos;/etc/shadow&apos;</p>
          <p>rm: removing &apos;/lib64/libc.so.6&apos;</p>
          <p>rm: removing &apos;/sys/class/graphics&apos;</p>
          <p className="mt-1 w-fit bg-danger px-1 font-bold text-white">[KERNEL PANIC] VFS: Unable to mount root fs on unknown-block(0,0)</p>
          <p className="animate-pulse text-[11px] text-danger">Fatal error: structural failure detected. Website integrity collapsing...</p>
        </div>
      );
  }
}

function run(input: string): React.ReactNode {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase() ?? "";
  const arg = parts.slice(1).join(" ").toLowerCase();

  switch (cmd) {
    case "help":
      return (
        <dl className="grid grid-cols-[14ch_1fr] gap-x-2 gap-y-1">
          <dt className="text-ac">neofetch</dt>
          <dd className="text-mu">system telemetry &amp; ASCII spec sheet</dd>
          <dt className="text-ac">projects</dt>
          <dd className="text-mu">live projects and case studies</dd>
          <dt className="text-ac">garage</dt>
          <dd className="text-mu">hardware, mechanics &amp; systems projects</dd>
          <dt className="text-ac">dmesg</dt>
          <dd className="text-mu">kernel boot diagnostics log</dd>
          <dt className="text-ac">groupy</dt>
          <dd className="text-mu">music streaming ecosystem overview</dd>
          <dt className="text-ac">whoami</dt>
          <dd className="text-mu">active user identification</dd>
          <dt className="text-ac">uname</dt>
          <dd className="text-mu">kernel release and architecture (-a)</dd>
          <dt className="text-ac">about</dt>
          <dd className="text-mu">background and builder ethos</dd>
          <dt className="text-ac">contact</dt>
          <dd className="text-mu">links and where to find me</dd>
          <dt className="text-ac">ls</dt>
          <dd className="text-mu">list virtual directory files</dd>
          <dt className="text-ac">rainbow</dt>
          <dd className="text-mu">cycle whole 360° color spectrum across topo &amp; UI (fast/slow/off)</dd>
          <dt className="text-danger font-medium">rm -rf /</dt>
          <dd className="text-danger/80">⚠️ self-destruct (collapse entire website)</dd>
          <dt className="text-ac">clear</dt>
          <dd className="text-mu">clear the terminal output</dd>
        </dl>
      );

    case "neofetch":
    case "fastfetch":
      return (
        <div className="my-1 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs sm:text-sm">
          <pre className="select-none text-ac leading-tight">
{`   ___   __
  / _ | / /__
 / __ |/  '_/
/_/ |_/_/\\_\\ `}
          </pre>
          <div className="flex flex-col gap-0.5 leading-5">
            <p className="font-semibold text-tx">
              <span className="text-ac">{site.handle}</span>@<span className="text-ac2">dev</span>
            </p>
            <p className="text-mu">-----------------------</p>
            <p><span className="text-mu">OS:</span> Fedora Linux x86_64</p>
            <p><span className="text-mu">Host:</span> Custom Kernel Station</p>
            <p><span className="text-mu">Kernel:</span> 6.12.0-custom-ik #1 PREEMPT_DYNAMIC</p>
            <p><span className="text-mu">Uptime:</span> 247 days, 13 hours</p>
            <p><span className="text-mu">Shell:</span> zsh 5.9</p>
            <p><span className="text-mu">Terminal:</span> /dev/pts/0 (web-pty)</p>
            <p><span className="text-mu">Theme:</span> Topographic Elevation (Violet &amp; Cyan)</p>
            <p><span className="text-mu">Stack:</span> Next.js 16.4.5 · React 19 · TypeScript · Rust · Expo</p>
            <p><span className="text-mu">Garage:</span> groupy · groupy-pocket · iso2god-rs · PCB repair</p>
          </div>
        </div>
      );

    case "garage":
      return (
        <div className="flex flex-col gap-2 font-mono text-xs sm:text-sm">
          <p className="font-medium text-ac">═══ IRIS KERNEL GARAGE &amp; WORKSHOP ═══</p>
          <div>
            <p className="text-ac2 font-medium">[Software Engineering]</p>
            <ul className="mt-1 list-disc pl-5 space-y-1 text-tx">
              <li>
                <span className="font-semibold">groupy</span>: Social listening rooms with synced lyrics &amp; YouTube audio ({link("https://groupy.iriskernel.dev", "groupy.iriskernel.dev")})
              </li>
              <li>
                <span className="font-semibold">groupy-pocket</span>: 100% offline audio player with SQLite WAL &amp; GPU shaders ({link("https://github.com/iriskernel/groupy-pocket-releases", "GitHub Releases")})
              </li>
              <li>
                <span className="font-semibold">iso2god-rs</span>: High-performance Xbox 360 ISO to Games on Demand container converter in Rust
              </li>
              <li>
                <span className="font-semibold">groupy-tui</span>: Terminal-based keyboard-driven listening client
              </li>
            </ul>
          </div>
          <div className="mt-1">
            <p className="text-ac2 font-medium">[Hardware, Diagnostics &amp; Automotive]</p>
            <ul className="mt-1 list-disc pl-5 space-y-1 text-tx">
              <li>
                <span className="font-semibold">Board Repair &amp; SMD</span>: Component-level PCB diagnostics, micro-soldering, and boardview tracing (OpenBoardView)
              </li>
              <li>
                <span className="font-semibold">Linux Desktop</span>: Custom Wayland and KDE Plasma shell colorizers (plasma-panel-colorizer)
              </li>
              <li>
                <span className="font-semibold">Under the Hood</span>: Engine mechanics, telemetry analysis, and tuning
              </li>
            </ul>
          </div>
        </div>
      );

    case "dmesg":
      return (
        <pre className="max-h-72 overflow-x-auto text-[11px] sm:text-xs leading-5 text-mu">
{`[ 0.000000] Linux version 6.12.0-custom-ik (iris@iriskernel.dev) #1 PREEMPT_DYNAMIC
[ 0.000001] Command line: BOOT_IMAGE=/vmlinuz-ik root=UUID=cars-and-computers ro quiet
[ 0.000210] Memory: 64GB available, DirectMap4k: 128MB, DirectMap2M: 8192MB
[ 0.012490] ACPI: Initializing garage subsystem... OK
[ 0.045100] pci 0000:00:00.0: [10de:2484] Subsystem: NVIDIA GeForce RTX GPU
[ 0.104210] Detected interests: computers, cars, reverse engineering, hardware repair
[ 0.320490] rustc: Initializing iso2god-rs high-performance binary converter... READY
[ 0.512900] expo: Loading groupy-pocket SQLite WAL storage engine... MOUNTED
[ 0.840120] realtime: Establishing Supabase Realtime broadcast channels with HMAC-SHA256 signatures... CONNECTED
[ 1.024900] systemd[1]: Reached target Graphical Interface & Audio Playback. Welcome to iriskernel.dev!`}
        </pre>
      );

    case "whoami":
      return (
        <p>
          <span className="text-ac font-medium">{site.handle}</span> (uid=1000, gid=1000) — builder of groupy, systems enthusiast, and mechanic.
        </p>
      );

    case "uname":
      return (
        <p>
          Linux iriskernel.dev 6.12.0-custom-ik #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux
        </p>
      );

    case "groupy":
    case "radio":
      return (
        <div className="flex flex-col gap-1.5 font-mono text-xs sm:text-sm">
          <p className="font-medium text-ac">Groupy Music Ecosystem</p>
          <p>Web Platform: {link("https://groupy.iriskernel.dev", "https://groupy.iriskernel.dev")}</p>
          <p>Mobile App: {link("https://github.com/iriskernel/groupy-pocket-releases", "Groupy Pocket (.apk & .ipa)")}</p>
          <p className="text-mu text-xs mt-1">
            Status: Operational · Supabase Realtime HMAC Auth · YouTube Cooperative Queue · SQLite WAL Cache
          </p>
        </div>
      );

    case "about":
      return (
        <div className="flex flex-col gap-2">
          {site.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      );

    case "projects": {
      const b = site.currentlyBuilding;
      return (
        <ul className="space-y-1">
          <li>
            <span className="text-ac font-bold">*</span> {link(b.href, b.name)}: {b.pitch} ({b.pill.toLowerCase()})
          </li>
          {site.pinned
            .filter((p) => p.name !== b.name)
            .map((p) => (
              <li key={p.name}>
                <span className="text-ac font-bold">*</span> {p.href ? link(p.href, p.name) : p.name}: {p.description}
              </li>
            ))}
          <li className="pt-1 text-mu">More details and case studies on {link("/projects", "/projects")}</li>
        </ul>
      );
    }

    case "contact":
      return (
        <ul className="space-y-1">
          {site.email && (
            <li>
              email: {link(`mailto:${site.email.user}@${site.email.domain}`, `${site.email.user}@${site.email.domain}`)}
            </li>
          )}
          {site.links.map((l) => (
            <li key={l.href}>
              {l.label.toLowerCase()}: {link(l.href, l.href.replace(/^https?:\/\//, ""))}
            </li>
          ))}
        </ul>
      );

    case "ls":
      return (
        <p className="font-mono text-ac2">
          about.txt&nbsp;&nbsp;contact.txt&nbsp;&nbsp;dmesg.log&nbsp;&nbsp;garage/&nbsp;&nbsp;groupy/&nbsp;&nbsp;groupy-pocket/&nbsp;&nbsp;iso2god-rs/
        </p>
      );

    case "cat":
      if (!arg) return <p className="text-mu">cat: missing file operand. Try &quot;cat about.txt&quot;</p>;
      if (arg.includes("about")) return run("about");
      if (arg.includes("contact")) return run("contact");
      if (arg.includes("dmesg")) return run("dmesg");
      if (arg.includes("garage") || arg.includes("projects")) return run("garage");
      return <p className="text-danger">cat: {arg}: No such file or directory</p>;

    case "rainbow": {
      let active = false;
      let label = "toggled";
      if (arg === "off" || arg === "stop") {
        active = stopRainbow();
        label = "disengaged";
      } else if (arg === "on" || arg === "start") {
        active = startRainbow();
        label = "engaged";
      } else if (arg === "fast") {
        setRainbowSpeed("fast");
        active = startRainbow("fast");
        label = "turbo speed engaged (4s rotation)";
      } else if (arg === "slow") {
        setRainbowSpeed("slow");
        active = startRainbow("slow");
        label = "chill speed engaged (22s rotation)";
      } else if (arg === "normal") {
        setRainbowSpeed("normal");
        active = startRainbow("normal");
        label = "normal speed engaged (10s rotation)";
      } else {
        active = toggleRainbow();
        label = active ? "engaged" : "disengaged";
      }

      if (!active) {
        return (
          <div className="flex flex-col gap-1 font-mono text-xs sm:text-sm">
            <p className="font-bold text-tx">
              <span className="text-mu">✔</span> Rainbow chromatic spectrum {label}.
            </p>
            <p className="text-mu">
              WebGL topographic contour lines and UI accent tokens restored to standard theme colors.
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-1.5 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🌈</span>
            <span className="font-bold bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-cyan-400 to-violet-500 bg-clip-text text-transparent">
              CHROMATIC RAINBOW SPECTRUM ENGAGED
            </span>
          </div>
          <p className="text-tx">
            Sweeping the 360° color spectrum across the living WebGL topographic contours, borders, and UI accents.
          </p>
          <div className="mt-1 flex flex-col gap-0.5 text-xs text-mu">
            <p>• WebGL Shader: <span className="text-ac font-medium">real-time GPU uniform hue sweep</span></p>
            <p>• UI Tokens: <span className="text-ac2 font-medium">--ac, --ac2, --topo-* dynamically cycling</span></p>
            <p>• Mode: <span className="text-tx font-medium">{label}</span></p>
          </div>
          <p className="mt-1 text-[11px] text-mu">
            Options: <span className="text-ac font-medium">rainbow fast</span> (turbo) · <span className="text-ac font-medium">rainbow slow</span> (chill) · <span className="text-ac font-medium">rainbow off</span> (reset)
          </p>
        </div>
      );
    }

    case "sudo":
      return (
        <p>
          <span className="text-danger font-medium">{site.handle} is not in the sudoers file.</span> This incident will be reported.
        </p>
      );

    case "":
      return null;

    default:
      return (
        <p>
          <span className="text-danger">command not found: {input}</span>. Type <span className="text-ac font-medium">help</span> for available commands.
        </p>
      );
  }
}

const welcome: Block = {
  id: 0,
  output: (
    <p>
      Welcome to {site.handle}.dev terminal. Type <span className="text-ac font-medium">help</span>, or click a shortcut below.
    </p>
  ),
};

export function Terminal() {
  const [blocks, setBlocks] = useState<Block[]>([welcome]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [panicOverlay, setPanicOverlay] = useState<DestructType | null>(null);
  const [rebooting, setRebooting] = useState(false);
  const [rebootCountdown, setRebootCountdown] = useState(5);

  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [blocks]);

  // Handle countdown for panic recovery
  useEffect(() => {
    if (!panicOverlay || rebooting) return;
    if (rebootCountdown <= 0) {
      rebootSystem();
      return;
    }
    const timer = setTimeout(() => {
      setRebootCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [panicOverlay, rebootCountdown, rebooting]);

  // Clean up any global destruction classes when unmounting
  useEffect(() => {
    return () => {
      document.body.classList.remove("system-destructing", "system-falling");
    };
  }, []);

  function triggerDestruction(type: DestructType) {
    document.body.classList.add("system-destructing");

    setTimeout(() => {
      document.body.classList.add("system-falling");
    }, 600);

    setTimeout(() => {
      setRebootCountdown(5);
      setPanicOverlay(type);
    }, 2400);
  }

  function rebootSystem() {
    setRebooting(true);
    setTimeout(() => {
      document.body.classList.remove("system-destructing", "system-falling");
      setPanicOverlay(null);
      setRebooting(false);
      setBlocks((prev) => [
        ...prev,
        {
          id: nextId.current++,
          output: (
            <div className="my-1 rounded-md border border-emerald-500/40 bg-emerald-950/20 p-2.5 font-mono text-xs text-emerald-400">
              <p className="font-bold">✔ SYSTEM REBOOT COMPLETED</p>
              <p className="text-mu">BIOS POST check passed. Root filesystem restored from clean snapshot #1.</p>
            </div>
          ),
        },
      ]);
    }, 1800);
  }

  function submit(raw: string) {
    const trimmed = raw.trim();
    setValue("");
    setHistoryIndex(-1);
    if (!trimmed) return;

    setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));

    // Check for self-destruct command
    const destruct = isSelfDestructCommand(trimmed);
    if (destruct) {
      setBlocks((b) => [...b, { id: nextId.current++, command: trimmed, output: renderDestructionLog(destruct.type) }]);
      triggerDestruction(destruct.type);
      return;
    }

    if (trimmed.toLowerCase() === "clear") {
      setBlocks([]);
      return;
    }
    setBlocks((b) => [...b, { id: nextId.current++, command: trimmed, output: run(trimmed) }]);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(history[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex] || "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = value.trim().toLowerCase();
      if (!current) return;
      const match = allCommands.find((c) => c.startsWith(current));
      if (match) setValue(match);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-ln bg-bg shadow-sm">
        <div className="flex items-center justify-between border-b border-ln px-4 py-2 text-xs text-mu">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-danger/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </span>
            <span className="font-mono">{site.handle}@dev: ~</span>
          </div>
          <span className="hidden font-mono text-[10px] text-mu/70 sm:inline">zsh / xterm-256color</span>
        </div>
        <div className="h-[60dvh] min-h-72 overflow-y-auto p-4 text-sm leading-6" onClick={() => inputRef.current?.focus()}>
          <div aria-live="polite" className="flex flex-col gap-3 font-mono">
            {blocks.map((b) => (
              <div key={b.id}>
                {b.command !== undefined && (
                  <p>
                    <span aria-hidden="true" className="text-ac2">$ </span>
                    <span className="sr-only">You typed: </span>
                    {b.command}
                  </p>
                )}
                {b.output}
              </div>
            ))}
          </div>
          <form
            className="mt-3 flex items-center gap-2 font-mono"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <label htmlFor="terminal-input" className="text-ac2">
              <span aria-hidden="true">$</span>
              <span className="sr-only">Command</span>
            </label>
            <input
              ref={inputRef}
              id="terminal-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="send"
              className="min-w-0 flex-1 bg-transparent caret-ac outline-none"
            />
          </form>
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-ln px-4 py-3">
          <span className="sr-only">Shortcuts:</span>
          <span className="mr-1 font-mono text-xs text-mu">Quick run:</span>
          {shortcutCommands.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => submit(c)}
              className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                c === "rainbow"
                  ? "border-violet-500/40 bg-gradient-to-r from-red-500/10 via-emerald-500/10 to-blue-500/10 hover:border-ac text-tx font-medium hover:text-ac"
                  : c === "rm -rf /"
                  ? "border-danger/60 bg-danger/10 text-danger hover:border-danger hover:bg-danger/20 font-bold"
                  : "border-ln bg-sf hover:border-ac hover:text-ac2"
              }`}
            >
              {c === "rainbow" ? "🌈 rainbow" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Screen Kernel Panic Overlay when the site falls apart */}
      {panicOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl rounded-xl border-2 border-danger bg-black p-6 font-mono text-xs sm:text-sm text-danger shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-danger/40 pb-3">
              <span className="font-bold tracking-widest text-white">*** KERNEL PANIC: SYSTEM COLLAPSE ***</span>
              <span className="animate-ping size-2 rounded-full bg-danger" />
            </div>

            {rebooting ? (
              <div className="space-y-2 text-emerald-400">
                <p className="font-bold text-white">&gt;&gt; INITIATING EMERGENCY HARDWARE POST &amp; BIOS RESET...</p>
                <p>&gt;&gt; Restoring virtual filesystem from immutable snapshot... [100%]</p>
                <p>&gt;&gt; Mounting /dev/nvme0n1 (ext4 clean)... OK</p>
                <p>&gt;&gt; Spawning display manager &amp; desktop session... OK</p>
                <p className="animate-pulse text-white">&gt;&gt; Returning to userspace...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-white bg-danger/90 px-2 py-0.5 w-fit">
                  CRITICAL: ROOT DESTRUCTION SIGNAL DETECTED [{panicOverlay.toUpperCase()}]
                </p>
                <p className="text-mu">
                  PID: 1 (init) | CPU: 0 | Tainted: G D W O | Kernel: 6.12.0-custom-ik
                </p>

                <div className="rounded border border-danger/30 bg-black/60 p-3 text-[11px] leading-5 text-danger/90 font-mono">
                  <p>Call Trace:</p>
                  <p>&nbsp;&nbsp;[&lt;ffffffff81001234&gt;] do_user_self_destruct+0x8a/0x120</p>
                  <p>&nbsp;&nbsp;[&lt;ffffffff81005678&gt;] sys_rmdir_everything+0x44/0x90</p>
                  <p>&nbsp;&nbsp;[&lt;ffffffff81009abc&gt;] system_collapsed_successfully+0x10/0x20</p>
                  <p>&nbsp;&nbsp;[&lt;ffffffff8100dead&gt;] panic_website_structure_unrecoverable</p>
                </div>

                <p className="text-white">
                  The webpage has physically collapsed into the abyss. Automatic reboot in{" "}
                  <span className="font-bold text-danger text-base underline">{rebootCountdown}s</span>.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={rebootSystem}
                    className="w-full rounded-lg border border-emerald-500 bg-emerald-600/20 py-2.5 font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black cursor-pointer shadow-lg"
                  >
                    ⚡ EMERGENCY BIOS REBOOT / RESTORE NOW
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
