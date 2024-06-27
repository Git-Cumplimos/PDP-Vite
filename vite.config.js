import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    server: {
      port: 3000,
    },
    plugins: [react()],
    // css: {
    //   modules: {
    //     // Define your CSS Modules settings here if needed
    //     // E.g., localsConvention: 'camelCaseOnly'
    //   },
    //   preprocessorOptions: {
    //     css: {
    //       additionalData: `@import "@/styles/variables.css";`,
    //     },
    //   },
    // },
  };
});

