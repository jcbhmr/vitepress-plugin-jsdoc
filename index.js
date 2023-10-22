import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { $ } from 'execa';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';
import { resolvePages } from 'vitepress';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import.meta.resolve ??= (x) => {
    console.assert(/^\.?\.?\//.test(x), "should be relative specifier")
    return new URL(x, import.meta.url).href
}
/**
 * @typedef {object} JSDocConfJSON
 * @property {string[]} [plugins]
 * @property {number} [recurseDepth]
 * @property {object} [source]
 * @property {string|string[]} [source.include]
 * @property {string|string[]} [source.exclude]
 * @property {string} [source.includePattern]
 * @property {string} [source.excludePattern]
 * @property {string} [sourceType]
 * @property {object} [opts]
 * @property {string} [opts.template]
 * @property {string} [opts.encoding]
 * @property {string} [opts.destination]
 * @property {boolean} [opts.recurse]
 * @property {string} [opts.tutorials]
 * @property {object} [tags]
 * @property {boolean} [tags.allowUnknownTags]
 * @property {string[]} [tags.dictionaries]
 * @property {object} [templates]
 * @property {boolean} [templates.cleverLinks]
 * @property {boolean} [templates.monospaceLinks]
 */
/**
 * @typedef {object} JSDocOptions
 * @property {string|(JSDocConfJSON & Record<string, any>)} [conf]
 * @property {boolean} [recurse]
 * @property {string} [base]
 * @property {boolean} [sidebar]
 */
/**
 * @param {JSDocOptions | string|(JSDocConfJSON & Record<string, any>)} [options]
 * @returns {import('vitepress').Plugin[]}
 */
export default function jsdoc(options = undefined) {
    // console.debug("process.cwd()", process.cwd())
    /** @type {string|(JSDocConfJSON & Record<string, any>) | undefined} */
    let conf
    /** @type {boolean} */
    let recurse
    /** @type {string} */
    let base
    /** @type {boolean} */
    let sidebar
    if (options && ["conf", "recurse", "base", "sidebar"].some(x => x in options)) {
        ({ recurse, base, sidebar, conf } = options)
    } else {
        conf = options
    }
    conf ??= {
        source: {
            include: ".",
            exclude: ["docs", ".vitepress", "test", "node_modules"]
        },
        recurseDepth: 10
    }
    if (typeof conf === "string") {
        confFile = conf
    }
    recurse ??= true
    base ??= "api/"
    base = base.replace(/^\/$/, "");
    base = base.replace(/\/$/, "") + "/";
    sidebar ??= true
    /** @type {string} */
    let cacheDir
    /** @type {string} */
    let confFile
    /** @type {string} */
    let docFile
    /** @type {import('vite').ResolvedConfig & { vitepress: import('vitepress').SiteConfig }} */
    let config
    return [{
        name: "vitepress-plugin-jsdoc-1",
        /** @param {import('vite').UserConfig & { vitepress: import('vitepress').SiteConfig }} */
        async config(c) {
            // console.debug("c", c)
            // console.debug("c.resolve.alias", c.resolve?.alias)
            c.resolve.preserveSymlinks = true
            /** @type {{ find: RegExp, replacement: string }} */
            const alias = c.resolve.alias.find(x => x.find instanceof RegExp && x.find.toString() === /^vitepress\/theme$/.toString())
            c.resolve.alias.push({
                find: "vitepress-plugin-jsdoc/vitepress/theme",
                replacement: alias.replacement,
            })
            c.resolve.alias.push({
                find: "vitepress-plugin-jsdoc/doc.json",
                customResolver() {
                    console.assert(docFile, "docFile not set")
                    return docFile
                }
            })
        },
    },
    {
        name: "vitpress-plugin-jsdoc-2",
        enforce: "pre",
        /** @param {import('vite').ResolvedConfig & { vitepress: import('vitepress').SiteConfig }} */
        async configResolved(c) {
            config = c;
            // console.debug("config", config)
            // console.debug("config.vitepress", config.vitepress)
            cacheDir = join(c.vitepress.cacheDir, "vitepress-plugin-jsdoc")
            await mkdir(cacheDir, {recursive: true})
            if (!confFile) {
                confFile = join(cacheDir, "conf.json")
                await writeFile(confFile, JSON.stringify(conf))
            }
            console.debug("readFile(confFile)", await readFile(confFile, "utf8"))
            docFile = join(cacheDir, "doc.json")
            await $({ stdio: "inherit" })`jsdoc -c ${confFile} ${recurse ? ["-r"] : []} -t ${dirname(createRequire(import.meta.url).resolve("jsdoc-json/publish.js"))} -d ${docFile}`
            console.assert(existsSync(docFile), "docFile exists")
            // console.debug("readFile(docFile)", await readFile(docFile, "utf8"))
        },
    }]
}