import { renderSync } from "jsdoc-api"
import { glob } from "glob"
import {Plugin, ResolvedConfig} from "vite"
import { fileURLToPath } from "node:url"
import {SiteConfig, resolvePages} from "vitepress"
import { UserConfig } from "vite"
import { basename, dirname, join, relative, resolve, sep } from "node:path"
import { createRequire } from "node:module"
import { cp, mkdir, stat } from "node:fs/promises"
import resolveRewrites from "./resolveRewrites.js"
import { existsSync } from "node:fs"

interface JSDocOptions {
  files: string | URL | (string | URL)[]
  prefix?: string
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
  let config: ResolvedConfig & { vitepress: SiteConfig }
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

      // TODO: Make this fail on errors. Right now it swallows output & errors.
      renderSync({
        files,
        destination: join(myCacheDir, "doc.json"),
        template: dirname(createRequire(import.meta.url).resolve("jsdoc-json/publish.js"))
      })

      const myConfig = await resolvePages(myCacheDir, c.vitepress.userConfig)
      let myPrefix = relative(c.vitepress.srcDir, myCacheDir)
      myPrefix = myPrefix.replaceAll(sep, "/") + "/"
      console.debug(myPrefix)

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

      console.debug(c.vitepress.pages)
      // console.debug(c.vitepress.dynamicRoutes)
      console.debug(c.vitepress.rewrites)

      const myRewrites = resolveRewrites(c.vitepress.pages, {[myPrefix + ":path"]: prefix + ":path" })
      console.debug({[myPrefix + ":path"]: prefix + ":path" }, myRewrites)

      Object.assign(c.vitepress.rewrites.map, myRewrites.map)
      Object.assign(c.vitepress.rewrites.inv, myRewrites.inv)

      // console.debug(c.vitepress.pages)
      // console.debug(c.vitepress.dynamicRoutes)
      console.debug(c.vitepress.rewrites)
    },
    async configResolved(c: ResolvedConfig & { vitepress: SiteConfig }) {
      config = c;
      // console.debug(config)
    },
    async buildStart(options) {
      for (const f of files) {
        this.addWatchFile(f)
      }
    },
  }
}

export default jsdoc