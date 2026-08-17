import Link from 'next/link'

type Props = {
  open: boolean
  message: string
  onClose: () => void
}

export default function SuccessModal({ open, message, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-[340px]">
        <div className="relative bg-[#FDB913] rounded-[28px] pt-16 pb-8 px-6 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[#2B2B55] text-white flex items-center justify-center shadow-md hover:bg-[#1e1e40] transition-colors cursor-pointer"
          >
            <span className="mi text-[18px]">close</span>
          </button>

          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-[#1BB55C] flex items-center justify-center">
              <span className="mi text-white text-[32px] font-black leading-none">check</span>
            </div>
          </div>

          <h2 className="text-center text-[26px] font-extrabold text-[#1B1B3A] mb-4">Success!</h2>

          <div className="bg-white rounded-2xl px-4 py-4 mb-6 min-h-[80px] flex items-center justify-center">
            <p className="text-center text-[13.5px] leading-[1.6] text-gray-700 m-0">{message}</p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/checkout"
              onClick={onClose}
              className="bg-[#e8262f] text-white font-bold text-[14px] px-10 py-2.5 rounded-full shadow-md hover:bg-[#c81f27] transition-colors cursor-pointer no-underline"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
