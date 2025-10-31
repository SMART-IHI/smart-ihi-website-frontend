import { useEffect, useState } from "react";

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (theme === "dark") el.classList.add("dark");
  else el.classList.remove("dark");
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  // Only two states: 'light' or 'dark'. Default to light and ignore system/browser.
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Initialize from localStorage; fallback to light
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const initial = saved === "dark" ? "dark" : "light";
    applyTheme(initial);
    setTheme(initial);
    // Persist initial so SSR/hard reload stays consistent
    if (typeof window !== "undefined") localStorage.setItem("theme", initial);
    setInitialized(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    // Apply and persist explicit user choice only after init
    if (!initialized) return;
    applyTheme(theme);
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
  }, [theme, initialized]);

  if (!mounted) return null;

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle Theme"
      className="ml-2 rounded-md border border-border px-3 py-1 text-sm text-foreground hover:bg-card"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
