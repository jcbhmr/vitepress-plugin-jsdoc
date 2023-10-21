# JSDoc plugin for VitePress

🧙‍♂️ Automagic JSDoc integration for your VitePress site

<p align=center>
  <img src="https://i.imgur.com/HuNHhJX.png">
</p>

<p align=center>
  <a href="https://stackblitz.com/github/jcbhmr/vitepress-plugin-jsdoc"><img valign=middle src="https://developer.stackblitz.com/img/open_in_stackblitz_small.svg"></a>
</p>

🤩 Works great with [jsdoc-plugin-typescript] \
👨‍🏭 Comes with premade `js` and `ts` presets \
🌐 Adds a bunch of `/api/*` pages to your VitePress site

<details><summary><b>👀 Screenshots</b></summary>
<br>
<div align=center>
  <img src="https://picsum.photos/550/400">
  <img src="https://picsum.photos/300/400">
  <img src="https://picsum.photos/500/340">
</div>
<br>
</details>

## Install

![npm](https://img.shields.io/static/v1?style=for-the-badge&message=npm&color=CB3837&logo=npm&logoColor=FFFFFF&label=)
![pnpm](https://img.shields.io/static/v1?style=for-the-badge&message=pnpm&color=222222&logo=pnpm&logoColor=F69220&label=)
![Yarn](https://img.shields.io/static/v1?style=for-the-badge&message=Yarn&color=2C8EBB&logo=Yarn&logoColor=FFFFFF&label=)
![Bun](https://img.shields.io/static/v1?style=for-the-badge&message=Bun&color=000000&logo=Bun&logoColor=FFFFFF&label=)

```sh
npm install -D vitepress-plugin-jsdoc
```

## Usage

![VitePress](https://img.shields.io/static/v1?style=for-the-badge&message=VitePress&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)
![Vue.js](https://img.shields.io/static/v1?style=for-the-badge&message=Vue.js&color=222222&logo=Vue.js&logoColor=4FC08D&label=)

```js
// .vitepress/config.ts
import { defineConfig } from "vitepress";
import jsdoc from "vitepress-plugin-jsdoc";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [jsdoc()],
  },

  // ...
});
```

[![](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jcbhmr/vitepress-plugin-jsdoc)

### Options

You can specify configuration options via `jsdoc(options)` where `options` is an
object with these properties. They are all **optional** so you can just use
`jsdoc()` if you like the defaults.

- **`include`:** List (or single item) of glob strings (ex: `src/**.js`). These files will
  be passed to the `jsdoc` CLI to generate the output JSON which will then be
  used to generate the documentation pages. Defaults to `./**`. Note that this
  is **different** from `conf.source.includePattern`.

- **`exclude`:** List (or single item) of glob strings (ex: `docs/**`) to **exclude** from
  the `include` list before passing to the `jsdoc` CLI. By default it is set to
  `test/**`. Note that this is **different** from `conf.source.excludePattern`.
  The VitePress root folder, `node_modules`, `.cache`, and the VitePress root will always
  be excluded.

- **`base`:** Base URL (relative to the site's existing `base` URL) like `/api/`
  or `/jsdoc/`. Slashes are auto-normalized; `api`, `/api`, `api/`, and `/api/`
  all mean the same thing. This is the prefix that will be used to serve the API
  docs under. By default this is `/api/`.

- **`conf`:** JSDoc `conf.json` file path (string or `file:` URL) or a
  JSON-serializable object to write as `conf.json` and pass to the `jsdoc` CLI.
  Can also be `null` or `undefined` in which case no `--configure` flag will be
  passed to `jsdoc`. Defaults to `undefined`. **You will need to specify this
  option if you are using JSDoc plugins.**

<!-- - **`sidebar`:** A boolean; `true` by default. Set this to `false` to disable
  injecting a `sidebar` config for the `/api/*` routes. -->

<!-- Here's an example of using this plugin with [jsdoc-plugin-typescript] to
document TypeScript files in `src/`:

```js
// .vitepress/config.ts
import { defineConfig } from "vitepress";
import jsdoc from "vitepress-plugin-jsdoc";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [
      jsdoc({
        include: "src/**",
        conf: {
          source: {
            includePattern: ".+\\.(c|m)?(j|t)s(doc|x)?$",
          },
          sourceType: "module",
          plugins: ["jsdoc-plugin-typescript"],
          typescript: {
            moduleRoot: ".",
          },
        },
      }),
    ],
  },

  // ...
});
```

[![](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jcbhmr/vitepress-plugin-jsdoc) -->

<!-- ### Customization

Beyond the options, you can override the `<VPJSD*>` components if you want to
tweak something:

```js
// .vitepress/theme/index.ts
// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
    app.component("VPJSDIndex", MyComponent1);
    app.component("VPJSDParamList", MyComponent2);
  },
};
```

[![](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jcbhmr/vitepress-plugin-jsdoc) -->

## How it works

1. We copy our internal `pages/` folder (part of this package) to the
   `.cache/jsdoc/` folder in the VitePress source tree. We can't use
   `.vitepress/cache/*` because it's excluded from the page indexing step and/or
   it might not be in the `.srcDir` which is where pages are indexed from.
2. `jsdoc` is run to generate a `doc.json` with all the data in it. We are using
   [jsdoc-json] to do this.
3. We use Vite's `configure()` hook to:
   1. Rewrite all `/api/:path` routes to our `.gitignore`-ed
      `.cache/jsdoc/:path` pages
   2. Create an import rewrite for `@doc.json` to the `.cache/jsdoc/doc.json`
      JSDoc JSON output
   3. Create an import rewrite to wrap the `vitepress/theme` with our additional
      `.enhanceApp()` custom `<VPJSD*>` components
   <!-- 4. Inject a `sidebar` configuration for the `/api/*` routes to use that
      outlines all pages -->
4. We use the `doc.json` to populate those routes with content

## Development

![VitePress](https://img.shields.io/static/v1?style=for-the-badge&message=VitePress&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)
![Vue.js](https://img.shields.io/static/v1?style=for-the-badge&message=Vue.js&color=222222&logo=Vue.js&logoColor=4FC08D&label=)

[![](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/https://github.com/jcbhmr/vitepress-plugin-jsdoc)

[jsdoc-json]: https://github.com/tschaub/jsdoc-json#readme
[jsdoc-plugin-typescript]:
  https://github.com/openlayers/jsdoc-plugin-typescript#readme
