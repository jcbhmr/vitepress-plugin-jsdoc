import { readFile } from "node:fs/promises"

export default {
    async load() {
        const jsdocPath = new URL("./doc.json", import.meta.url)
        return JSON.parse(await readFile(jsdocPath))
    }
}