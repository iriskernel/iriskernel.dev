"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function TerminalShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl + Alt + T (or Cmd + Alt + T on macOS)
      const isModifier = (e.ctrlKey || e.metaKey) && e.altKey;
      const isKeyT = e.key.toLowerCase() === "t" || e.code === "KeyT";

      if (isModifier && isKeyT) {
        e.preventDefault();

        if (pathname === "/terminal") {
          const input = document.getElementById("terminal-input") as HTMLInputElement | null;
          if (input) {
            input.focus();
          }
        } else {
          router.push("/terminal");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return null;
}
