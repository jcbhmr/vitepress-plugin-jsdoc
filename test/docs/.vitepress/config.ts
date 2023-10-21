import { defineConfig } from 'vitepress'
import jsdoc from "../../../src/index.js"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    clearScreen: false,
    plugins: [jsdoc({ files: new URL("../../", import.meta.url) })]
  },

  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: "API", link: "/api/" },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
