import { defineConfig } from "vitepress";
import jsdoc from "../../../src/index.js";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    clearScreen: false,
    plugins: [
      jsdoc({
        include: "src/**",
        conf: {
          plugins: ["jsdoc-plugin-typescript"],
          typescript: {
            moduleRoot: ".",
          },
        },
      }),
    ],
  },

  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "API", link: "/api/" },
    ],
  },
});
