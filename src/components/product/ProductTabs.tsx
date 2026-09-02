'use client'

import { useState } from 'react'
import type { ProductDetail, Review, QaItem } from '@/data/productDetail'

export type ProductTab = 'spec' | 'desc' | 'rev' | 'qa'

type Tab = ProductTab

function formatToday() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProductTabs({
  product,
  tab,
  onTabChange,
}: {
  product: ProductDetail
  tab: Tab
  onTabChange: (tab: Tab) => void
}) {
  const [reviews, setReviews] = useState<Review[]>(product.reviews ?? [])
  const [qaList, setQaList] = useState<QaItem[]>(product.qa ?? [])

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHoverRating, setReviewHoverRating] = useState(0)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewErrors, setReviewErrors] = useState<{ name?: string; rating?: string; body?: string }>({})

  const [qaModalOpen, setQaModalOpen] = useState(false)
  const [qaName, setQaName] = useState('')
  const [qaQuestion, setQaQuestion] = useState('')
  const [qaErrors, setQaErrors] = useState<{ name?: string; question?: string }>({})

  const resetReviewForm = () => {
    setReviewName('')
    setReviewRating(0)
    setReviewHoverRating(0)
    setReviewBody('')
    setReviewErrors({})
  }

  const resetQaForm = () => {
    setQaName('')
    setQaQuestion('')
    setQaErrors({})
  }

  const submitReview = () => {
    const errors: typeof reviewErrors = {}
    if (!reviewName.trim()) errors.name = 'Please enter your name'
    if (reviewRating < 1) errors.rating = 'Please select a rating'
    if (reviewBody.trim().length < 25) errors.body = 'Review must be at least 25 characters'
    if (Object.keys(errors).length) {
      setReviewErrors(errors)
      return
    }
    setReviews((prev) => [{ name: reviewName.trim(), date: formatToday(), rating: reviewRating, body: reviewBody.trim() }, ...prev])
    resetReviewForm()
    setReviewModalOpen(false)
  }

  const submitQuestion = () => {
    const errors: typeof qaErrors = {}
    if (!qaName.trim()) errors.name = 'Please enter your name'
    if (qaQuestion.trim().length < 10) errors.question = 'Question must be at least 10 characters'
    if (Object.keys(errors).length) {
      setQaErrors(errors)
      return
    }
    setQaList((prev) => [{ question: qaQuestion.trim(), askedBy: qaName.trim(), askedDate: formatToday(), answer: '' }, ...prev])
    resetQaForm()
    setQaModalOpen(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'spec', label: 'Specifications' },
    { id: 'desc', label: 'Description' },
    { id: 'rev', label: 'Reviews' },
    { id: 'qa', label: 'Q&A' },
  ]

  return (
    <div id="tabs" className="flex flex-col h-full">
      <div className="flex w-full md:inline-flex md:w-auto md:self-start gap-1 bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)] mb-5 overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex flex-1 md:flex-none md:shrink-0 items-center justify-center px-2.5 py-1.5 md:h-10 md:py-0 md:px-4 rounded-full text-[12px] md:text-[13px] font-semibold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.id ? 'bg-[#d92128] text-white' : 'text-gray-600 hover:bg-[#d92128]/10 hover:text-[#d92128]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white border-[1.5px] border-gray-100 rounded-[35px] p-5 md:p-6">
        {tab === 'spec' && (
          <div>
            <h3 className="text-[16px] font-normal text-gray-900 mb-2.5 tracking-wider">
              Product <strong className="font-bold">Specifications</strong>
            </h3>
            <span className="block text-[13px] font-bold text-[#d92128] pt-4 pb-1.5">{product.brand} Specification</span>
            <table className="w-full border-collapse">
              <tbody>
                {product.specGroups.map((group) => (
                  <tr key={group.label} className="border-b border-gray-100 last:border-none align-top">
                    <td className="w-[38%] py-2.5 pr-3 text-[13px] font-semibold text-gray-800">{group.label}</td>
                    <td className="py-2.5 text-[13px] text-gray-600">
                      {group.lines.map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < group.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'desc' && (
          <div className="prose-sm max-w-none text-gray-700">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{product.descriptionTitle}</h2>
            <p className="text-[14px] leading-[1.7] mb-4">{product.descriptionParagraph}</p>
            {(product.descriptionSections ?? []).map((sec) => (
              <div key={sec.heading} className="mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{sec.heading}</h3>
                <ul className="list-disc pl-5 space-y-1 text-[14px] leading-[1.6]">
                  {sec.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'rev' && (
          <div>
            <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="text-center">
                <div className="text-[52px] font-black text-gray-900 leading-none">{avgRating.toFixed(0)}</div>
                <span className="block text-[22px] text-[#ffc107] my-1 tracking-tighter">
                  {'★'.repeat(Math.round(avgRating))}
                </span>
                <span className="text-[12px] text-gray-400">Reviews ({reviews.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="shrink-0 bg-[#d32f2f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#b71c1c] transition-colors cursor-pointer"
              >
                Write a Review
              </button>
            </div>
            {reviews.map((r, i) => (
              <div key={i} className="border-[1.5px] border-gray-100 rounded-2xl p-4 mb-3 last:mb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[38px] h-[38px] rounded-full bg-[#eef1ff] text-[#d92128] font-bold flex items-center justify-center shrink-0">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900">{r.name}</div>
                      <div className="text-[11px] text-gray-400">{r.date}</div>
                    </div>
                  </div>
                  <span className="text-[#ffc107] text-[13px] tracking-tighter">{'★'.repeat(r.rating)}</span>
                </div>
                <div className="text-[13px] text-gray-600">{r.body}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'qa' && (
          <div>
            <div className="flex items-center justify-end mb-4">
              <button
                type="button"
                onClick={() => setQaModalOpen(true)}
                className="shrink-0 bg-[#d32f2f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#b71c1c] transition-colors cursor-pointer"
              >
                Ask a Question
              </button>
            </div>
            {qaList.map((item, i) => (
              <div key={i} className="border-b border-gray-100 last:border-none pb-4 mb-4 last:pb-0 last:mb-0">
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[#f3f4f6] text-gray-700 text-[12px] font-bold flex items-center justify-center">
                    Q
                  </span>
                  <div>
                    <div className="text-[13px] text-gray-800">{item.question}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Asked by {item.askedBy} · {item.askedDate}
                    </div>
                  </div>
                </div>
                {item.answer ? (
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-[#d92128] text-white text-[12px] font-bold flex items-center justify-center">
                      A
                    </span>
                    <div>
                      <div className="text-[13px] text-gray-800">{item.answer}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Answered by Product Team</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[12px] text-gray-400 italic pl-8">Awaiting an answer from our team.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewModalOpen && (
        <div
          onClick={() => setReviewModalOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <span className="mi text-[18px]">rate_review</span>
                </span>
                <h3 className="text-[16px] font-bold text-gray-900">Write a Review</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="mi text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Your Name <span className="text-[#d32f2f]">*</span>
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => {
                    setReviewName(e.target.value)
                    setReviewErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-gray-400"
                />
                {reviewErrors.name && <p className="text-[11px] text-[#d32f2f] mt-1">{reviewErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Rating <span className="text-[#d32f2f]">*</span>
                </label>
                <div className="flex gap-1" onMouseLeave={() => setReviewHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setReviewRating(n)
                        setReviewErrors((prev) => ({ ...prev, rating: undefined }))
                      }}
                      onMouseEnter={() => setReviewHoverRating(n)}
                      aria-label={`${n} star`}
                      className="text-[26px] leading-none cursor-pointer"
                    >
                      <span className={n <= (reviewHoverRating || reviewRating) ? 'text-[#ffc107]' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                </div>
                {reviewErrors.rating && <p className="text-[11px] text-[#d32f2f] mt-1">{reviewErrors.rating}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Your Review <span className="text-[#d32f2f]">*</span>
                </label>
                <textarea
                  value={reviewBody}
                  onChange={(e) => {
                    setReviewBody(e.target.value)
                    setReviewErrors((prev) => ({ ...prev, body: undefined }))
                  }}
                  placeholder="Write your review (min 25 characters)"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-gray-400 resize-none"
                />
                {reviewErrors.body && <p className="text-[11px] text-[#d32f2f] mt-1">{reviewErrors.body}</p>}
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={submitReview}
                  className="flex-1 bg-[#d32f2f] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#b71c1c] transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetReviewForm()
                    setReviewModalOpen(false)
                  }}
                  className="border border-gray-200 text-gray-700 text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {qaModalOpen && (
        <div
          onClick={() => setQaModalOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-700 flex items-center justify-center shrink-0">
                  <span className="mi text-[18px]">help</span>
                </span>
                <h3 className="text-[16px] font-bold text-gray-900">Ask a Question</h3>
              </div>
              <button
                type="button"
                onClick={() => setQaModalOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="mi text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Your Name <span className="text-[#d32f2f]">*</span>
                </label>
                <input
                  type="text"
                  value={qaName}
                  onChange={(e) => {
                    setQaName(e.target.value)
                    setQaErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-gray-400"
                />
                {qaErrors.name && <p className="text-[11px] text-[#d32f2f] mt-1">{qaErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Your Question <span className="text-[#d32f2f]">*</span>
                </label>
                <textarea
                  value={qaQuestion}
                  onChange={(e) => {
                    setQaQuestion(e.target.value)
                    setQaErrors((prev) => ({ ...prev, question: undefined }))
                  }}
                  placeholder="Write your question (min 10 characters)"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-gray-400 resize-none"
                />
                {qaErrors.question && <p className="text-[11px] text-[#d32f2f] mt-1">{qaErrors.question}</p>}
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={submitQuestion}
                  className="flex-1 bg-[#d32f2f] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#b71c1c] transition-colors cursor-pointer"
                >
                  Submit Question
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetQaForm()
                    setQaModalOpen(false)
                  }}
                  className="border border-gray-200 text-gray-700 text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
