import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "apps/landing/src/lib/**/*.test.ts"],
    environment: "node",
  },
});
