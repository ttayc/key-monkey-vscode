import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "webview",
    emptyOutDir: false,
    rollupOptions: {
      input: "./webview/src/index.ts",
      output: {
        entryFileNames: "index.js",
      },
    },
  },
});
