import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: true,
    dts: true,
    target: "es2023",
    outDir: "dist",
    external: ["dotenv"],
    treeshake: true,
    esbuildOptions(options) {
        options.banner = {
            js: 'import "dotenv/config";',
        };
    },
});
