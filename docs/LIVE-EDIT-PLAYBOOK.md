# Live Edit Playbook (portable)

> **For agents / other projects:** Follow this file end-to-end to recreate the same live editor.
> Do not invent a parallel system. Mirror Monarch-IT-V2 patterns below.

Self-contained **section + chrome live editing** for a Next.js storefront — works **without** an ERP admin today, and stays compatible when homepage/chrome later load from **admin / database**.

Reference implementation: `Monarch-IT-V2` (`src/lib/live-edit/*`, `src/components/live-edit/*`).

---

## 1. Goal

| Who | What |
|-----|------|
| Editor | Opens `/website/live-edit`, logs in, edits the **real** homepage + header/footer/side menu, Saves |
| Public | `/` (and site chrome) reads the **same** CMS payload |
| Future admin | Same JSON shape + repository interface — swap file storage for API/DB |

**Hard rules**

1. **One content contract** (`HomepageContent`) drives public site + live editor.
2. **Presentational components take props** — no hardcoded section copy when CMS fields exist.
3. **Stable IDs for catalog links** (`categoryId`, `brandId`, …) so admin DB can replace demo selects later.
4. **Persist only via `homepageRepository`** — never write JSON from random call sites.
5. **Device preview must use a real viewport** (iframe) — CSS width alone does **not** trigger Tailwind `md:` breakpoints.
6. **Auth is cookie + middleware** — never enable editing with a bare `?liveEdit=1` query.
7. **Lock / unlock must sync parent → iframe reliably** — stale `locked: true` makes hero links navigate instead of select (see §15).

---

## 2. URL map

| Path | Purpose |
|------|---------|
| `/website/live-edit` | Demo login |
| `/website/live-edit/home` | Editor shell (auth) — toolbar + iframe + drawers |
| `/website/live-edit/home/preview` | **Iframe document** (auth) — real media queries |
| `/` | Public homepage → `HomepageCanvas` (no editor chrome) |
| `GET/POST /api/live-edit/homepage` | Read / authenticated write |
| `POST /api/live-edit/login` · `logout` · `GET session` | Auth |

Skip storefront Header/Footer/SideMenu for `/website/live-edit/*` (preview re-renders them inside the iframe).

---

## 3. Demo credentials

Defaults:

- User: `liveedit`
- Pass: `monarch123`

```bash
LIVE_EDIT_USER=liveedit
LIVE_EDIT_PASS=monarch123
LIVE_EDIT_SECRET=change-me-in-production
```

---

## 4. Folder checklist (copy / recreate)

```
src/
  data/homepage.json
  lib/live-edit/
    auth.ts
    homepage.ts                 # types + SECTION_TYPES / labels
    layout-actions.ts           # move/dup/hide/delete/add + ensureLayout
    persist.ts                  # file read/write (low-level)
    content-repository.ts       # ★ HomepageRepository seam (file → DB)
    draft-sync.ts               # parent ↔ iframe postMessage + sessionStorage
    site-chrome.ts              # DEFAULT_HEADER / FOOTER / SIDE_MENU
    demo-categories.ts          # select options (+ categoryId)
    demo-brands.ts              # select options (+ brandId)
    featured-products.ts        # categoryId → product list resolver
  components/live-edit/
    LiveEditShell.tsx           # host: toolbar + iframe + drawers + backdrop
    LiveEditPreviewDocument.tsx # iframe body: chrome + canvas + link guard
    LiveEditSection.tsx         # section outline + centered action bar
    LiveEditChrome.tsx          # chrome outline (header/footer)
    HomepageCanvas.tsx          # layout[] → components
    drawers/
      DrawerHeader.tsx          # ★ shared: ← Back + title + × Close
      HeroDrawer.tsx
      CategoriesDrawer.tsx
      PromoDrawer.tsx
      FeaturedDrawer.tsx
      DreamPcDrawer.tsx
      BrandsDrawer.tsx
      HeaderDrawer.tsx
      FooterDrawer.tsx
      SideMenuDrawer.tsx
      SectionsNavDrawer.tsx     # ★ collapsible chrome + page groups
      SimpleFieldsDrawer.tsx
  components/layout/
    Header.tsx · MobileHeader.tsx · Footer.tsx · SideMenu.tsx
      → accept optional `data` props from CMS
    StorefrontChrome.tsx
      → skip chrome on /website/live-edit/* ; pass header/footer/sideMenu on public
  app/
    page.tsx
    layout.tsx
    website/live-edit/page.tsx
    website/live-edit/home/page.tsx
    website/live-edit/home/preview/page.tsx
    api/live-edit/{login,logout,session,homepage}/route.ts
  middleware.ts
docs/
  LIVE-EDIT-PLAYBOOK.md
```

