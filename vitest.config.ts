import { defineConfig } from "vitest/config";

// Unit tests target plain, dependency-free functions in src/lib/auth (see
// docs/authentication-implementation.md, "Automated tests") — no DOM, no
// Supabase, no network — so the default Node environment is sufficient.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
