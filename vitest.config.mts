import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      "server-only": path.resolve(import.meta.dirname, "lib/test-empty.ts"),
    },
  },
  test: { include: ["lib/**/*.test.ts"] },
});
