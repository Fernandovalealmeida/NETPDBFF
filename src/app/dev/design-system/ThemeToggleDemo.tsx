"use client";

import { useState } from "react";

import { Switch } from "@/components/ui/Switch";
import { applyTheme, getStoredTheme, getSystemTheme } from "@/lib/theme/apply-theme";
import type { Theme } from "@/lib/theme/types";

// Internal-only: exercises the M5.1 theme mechanism (ThemeScript +
// apply-theme.ts + Switch) end to end, since no real page wires a theme
// toggle into navigation yet (that's M5.2 shell work). Client Component:
// genuinely interactive, reads/writes localStorage + document.cookie.
//
// Initial state is computed lazily (not via a `useEffect` + `setState`,
// which `react-hooks/set-state-in-effect` correctly flags as an avoidable
// render) — this is a dev-only diagnostic page, so the resulting
// first-paint hydration mismatch (server has no `window`; client resolves
// the real stored/system theme immediately) is an acceptable, contained
// tradeoff, silenced explicitly rather than left to log a warning.
export function ThemeToggleDemo() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : (getStoredTheme() ?? getSystemTheme())
  );

  return (
    <label suppressHydrationWarning className="flex items-center gap-3 text-sm text-foreground">
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => {
          const next: Theme = checked ? "dark" : "light";
          setTheme(next);
          applyTheme(next);
        }}
        aria-label="Toggle dark mode"
      />
      Dark mode ({theme})
    </label>
  );
}
