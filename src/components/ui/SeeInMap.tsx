/** Outlined pill that opens one branch in Google Maps. Used on Contact Us and Outlets. */
export default function SeeInMap({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 h-[30px] md:h-[32px] px-3.5 rounded-full border border-white/85 text-white text-[11.5px] md:text-[12.5px] no-underline transition-colors hover:bg-white hover:text-[#d32f2f]"
    >
      <span className="mi text-[15px] md:text-[16px]">near_me</span>
      <span className="whitespace-nowrap">See in Map</span>
      <span className="sr-only">&mdash; {label}</span>
    </a>
  )
}
