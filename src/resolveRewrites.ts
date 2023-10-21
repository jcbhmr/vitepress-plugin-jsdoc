import { compile, match } from 'path-to-regexp'
import type { UserConfig } from 'vitepress'

export default function resolveRewrites(
    pages: string[],
    userRewrites: UserConfig['rewrites']
  ) {
    const rewriteRules = Object.entries(userRewrites || {}).map(([from, to]) => ({
      toPath: compile(`/${to}`, { validate: false }),
      matchUrl: match(from.startsWith('^') ? new RegExp(from) : from)
    }))
  
    const pageToRewrite: Record<string, string> = {}
    const rewriteToPage: Record<string, string> = {}
    if (rewriteRules.length) {
      for (const page of pages) {
        for (const { matchUrl, toPath } of rewriteRules) {
          const res = matchUrl(page)
          if (res) {
            const dest = toPath(res.params).slice(1)
            pageToRewrite[page] = dest
            rewriteToPage[dest] = page
            break
          }
        }
      }
    }
  
    return {
      map: pageToRewrite,
      inv: rewriteToPage
    }
  }