---

## 5. Data contract (`HomepageContent`)

```ts
{
  layout: { id: string; type: HomepageSectionType; hidden?: boolean }[]

  // Body sections (reorderable via layout)
  hero, categories, promo, featured, dreamPc, brands, about, support

  // Site chrome (NOT in layout reorder list — edit via chrome drawers)
  header, footer, sideMenu

  blocks?: Record<string, unknown>  // duplicated section instances
}
```

### Rules

| Rule | Detail |
|------|--------|
| Primary id | `id === type` (e.g. `hero`) |
| Duplicates | `id = type_xxxx`, payload in `blocks[id]` |
| Hidden | Public skips `hidden: true`; editor shows faded |
| Foreign keys | Prefer `categoryId` / `brandId` on rows; denormalize `name`/`img`/`href` for offline render |
| Chrome | `header` / `footer` / `sideMenu` always present (defaults via `ensureLayout` + `site-chrome.ts`) |

### Section → drawer map (Monarch)

| Type / chrome | Drawer | Notes |
|---------------|--------|--------|
| `hero` | HeroDrawer | Slides: image, logo, title, link, drag/dup/hide, fill·fit |
| `categories` | CategoriesDrawer | Demo category select + sortable rows |
| `promo` | PromoDrawer | Left/right slides: image + copy + link |
| `featured` | FeaturedDrawer | Title/subtitle + `categoryIds[]` → products |
| `dream_pc` | DreamPcDrawer | Image, lines, link + preview |
| `brands` | BrandsDrawer | Demo brand select + logo/url |
| `about` / `support` | SimpleFieldsDrawer | |
| Header | HeaderDrawer | Logos, search placeholder, CTAs |
| Footer | FooterDrawer | Logo, about, social, links, membership, copyright |
| Side menu | SideMenuDrawer | Icons, href, chat action, mobile order |

Every drawer uses **`DrawerHeader`** with:

- **← Back** → always returns to `SectionsNavDrawer` (not only when opened from Sections)
- **× Close** → dismiss drawer only (does not reopen Sections)

---

## 6. Storage seam (file today → admin/DB tomorrow)

```ts
// content-repository.ts
export type HomepageRepository = {
  read: () => Promise<HomepageContent>
  write: (content: HomepageContent) => Promise<HomepageContent>
}

export const homepageRepository: HomepageRepository = fileHomepageRepository
// Later: = adminApiHomepageRepository or prismaHomepageRepository
```

**When wiring admin/DB later**

1. Keep **exact** `HomepageContent` JSON (or versioned migrations).
2. Implement `HomepageRepository.read/write` against admin API or DB.
3. Point `homepageRepository` at the new adapter.
4. Replace `demo-categories.ts` / `demo-brands.ts` fetches with admin catalog endpoints — drawers already use `categoryId` / `brandId`.
5. **Do not** rewrite LiveEditShell / HomepageCanvas / drawers for storage.

---

## 7. Architecture (runtime)

```
LiveEditShell (parent)
  ├─ toolbar (icon+text except device buttons)
  │     Save · Editing/Locked · Sections · [Desktop|Tablet|Mobile icons] · View site · Logout
  ├─ iframe → /website/live-edit/home/preview
  │     LiveEditPreviewDocument
  │       document click-capture: block <a> navigation when unlocked
  │       SideMenu / Header / MobileHeader
  │       HomepageCanvas + LiveEditSection (centered action bar)
  │       Footer via LiveEditChrome
  ├─ backdrop (click outside → dismiss panels)
  └─ drawers / SectionsNavDrawer (z above backdrop)
```

**Draft sync:** `draft-sync.ts`

| Channel | Role |
|---------|------|
| `postMessage` parent → iframe | **Source of truth** for draft + meta (including lock) |
| `sessionStorage` | Draft content only; **never persist `locked: true`** |
| `BroadcastChannel` | Optional; prefer postMessage-only in iframe to avoid stale races |

