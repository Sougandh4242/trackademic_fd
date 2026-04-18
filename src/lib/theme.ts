import * as React from "react";

type Theme = "dark" | "light";
const KEY = "trackademic_theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const stored = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
  apply(stored);
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(KEY) as Theme | null) ?? "dark";
  });

  React.useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = React.useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, setTheme, toggle };
}
