import { defineConfig } from "vitepress";
import jsdoc from "vitepress-plugin-jsdoc";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  vite: {
    clearScreen: false,
    plugins: [jsdoc()],
  },
});