Parent pushes `{ type: 'draft', content, meta }` with monotonic **`meta.syncId`**.  
Iframe **ignores** messages with `syncId < lastSeen`.  
Preview posts `{ type: 'select' | 'action' | 'chrome' | 'ready' }`.

**Iframe height:** fixed host viewport + scroll **inside** iframe. Do **not** auto-grow from `scrollHeight`.

---

## 8. Wire a new body section

1. Add to `HomepageSectionType`, `SECTION_TYPES`, `SECTION_LABELS`.
2. Add typed payload on `HomepageContent` + seed in `homepage.json`.
3. Normalize in `ensureLayout`.
4. Render in `HomepageCanvas` `switch` (respect `hidden`).
5. Make the UI component accept CMS props (`data` / field props).
6. Add drawer with `DrawerHeader` + `onBack={backToSectionsNav}`; register in `LiveEditShell`.
7. If it references catalog entities, store **`*Id` foreign keys** + use a demo/admin select.
8. Add the section under the correct **page group** in `SectionsNavDrawer` (collapsible).

## 9. Wire site chrome

1. Types + defaults in `homepage.ts` / `site-chrome.ts`.
2. `Header` / `Footer` / `SideMenu` accept `data?: Partial<…>`.
3. Public `layout.tsx` / `StorefrontChrome` pass CMS chrome props.
4. Drawers + preview chrome buttons / `LiveEditChrome`.
5. Chrome is **not** in `layout[]` (listed under **Site chrome** in Sections nav).
6. **No separate toolbar “Side menu” button** — open via Sections → Site chrome (or preview chrome chip).

---

## 10. Section hover toolbar (`LiveEditSection`)

When **unlocked** and hovering / selected a body section, show a dark action bar:

| Action | Meaning |
|--------|---------|
| ↑ ↓ | Move in `layout[]` |
| ⧉ | Duplicate |
| ◉ / ◌ | Toggle hidden |
| edit | Open drawer |
| + | Add section after |
| 🗑 | Delete / hide primary |

**Placement (required):** centered in the section — both horizontal **and** vertical:

```
absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80]
```

Optional small caret under the bar (points at section).

**Keep the wrapper mounted** while `liveEdit={true}` even when `locked` — only disable interaction when locked. Unmounting on lock causes hero `<Link>` navigation bugs after unlock.

**Hero / full-bleed links:** section `onClickCapture` + document-level click capture in preview must `preventDefault` on `<a>` when unlocked so slides do not navigate away.

---

## 11. Sections nav (`SectionsNavDrawer`)

Collapsible groups (pages will grow later):

```
▼ Site chrome          (header · side menu · footer)
▼ Homepage             (layout[] order)
  (future) ▼ Shop / About / … pages
```

- Each group header toggles expand/collapse (chevron).
- Row click → open that chrome/section drawer; **← Back** returns here.
- Default: both chrome + homepage expanded.

---

## 12. Shell toolbar UX

| Control | UI | Behavior |
|---------|-----|----------|
| Save | icon + text (`Save` / `Save *` / `Saving…`) | `POST` homepage |
| Editing / Locked | icon + text | Toggle browse vs edit (see §15) |
| Sections | icon + text | Open `SectionsNavDrawer` (disabled while locked) |
| Desktop / Tablet / Mobile | **icon only** | Set iframe width (`100%` / `768px` / `390px`) |
| View site | icon + text | Link to `/` |
| Logout | icon + text | Clear session |

Square UI: `rounded-none` on buttons.

**Click outside drawer:** semi-transparent backdrop (`z-[75]`, below drawers `z-[80]`, below top toolbar `top-12`) calls `dismissPanels()` — closes drawer + Sections, clears selection.

---

## 13. Toolbar actions (body sections)

`LiveEditSection` → `moveUp` | `moveDown` | `duplicate` | `toggleHidden` | `edit` | `add` | `delete`  
`applyLayoutAction` mutates draft; **Save** → `POST /api/live-edit/homepage` via `homepageRepository.write`.

Primary delete = hide; duplicate clones into `blocks`.

---

## 14. Security

- httpOnly cookie; middleware guards `/website/live-edit/home` and `/preview`.
- Save API rejects unauthenticated POSTs.
- Demo auth = staging / trusted editors; replace IdP for public production.
- Never ship edit mode unlocked by query string alone.

