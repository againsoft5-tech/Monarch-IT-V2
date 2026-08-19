import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import { ensureOffersContent } from '@/lib/live-edit/offers-page'
import { readOffersPageContent, writeOffersPageContent } from '@/lib/live-edit/offers-persist'

/**
 * Storage seam for the offers-page CMS — mirrors `HomepageRepository`.
 *
 * Today: JSON file via `offers-persist.ts`.
 * Later (admin / DB): implement the same interface and swap the binding below;
 * the shell, drawer, and public page stay unchanged.
 */
export type OffersPageRepository = {
  read: () => Promise<OffersPageContent>
  write: (content: OffersPageContent) => Promise<OffersPageContent>
}

export const fileOffersPageRepository: OffersPageRepository = {
  async read() {
    return readOffersPageContent()
  },
  async write(content) {
    const next = ensureOffersContent(content)
    await writeOffersPageContent(next)
    return next
  },
}

/** Active backend — change only this binding when moving to admin DB. */
export const offersPageRepository: OffersPageRepository = fileOffersPageRepository
