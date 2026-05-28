import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import prefixer from "postcss-prefixwrap"

const outDir = path.resolve(
  __dirname,
  "admin",
  "view",
  "javascript",
  "product_featured_subcategory"
)

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        prefixer("#root", {
          ignoredSelectors: [":root", "body", ".html", /root/],
        }),
      ],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "cleanup-keep-2-files",
      closeBundle() {
        try {
          const keep = new Set([
            "product_featured_subcategory.js",
            "product_featured_subcategory.css",
          ])
          if (!fs.existsSync(outDir)) return
          for (const f of fs.readdirSync(outDir)) {
            if (!keep.has(f)) fs.rmSync(path.join(outDir, f), { force: true })
          }
        } catch (e) {
          // noop
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    minify: true,
    target: "es2019",
    rollupOptions: {
      input: path.resolve(__dirname, "src", "main.tsx"),
      output: {
        entryFileNames: "product_featured_subcategory.js",
        chunkFileNames: "chunk-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "product_featured_subcategory.css"
          }
          return assetInfo.name || "asset-[hash]"
        },
      },
    },
  },
})
