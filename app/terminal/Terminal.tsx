"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

type Block = { id: number; command?: string; output: React.ReactNode };

const commands = ["help", "about", "projects", "contact", "clear"] as const;

const link = (href: string, text: string) => (
  <a href={href} className="text-ac2 underline">
    {text}
  </a>
);

function run(input: string): React.ReactNode {
  switch (input) {
    case "help":
      return (
        <dl className="grid grid-cols-[10ch_1fr] gap-x-2">
          <dt className="text-ac">about</dt>
          <dd>who I am</dd>
          <dt className="text-ac">projects</dt>
          <dd>what I&apos;m building</dd>
          <dt className="text-ac">contact</dt>
          <dd>where to find me</dd>
          <dt className="text-ac">clear</dt>
          <dd>clear the screen</dd>
        </dl>
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
        <ul>
          <li>
            <span className="text-ac">*</span> {link(b.href, b.name)}: {b.pitch} ({b.pill.toLowerCase()})
          </li>
          {site.pinned
            .filter((p) => p.name !== b.name)
            .map((p) => (
              <li key={p.name}>
                <span className="text-ac">*</span> {p.href ? link(p.href, p.name) : p.name}: {p.description}
              </li>
            ))}
          <li className="text-mu">More on {link("/projects", "/projects")}</li>
        </ul>
      );
    }
    case "contact":
      return (
        <ul>
          {site.email && <li>email: {link(`mailto:${site.email.user}@${site.email.domain}`, `${site.email.user}@${site.email.domain}`)}</li>}
          {site.links.map((l) => (
            <li key={l.href}>
              {l.label.toLowerCase()}: {link(l.href, l.href.replace(/^https?:\/\//, ""))}
            </li>
          ))}
        </ul>
      );
    case "":
      return null;
    default:
      return (
        <p>
          <span className="text-danger">command not found: {input}</span>. Type <span className="text-ac">help</span>.
        </p>
      );
  }
}

const welcome: Block = {
  id: 0,
  output: (
    <p>
      Welcome to {site.handle}.dev. Type <span className="text-ac">help</span>, or tap a command below.
    </p>
  ),
};

export function Terminal() {
  const [blocks, setBlocks] = useState<Block[]>([welcome]);
  const [value, setValue] = useState("");
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [blocks]);

  function submit(raw: string) {
    const command = raw.trim().toLowerCase();
    setValue("");
    if (command === "clear") {
      setBlocks([]);
      return;
    }
    setBlocks((b) => [...b, { id: nextId.current++, command, output: run(command) }]);
  }

  return (
    <div className="rounded-xl border border-ln">
      <div className="flex items-center gap-2 border-b border-ln px-4 py-2 text-xs text-mu">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full border border-ln" />
          <span className="size-2.5 rounded-full border border-ln" />
          <span className="size-2.5 rounded-full border border-ln" />
        </span>
        {site.handle}@dev: ~
      </div>
      <div className="h-[55dvh] min-h-64 overflow-y-auto p-4 text-sm leading-6" onClick={() => inputRef.current?.focus()}>
        <div aria-live="polite" className="flex flex-col gap-3">
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
          className="mt-3 flex items-center gap-2"
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
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent caret-ac outline-none"
          />
        </form>
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-ln px-4 py-3">
        <span className="sr-only">Shortcuts:</span>
        {commands.map((c) => (
          <button key={c} type="button" onClick={() => submit(c)} className="rounded-md border border-ln bg-sf px-2.5 py-1 text-sm hover:text-ac2">
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
