import esbuild from "esbuild";
import { exec } from "child_process";

// Run TypeScript to generate types
exec("tsc");

// Shared build config
const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  minify: true,
  target: "es6",
  logLevel: "info",
};

// Build multiple formats
Promise.all([
  esbuild.build({
    ...sharedConfig,
    format: "esm",
    outfile: "dist/esm/errorflux.esm.js",
  }),
  esbuild.build({
    ...sharedConfig,
    outfile: "dist/iife/bundle.iife.js",
    format: "iife",
    globalName: "MyLibrary", // Global name when used in the browser
  }),
]).then(() => console.log("✅ Build Complete"));
