// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress-plugin-jsdoc/vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout: (props, slots) => {
        return h(DefaultTheme.Layout, props, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
            ...slots,
        })
    },
    enhanceApp({ app, router, siteData }) {
        // ...
    }
}

// console.debug("vitepress/theme override loaded")