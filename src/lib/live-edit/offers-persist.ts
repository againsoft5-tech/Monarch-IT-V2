import { promises as fs } from 'fs'
import path from 'path'
import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import { ensureOffersContent } from '@/lib/live-edit/offers-page'
import seed from '@/data/offers-page.json'

/**
 * File-backed offers-page CMS (dev / self-contained).
 * Prefer importing `offersPageRepository` from `offers-repository.ts` in app code
 * so a future admin/DB adapter can replace this without touching UI.
 */
const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'offers-page.json')

export async function readOffersPageContent(): Promise<OffersPageContent> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return ensureOffersContent(JSON.parse(raw) as OffersPageContent)
  } catch {
    // Bundled fallback for read-only filesystems.
    return ensureOffersContent(seed as OffersPageContent)
  }
}

export async function writeOffersPageContent(content: OffersPageContent): Promise<void> {
  const next = ensureOffersContent(content)
  await fs.writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
}
