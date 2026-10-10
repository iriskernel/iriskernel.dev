"use client";

/*
  Flips between light and dark and remembers the choice.
  Before the first choice, the inline script in the layout follows the system setting.
  Which label shows is decided by CSS (data-theme on <html>), so there is no flash.
*/
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked: the choice lasts until the page is closed
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md border border-ln px-2 py-0.5 text-mu hover:text-tx"
    >
      <span className="theme-label-light">
        <span aria-hidden="true">☾</span>
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="theme-label-dark">
        <span aria-hidden="true">☀</span>
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}

/** Runs before the page paints: applies the saved choice, or the system setting */
export const themeScript = `(function(){try{var m=matchMedia("(prefers-color-scheme: dark)");function a(){var t=null;try{t=localStorage.getItem("theme")}catch(e){}document.documentElement.dataset.theme=t==="light"||t==="dark"?t:(m.matches?"dark":"light")}a();m.addEventListener("change",a)}catch(e){}})();`;
