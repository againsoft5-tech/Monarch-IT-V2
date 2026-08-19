import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LIVE_EDIT_COOKIE, isValidLiveEditToken } from '@/lib/live-edit/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/website/live-edit/home') ||
    pathname.startsWith('/website/live-edit/offers')
  ) {
    const token = req.cookies.get(LIVE_EDIT_COOKIE)?.value
    if (!isValidLiveEditToken(token)) {
      const url = req.nextUrl.clone()
      url.pathname = '/website/live-edit'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/website/live-edit/home',
    '/website/live-edit/home/:path*',
    '/website/live-edit/offers',
    '/website/live-edit/offers/:path*',
  ],
}
