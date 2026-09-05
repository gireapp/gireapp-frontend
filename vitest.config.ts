/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // Node by default; component specs opt in per file with
    // `// @vitest-environment jsdom` so DOM setup costs nothing elsewhere.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // Component specs that await a real UX delay (e.g. the 2s redirect after a
    // password reset) intermittently exceed the 5s default once jsdom files run
    // in parallel. Converting those to fake timers would be faster still.
    testTimeout: 15_000,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**", "src/features/**", "src/server/**"],
    },
  },
  // tsconfig sets jsx: "preserve" for Next's own compiler, so esbuild needs to be
  // told to use the automatic runtime or component specs hit "React is not defined".
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
