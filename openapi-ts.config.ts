import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./api",
  },

  plugins: [
    {
      name: "@hey-api/client-nuxt",
      runtimeConfigPath: "./openapi-runtime.config.ts",
    },
  ],
});
