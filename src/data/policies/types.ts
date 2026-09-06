/**
 * Shape shared by the legal/policy pages (privacy, delivery, warranty, refund).
 * Blocks are `p` (paragraph), `b` (bold lead-in or sub-heading), `ul` (bulleted)
 * and `ol` (numbered) — the four the source documents use.
 */
export type Block = { p: string } | { b: string } | { ul: string[] } | { ol: string[] }

export type PolicySection = {
  /** Ordering, anchor id, and the number shown before the heading. */
  n: number
  title: string
  /** Trailing sections such as the warranty disclaimer carry no number. */
  unnumbered?: boolean
  blocks: Block[]
}

export type PolicyDoc = {
  /** Page heading. */
  title: string
  updated: string
  reviewer: string
  reviewerSuffix: string
  /** Paragraphs between the index and the first section; may be empty. */
  intro: string[]
  sections: PolicySection[]
}
