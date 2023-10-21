import { $ } from "execa"

interface JSDocOptions {
  template?: string
  destination?: string
  configure?: string
  cwd?: string
}

async function jsdoc(files: string[], options: JSDocOptions): Promise<void> {
  await $({ cwd: options.cwd })`jsdoc \
    ${options.configure ? ['--configure', options.configure] : []} \
    ${options.template ? ["--template", options.template] : []} \
    ${options.destination ? ["--destination", options.destination] : []} \
    ${files}`
}

export default jsdoc
  