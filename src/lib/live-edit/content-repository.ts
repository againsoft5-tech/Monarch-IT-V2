import type { HomepageContent } from '@/lib/live-edit/homepage'
import { ensureLayout } from '@/lib/live-edit/layout-actions'
import { readHomepageContent, writeHomepageContent } from '@/lib/live-edit/persist'

/**
 * Storage seam for homepage CMS.
 *
 * Today: JSON file via `persist.ts`.
 * Later (admin / DB): implement the same interface against REST/GraphQL/Prisma
 * and swap `homepageRepository` — LiveEditShell, drawers, and canvas stay unchanged.
 */
export type HomepageRepository = {
  read: () => Promise<HomepageContent>
  write: (content: HomepageContent) => Promise<HomepageContent>
}

export const fileHomepageRepository: HomepageRepository = {
  async read() {
    return readHomepageContent()
  },
  async write(content) {
    const next = ensureLayout(content)
    await writeHomepageContent(next)
    return next
  },
}

/** Active backend — change only this binding when moving to admin DB. */
export const homepageRepository: HomepageRepository = fileHomepageRepository