---

## 15. Lock / unlock (critical — copy exactly)

| State | Button label | Preview behavior |
|-------|--------------|------------------|
| Unlocked | **Editing** (`LockOpen`) | Section outlines, centered toolbars, drawers, **no** `<a>` navigation |
| Locked | **Locked** (amber) | Browse like the live site; links work; Sections disabled; drawers closed |

**Implementation rules (bugs we already hit):**

1. Parent owns lock in React state + **`lockedRef`** updated **only** inside the toggle (do **not** do `lockedRef.current = locked` every render — stale renders overwrite a fresh unlock).
2. On toggle, **immediately** `postMessage` draft/meta to the iframe (do not wait only for `useEffect`).
3. Every push includes increasing **`meta.syncId`**; iframe drops older ids.
4. **Do not persist `locked: true` in `sessionStorage`** — always write `locked: false` to session meta; lock is session-of-shell UI only.
5. Iframe: `liveEdit={true}` always on the preview route; pass `locked={meta.locked}` into `LiveEditSection` / `LiveEditChrome`.
6. While unlocked, document `click` capture in preview: `preventDefault` on anchors (except `[data-live-ignore]`).
7. While locked: ignore iframe `select` / `chrome` / `action` messages in the parent.

**Manual test**

1. Unlocked → hover hero → centered bar → click → drawer (must **not** open slide URL).
2. Lock → hero click **does** navigate (or browse).
3. Unlock again → hero click selects again (no navigation).
4. Repeat lock/unlock several times — must stay in sync with button label.

---

## 16. Agent porting checklist (another Next.js site)

Copy this checklist into the task and execute in order:

1. [ ] Create `lib/live-edit` (auth, homepage types, layout-actions, persist, **content-repository**, draft-sync with `syncId`, site-chrome, demo catalogs).
2. [ ] Seed `data/homepage.json` from that site’s current hardcodes (sections + header/footer/sideMenu).
3. [ ] Build `HomepageCanvas` mapping layout → **that site’s** home components (props from CMS).
4. [ ] Build drawers per section; shared **`DrawerHeader`** with Back → Sections; foreign ids for catalogs.
5. [ ] `LiveEditSection` (centered bar + keep wrapper when locked) + `LiveEditChrome` + shell toolbar + **iframe preview**.
6. [ ] `SectionsNavDrawer` with **collapsible** Site chrome + per-page groups.
7. [ ] Lock/unlock per §15; backdrop dismiss; document link guard in preview.
8. [ ] API routes + middleware auth.
9. [ ] Public `/` + root chrome read via `homepageRepository`.
10. [ ] Skip storefront chrome on `/website/live-edit/*`.
11. [ ] Verify: edit → Save → public `/` updates; Mobile device shows mobile chrome (iframe); lock/unlock hero test (§15).
12. [ ] Copy this playbook into the target repo `docs/`.

**Do not**

- Drive public home from a second source of truth while editor uses JSON.
- Use only a CSS-scaled div for device preview (breakpoints won’t match).
- Hardcode section strings after CMS fields exist.
- Store only display labels without ids when an admin catalog will exist later.
- Put a permanent “Side menu” button on the toolbar (use Sections nav).
- Persist lock in sessionStorage or sync `lockedRef` from React state every render.
- Unmount `LiveEditSection` when locked if that drops click-capture after unlock.

---

## 17. Monarch reference

| | |
|--|--|
| Login | http://127.0.0.1:3020/website/live-edit |
| Editor | http://127.0.0.1:3020/website/live-edit/home |
| User / pass | `liveedit` / `monarch123` |

---

## 18. Future admin/DB note (for humans)

When AgainERP / admin owns homepage:

- Admin CRUD writes the same `HomepageContent` (or maps 1:1 into it).
- Live editor either keeps writing through `homepageRepository` → admin API, **or** becomes a thin “preview + deep-link to admin” — prefer keeping live editor writes if UX stays better.
- Catalog selects: `GET /api/admin/categories` etc., same drawer UX.
- Media: replace raw URL fields with media-library picker when available; keep URL string in JSON for render.
- Extra storefront pages: add another collapsible group in `SectionsNavDrawer` + its own content blob / layout array — same drawer + lock patterns.
