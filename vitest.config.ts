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
