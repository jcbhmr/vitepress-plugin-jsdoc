import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { UserConfig, Plugin, ResolvedConfig } from "vite";
import { SiteConfig, resolvePages } from "vitepress";
import { glob } from "glob";
import $jsdoc from "./jsdoc.js";

interface JSDocConfJSON {
  plugins?: string[];
  recurseDepth?: number;
  source?: {
      include?: string[];
      exclude?: string[];
      includePattern?: string;
      excludePattern?: string;
  };
  sourceType?: string;
  opts?: {
      template?: string;
      encoding?: string;
      destination?: string;
      recurse?: boolean;
      tutorials?: string;
  };
  tags?: {
      allowUnknownTags?: boolean;
      dictionaries?: string[];
  };
  templates?: {
      cleverLinks?: boolean;
      monospaceLinks?: boolean;
  };
}


interface JSDocOptions {
  /**
   * List (or single item) of glob strings (ex: `src/**.js`). These files will
  be passed to the `jsdoc` CLI to generate the output JSON which will then be
  used to generate the documentation pages. Defaults to `./**`. Note that this
  is **different** from `conf.source.includePattern`.
   */
  include?: string | (string)[];

  /**
   * List (or single item) of glob strings (ex: `docs/**`) to **exclude** from
  the `include` list before passing to the `jsdoc` CLI. By default it is set to
  `test/**`. Note that this is **different** from `conf.source.excludePattern`.
  The VitePress root folder, `node_modules`, `.cache`, and the VitePress root will always
  be excluded.
   */
  exclude?: string | (string)[]

  /**
   * Base URL (relative to the site's existing `base` URL) like `/api/`
  or `/jsdoc/`. Slashes are auto-normalized; `api`, `/api`, `api/`, and `/api/`
  all mean the same thing. This is the prefix that will be used to serve the API
  docs under. By default this is `/api/`.
   */
  base?: string;

  /**
   * JSDoc `conf.json` file path (string or `file:` URL) or a
  JSON-serializable object to write as `conf.json` and pass to the `jsdoc` CLI.
  Can also be `null` or `undefined` in which case no `--configure` flag will be
  passed to `jsdoc`. Defaults to `undefined`. **You will need to specify this
  option if you are using JSDoc plugins.**
   */
  conf?: string | (JSDocConfJSON & Record<string, any>);

  /**
   * A boolean; `true` by default. Set this to `false` to disable
  injecting a `sidebar` config for the `/api/*` routes.
   */
  sidebar?: boolean
}

function jsdoc(options: JSDocOptions): Plugin {
  // console.debug("process.cwd()", process.cwd())

  let myBase = options.base ?? "api/";
  myBase = myBase.replace(/^\/$/, "");
  myBase = myBase.replace(/\/$/, "") + "/";

  const doJSDoc = async () => {
    // console.debug("running jsdoc")
    await $jsdoc(files, {
      stdio: "inherit",
      configure: confPath,
      destination: docPath,
      template: dirname(
        createRequire(import.meta.url).resolve("jsdoc-json/publish.js"),
      ),
    });
  }

  let firstBuild = true
  let files: string[];
  let preConfigVitepressRoot: string;
  let preConfigVitepressSrcDir: string
  let myCacheDir: string;
  let confPath: string | undefined;
  let docPath: string;
  let config: ResolvedConfig & { vitepress: SiteConfig }
  return {
    name: "jsdoc",
    async config(c: UserConfig & { vitepress: SiteConfig }, env) {
      preConfigVitepressRoot = c.vitepress.root
      preConfigVitepressSrcDir = c.vitepress.srcDir;

      myCacheDir = join(c.vitepress.srcDir, "out/jsdoc");
      await mkdir(myCacheDir, { recursive: true });
      const myPagesDir = new URL("../pages/", import.meta.url);
      await cp(myPagesDir, myCacheDir, { recursive: true });

      if (options.conf) {
        if (typeof options.conf === "string") {
          confPath = resolve(options.conf)
        } else {
          confPath = join(myCacheDir, "conf.json")
          await writeFile(confPath, JSON.stringify(options.conf))
        }
      }
      docPath = join(myCacheDir, "doc.json")

      const includeGlobs = [options.include ?? "./**"].flat()
      const alwaysExclude = ["**/node_modules/**", "**/out/**", `${c.vitepress.root}/**`];
      const excludeGlobs = [options.exclude ?? "test/**"].flat().concat(alwaysExclude)
      files = await glob(includeGlobs, { ignore: excludeGlobs, nodir: true, absolute: true })
      // console.debug("files", files)
      
      await doJSDoc()

      Object.assign(c.vitepress, await resolvePages(c.vitepress.srcDir, {
        ...c.vitepress.userConfig,
        rewrites: {
          ...c.vitepress.userConfig.rewrites,
          "out/jsdoc/:path": myBase + ":path"
        }
      }))

      return {
        resolve: {
          alias: {
            "@doc.json": docPath
          }
        },
      }
    },
    async configResolved(c: ResolvedConfig & { vitepress: SiteConfig }) {
      config = c;
      // console.debug("config", config)
      // console.debug("config.vitepress", config.vitepress)
      // console.debug("config.resolve.alias", config.resolve.alias)
      // console.debug("config.vitepress.pages", config.vitepress.pages)
      // console.debug("config.vitepress.rewrites", config.vitepress.rewrites)
      assert.equal(preConfigVitepressRoot, config.vitepress.root)
      assert.equal(preConfigVitepressSrcDir, config.vitepress.srcDir)
    },
    async buildStart(options) {
      for (const f of files) {
        this.addWatchFile(f);
      }
      if (firstBuild) {
        firstBuild = false
      } else {
        await doJSDoc()
      }
    },
  };
}

export default jsdoc;
export type { JSDocOptions }
