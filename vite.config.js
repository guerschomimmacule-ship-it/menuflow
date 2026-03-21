import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "generate-redirects",
      closeBundle() {
        writeFileSync(
          "dist/_redirects",
          "/admin    /index.html    200\n/cuisine  /index.html    200\n/client   /index.html    200\n"
        );
      },
    },
  ],
  root: ".",
  build: { outDir: "dist" },
});
