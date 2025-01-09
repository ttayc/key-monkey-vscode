const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./webview/src/index.ts"],
    bundle: true,
    outfile: "./webview/index.js",
    platform: "browser",
    minify: true,
  })
  .catch(() => process.exit(1));
