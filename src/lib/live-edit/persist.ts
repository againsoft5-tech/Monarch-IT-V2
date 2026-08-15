import { promises as fs } from 'fs'
import path from 'path'
import type { HomepageContent } from '@/lib/live-edit/homepage'
import { ensureLayout } from '@/lib/live-edit/layout-actions'
import seed from '@/data/homepage.json'

/**
 * File-backed homepage CMS (dev / self-contained).
 * Prefer importing `homepageRepository` from `content-repository.ts` in app code
 * so a future admin/DB adapter can replace this without touching UI.
 */
const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'homepage.json')

export async function readHomepageContent(): Promise<HomepageContent> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return ensureLayout(JSON.parse(raw) as HomepageContent)
  } catch {
    return ensureLayout(seed as HomepageContent)
  }
}

export async function writeHomepageContent(content: HomepageContent): Promise<void> {
  const next = ensureLayout(content)
  await fs.writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
}
