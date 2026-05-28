import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      "react-native": path.resolve(__dirname, "__tests__/__mocks__/react-native.tsx"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".expo"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary"],
      include: ["store/**", "lib/**", "types/**", "components/**"],
    },
  },
});
