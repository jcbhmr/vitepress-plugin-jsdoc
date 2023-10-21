import $jsdoc from "./jsdoc.js"
import { glob } from "glob"
import {Alias, Plugin, ResolvedConfig} from "vite"
import { fileURLToPath } from "node:url"
import {SiteConfig, resolvePages} from "vitepress"
import { UserConfig } from "vite"
import { basename, dirname, join, relative, resolve, sep } from "node:path"
import { createRequire } from "node:module"
import { cp, mkdir, stat, writeFile } from "node:fs/promises"
import resolveRewrites from "./resolveRewrites.js"
import { existsSync } from "node:fs"

interface JSDocOptions {
  files: string | URL | (string | URL)[]
  prefix?: string
  conf?: object
}

async function normalizeFiles(files: string | URL | (string | URL)[]): Promise<string[]> {
  const a = [files].flat()
  const f = async (x: string | URL) => {
    if (typeof x === "string") {
      return await glob(x, { ignore: "**/node_modules/**" })
    } else {
      return fileURLToPath(x)
    }
  }
  const b = await Promise.all(a.map(f))
  return b.flat()
}

function jsdoc(options: JSDocOptions): Plugin {
  let files: string[]
  let myCacheDir: string
  let prefix = options.prefix ?? "api/"
  prefix = prefix.replace(/^\/$/, "")
  prefix = prefix.replace(/\/$/, "") + "/"
  return {
    name: "jsdoc",
    async config(c: UserConfig & { vitepress: SiteConfig }, env) {
      files = await normalizeFiles(options.files)

      if (c.vitepress.cacheDir.startsWith(c.vitepress.srcDir)) {
        myCacheDir = join(c.vitepress.cacheDir, "jsdoc")
      } else {
        myCacheDir = join(c.vitepress.srcDir, ".cache/jsdoc")
      }

      const srcPagesDir = new URL("../pages/", import.meta.url)
      await mkdir(myCacheDir, { recursive: true })
      await cp(srcPagesDir, myCacheDir, { recursive: true })

      await writeFile(join(myCacheDir, "conf.json"), JSON.stringify(options.conf || {}))
      await $jsdoc(files, {
        cwd: c.root,
        configure: join(myCacheDir, "conf.json"),
        destination: join(myCacheDir, "doc.json"),
        template: dirname(createRequire(import.meta.url).resolve("jsdoc-json/publish.js"))
      });
      (c.resolve.alias as Alias[]).unshift({ find: ".vitepress/jsdoc", replacement: join(myCacheDir, "doc.json") })

      const myConfig = await resolvePages(myCacheDir, c.vitepress.userConfig)
      let myPrefix = relative(c.vitepress.srcDir, myCacheDir)
      myPrefix = myPrefix.replaceAll(sep, "/") + "/"

      for (const [i, x] of myConfig.pages.entries()) {
        myConfig.pages[i] = myPrefix + x
      }
      c.vitepress.pages.push(...myConfig.pages)

      for (const r of myConfig.dynamicRoutes.routes) {
        r.path = myPrefix + r.path
        r.route = myPrefix + r.route
      }
      c.vitepress.dynamicRoutes.routes.push(...myConfig.dynamicRoutes.routes)
      Object.assign(c.vitepress.dynamicRoutes.fileToModulesMap, myConfig.dynamicRoutes.fileToModulesMap)

      for (const [k, v] of Object.entries(myConfig.rewrites.map)) {
        delete myConfig.rewrites.map[k]
        myConfig.rewrites.map[myPrefix + k] = v
      }
      for (const [k, v] of Object.entries(myConfig.rewrites.inv)) {
        myConfig.rewrites.inv[k] = myPrefix + v
      }
      Object.assign(c.vitepress.rewrites.map, myConfig.rewrites.map)
      Object.assign(c.vitepress.rewrites.inv, myConfig.rewrites.inv)

      const myRewrites = resolveRewrites(c.vitepress.pages, {[myPrefix + ":path"]: prefix + ":path" })

      Object.assign(c.vitepress.rewrites.map, myRewrites.map)
      Object.assign(c.vitepress.rewrites.inv, myRewrites.inv)
      ;(c.resolve.alias as Alias[]).unshift({ find: "@theme/index", replacement: "/home/jcbhmr/vitepress-plugin-jsdoc/src/theme.js" })
      console.log(c.resolve.alias)
    },
    async buildStart(options) {
      for (const f of files) {
        this.addWatchFile(f)
      }
    },
  }
}

export default jsdoc