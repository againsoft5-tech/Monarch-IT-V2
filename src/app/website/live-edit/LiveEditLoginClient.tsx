'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

/** Shown on login UI — must match server defaults in `lib/live-edit/auth.ts` unless env overrides. */
const DEMO_USER = 'liveedit'
const DEMO_PASS = 'monarch123'

export default function LiveEditLoginClient() {
  const router = useRouter()
  const search = useSearchParams()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/live-edit/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      })
      if (!res.ok) {
        setError('Invalid credentials. Please try again.')
        return
      }
      const next = search.get('next') || '/website/live-edit/home'
      router.push(next)
      router.refresh()
    } catch {
      setError('Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[400px] rounded-none border border-[#e5e5e5] bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/image/catalog/website/logo/monarch-it-logo.png"
            alt="Monarch IT"
            width={160}
            height={44}
            className="h-10 w-auto object-contain"
          />
        </div>
        <h1 className="m-0 mb-1 text-center text-xl font-bold text-gray-900">Live Edit</h1>
        <p className="mb-6 text-center text-[13px] text-gray-500">
          Sign in with demo credentials to edit homepage sections on the storefront.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="le-user" className="mb-1.5 block text-[13px] font-semibold text-gray-700">
              Username
            </label>
            <input
              id="le-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="h-[42px] w-full rounded-none border border-gray-200 px-4 text-[14px] outline-none focus:border-gray-400"
              placeholder={DEMO_USER}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="le-pass" className="mb-1.5 block text-[13px] font-semibold text-gray-700">
              Password
            </label>
            <input
              id="le-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[42px] w-full rounded-none border border-gray-200 px-4 text-[14px] outline-none focus:border-gray-400"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="m-0 text-[12.5px] text-[#bd2026]">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-[42px] w-full cursor-pointer rounded-none bg-[#bd2026] text-[14px] font-semibold text-white hover:bg-[#a5121c] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Enter live editor'}
          </button>
        </form>
        <p className="mt-5 text-center text-[11.5px] text-gray-400">
          Demo: {DEMO_USER} / {DEMO_PASS}
        </p>
      </div>
    </div>
  )
}
