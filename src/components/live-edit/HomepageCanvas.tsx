'use client'

import type { ReactNode } from 'react'
import type { HomepageContent, HomepageSectionType, LayoutBlock } from '@/lib/live-edit/homepage'
import { isPrimaryId } from '@/lib/live-edit/homepage'
import { resolveSectionData } from '@/lib/live-edit/layout-actions'
import { LiveEditSection, type LayoutActionName } from '@/components/live-edit/LiveEditSection'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryCarousel from '@/components/home/CategoryCarousel'
import PromoBanner from '@/components/home/PromoBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BrandSlider from '@/components/home/BrandSlider'
import DreamPcBanner from '@/components/home/DreamPcBanner'
import AboutBox from '@/components/home/AboutBox'
import SupportSection from '@/components/home/SupportSection'
import type { HeroSliderDB } from '@/lib/heroSliderStore'

type Props = {
  content: HomepageContent
  liveEdit?: boolean
  locked?: boolean
  selectedId?: string | null
  onSelect?: (id: string) => void
  onAction?: (action: LayoutActionName, sectionId: string, sectionType: HomepageSectionType) => void
}

function renderBlock(
  content: HomepageContent,
  block: LayoutBlock,
): ReactNode {
  const data = resolveSectionData(content, block)

  switch (block.type) {
    case 'hero': {
      const hero = (isPrimaryId(block.id, 'hero') ? content.hero : data) as HomepageContent['hero']
      return <HeroSlider data={hero as unknown as HeroSliderDB} />
    }
    case 'categories': {
      const cats = (isPrimaryId(block.id, 'categories')
        ? content.categories
        : (data as HomepageContent['categories'])) ?? content.categories
      const items = (cats.items ?? []).filter((i) => !i.hidden)
      return <CategoryCarousel items={items} />
    }
    case 'promo': {
      const promo = (isPrimaryId(block.id, 'promo') ? content.promo : data) as HomepageContent['promo']
      if (promo && promo.enabled === false) return null
      return (
        <PromoBanner
          data={{
            left: promo?.left ?? [],
            right: promo?.right ?? [],
          }}
        />
      )
    }
    case 'featured': {
      const featured = (isPrimaryId(block.id, 'featured')
        ? content.featured
        : (data as HomepageContent['featured'])) ?? content.featured
      return (
        <FeaturedProducts
          title={featured.title}
          subtitle={featured.subtitle}
          categoryIds={featured.categoryIds}
        />
      )
    }
    case 'dream_pc': {
      const dream = (isPrimaryId(block.id, 'dream_pc')
        ? content.dreamPc
        : (data as HomepageContent['dreamPc'])) ?? content.dreamPc
      return (
        <DreamPcBanner
          image={dream.image}
          href={dream.href}
          line1={dream.line1}
          line2={dream.line2}
        />
      )
    }
    case 'brands': {
      const brands = (isPrimaryId(block.id, 'brands')
        ? content.brands
        : (data as HomepageContent['brands'])) ?? content.brands
      return (
        <BrandSlider title={brands.title} subtitle={brands.subtitle} items={brands.items} />
      )
    }
    case 'about': {
      const about = (isPrimaryId(block.id, 'about')
        ? content.about
        : (data as HomepageContent['about'])) ?? content.about
      return (
        <AboutBox title={about.title} subtitle={about.subtitle} bodyHtml={about.bodyHtml} />
      )
    }
    case 'support': {
      const support = (isPrimaryId(block.id, 'support')
        ? content.support
        : (data as HomepageContent['support'])) ?? content.support
      return (
        <SupportSection
          title={support.title}
          subtitle={support.subtitle}
          phone={support.phone}
          whatsapp={support.whatsapp}
          hours={support.hours}
          storeLabel={support.storeLabel}
          storeHref={support.storeHref}
        />
      )
    }
    default:
      return null
  }
}

export default function HomepageCanvas({
  content,
  liveEdit = false,
  locked = false,
  selectedId = null,
  onSelect,
  onAction,
}: Props) {
  return (
    <>
      {content.layout.map((block) => {
        if (block.hidden && !liveEdit) return null
        const inner = renderBlock(content, block)
        if (!inner) return null
        return (
          <LiveEditSection
            key={block.id}
            sectionId={block.id}
            sectionType={block.type}
            liveEdit={liveEdit}
            locked={locked}
            selected={selectedId === block.id}
            hidden={Boolean(block.hidden)}
            onSelect={onSelect}
            onAction={onAction}
          >
            {inner}
          </LiveEditSection>
        )
      })}
    </>
  )
}
