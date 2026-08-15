import { Suspense } from 'react'
import LiveEditLoginClient from './LiveEditLoginClient'

export default function LiveEditLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading…</div>}>
      <LiveEditLoginClient />
    </Suspense>
  )
}
