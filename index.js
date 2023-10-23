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
 * @param {JSDocOptions | JSDocOptions["conf"]} [options]
 * @returns {import('vite').PluginOption}
 */
export default async function jsdoc(options = undefined) {
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
    /** @type {string} */
    let configVitepressCacheDir
    /** @type {import('vite').ResolvedConfig & { vitepress: import('vitepress').SiteConfig }} */
    let config
    console.log(process.argv)
    console.log(await import(function getCallerFile(position) {
        if (position === void 0) { position = 2; }
        if (position >= Error.stackTraceLimit) {
            throw new TypeError('getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `' + position + '` and Error.stackTraceLimit was: `' + Error.stackTraceLimit + '`');
        }
        var oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) { return stack; };
        var stack = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;
        if (stack !== null && typeof stack === 'object') {
            // stack[0] holds this file
            // stack[1] holds where this function was called
            // stack[2] holds the file we're interested in
            return stack[position] ? stack[position].getFileName() : undefined;
        }
    }()))
    // return [{
    //     name: "vitepress-plugin-jsdoc-1",
    //     enforce: "pre",
    //     /** @param {import('vite').UserConfig & { vitepress: import('vitepress').SiteConfig }} config */
    //     async config(config) {
    //         // console.debug("c", c)
    //         // console.debug("c.resolve.alias", c.resolve?.alias)
    //         config.resolve.preserveSymlinks ??= true
    //         configVitepressCacheDir = config.vitepress.cacheDir
    //         cacheDir = join(config.vitepress.cacheDir, "vitepress-plugin-jsdoc")
    //         await mkdir(cacheDir, { recursive: true })
    //         if (typeof conf === "string") {
    //             confFile = conf
    //         } else {
    //             confFile = join(cacheDir, "conf.json")
    //             await writeFile(confFile, JSON.stringify(conf))
    //         }
    //         docFile = join(cacheDir, "doc.json")
    //         await $({ stdio: "inherit" })`jsdoc -c ${confFile} ${recurse ? ["-r"] : []} -t ${dirname(createRequire(import.meta.url).resolve("jsdoc-json/publish.js"))} -d ${docFile}`
    //         console.assert(existsSync(docFile), "docFile does not exist")
    //         // console.debug("readFile(docFile)", await readFile(docFile, "utf8"))
    //         config.resolve.alias.push({
    //             find: "~vitepress-plugin-jsdoc/doc.json",
    //             replacement: docFile
    //         })
    //     },
    // },
    // {
    //     name: "vitepress-plugin-jsdoc-2",
    //     /** @param {import('vite').UserConfig & { vitepress: import('vitepress').SiteConfig }} config */
    //     config(config) {
    //         /** @type {{ find: RegExp, replacement: string }} */
    //         const alias = config.resolve.alias.find(x => x.find instanceof RegExp && x.find.toString() === /^vitepress\/theme$/.toString())
    //         config.resolve.alias.push({
    //             find: "~vitepress-plugin-jsdoc/vitepress/theme",
    //             replacement: alias.replacement,
    //         })
    //     },
    //     /** @param {import('vite').ResolvedConfig & { vitepress: import('vitepress').SiteConfig }} config */
    //     async configResolved(c) {
    //         config = c
    //         // console.debug(config)
    //         console.assert(config.vitepress.cacheDir === configVitepressCacheDir, "cacheDir changed")
    //     }
    // }]
}