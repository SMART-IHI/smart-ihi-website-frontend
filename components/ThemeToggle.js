import { useEffect, useState } from "react";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (theme === "dark") el.classList.add("dark");
  else el.classList.remove("dark");
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("system");
  const [resolved, setResolved] = useState("light");

  useEffect(() => {
    setMounted(true);
    // Initialize from localStorage or system
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const initial = saved || "light";
    setTheme(initial);
  }, []);

  useEffect(() => {
    const actual = theme === "system" ? (getSystemPrefersDark() ? "dark" : "light") : theme;
    setResolved(actual);
    applyTheme(actual);
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
  }, [theme]);

  if (!mounted) return null;

  const nextTheme = resolved === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle Theme"
      className="ml-2 rounded-md border border-border px-3 py-1 text-sm text-foreground hover:bg-card"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${nextTheme} mode`}
    >
      {resolved === "dark" ? "Light" : "Dark"}
    </button>
  );
}
