'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ComplaintCategory } from '@prisma/client'

const CATEGORIES: {
  value: ComplaintCategory
  label: string
  icon: string
  subCategories: string[]
}[] = [
  {
    value: 'FURNITURE',
    label: 'Furniture',
    icon: 'fa-chair',
    subCategories: ['Wardrobe', 'Table', 'Windows'],
  },
  {
    value: 'PLUMBING',
    label: 'Plumbing',
    icon: 'fa-shower',
    subCategories: ['WC', 'Wash Hand Basin', 'Drainage', 'Tap & Shower'],
  },
  {
    value: 'ELECTRICITY',
    label: 'Electricity',
    icon: 'fa-bolt',
    subCategories: ['Socket', 'Fan', 'Main Light', 'Reading Light', 'Air Conditioner'],
  },
  {
    value: 'WELDING',
    label: 'Welding',
    icon: 'fa-wrench',
    subCategories: ['Doors', 'Iron Bunk'],
  },
  {
    value: 'OTHERS',
    label: 'Others',
    icon: 'fa-box',
    subCategories: ['Other'],
  },
]

export default function NewComplaintPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    block: '',
    roomNumber: '',
    category: '' as ComplaintCategory | '',
    subCategory: '',
    photoUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ complaintId: string } | null>(null)

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setUploadError('')
    setForm((prev) => ({ ...prev, photoUrl: '' }))

    // Upload to Cloudinary via our API route
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm((prev) => ({ ...prev, photoUrl: data.url }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
      setPhotoFile(null)
      setPhotoPreview(null)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setUploadError('')
    setForm((prev) => ({ ...prev, photoUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => {
      if (name === 'category') {
        return { ...prev, category: value as ComplaintCategory, subCategory: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          block: Number(form.block),
          photoUrl: form.photoUrl || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg =
          data.details
            ? Object.values(data.details).flat().join(', ')
            : data.error || 'Failed to submit complaint'
        setError(msg)
        return
      }

      setSuccess({ complaintId: data.complaint.complaintId })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#0D1F3C] mb-2">Complaint Submitted!</h2>
        <p className="text-gray-500 text-sm mb-4">
          Your complaint has been received. Keep your tracking ID safe.
        </p>
        <div className="inline-block bg-[#0D1F3C] text-amber-400 font-mono text-xl font-bold px-6 py-3 rounded-xl mb-8 shadow-lg">
          {success.complaintId}
        </div>
        <p className="text-xs text-gray-400 mb-8">
          Use this ID to track your complaint status at any time.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard/complaints')}
            className="bg-[#0D1F3C] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#112240] transition-colors"
          >
            View My Complaints
          </button>
          <button
            onClick={() => {
              setSuccess(null)
              setForm({ title: '', description: '', block: '', roomNumber: '', category: '', subCategory: '', photoUrl: '' })
              setPhotoFile(null)
              setPhotoPreview(null)
              setUploadError('')
            }}
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0D1F3C] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-[#0D1F3C]">New Complaint</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below. A unique tracking ID will be generated upon submission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Complaint Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="complaint-title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Broken wardrobe door in my room"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="complaint-description"
                name="description"
                required
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the problem in detail..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Hostel Block <span className="text-red-500">*</span>
              </label>
              <input
                id="complaint-block"
                name="block"
                type="number"
                required
                min={1}
                max={100}
                value={form.block}
                onChange={handleChange}
                placeholder="e.g. 3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Enter block number (1–100)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                id="complaint-room"
                name="roomNumber"
                type="text"
                required
                value={form.roomNumber}
                onChange={handleChange}
                placeholder="e.g. 14B"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Category
          </h2>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    category: cat.value,
                    subCategory: '',
                  }))
                }
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.category === cat.value
                    ? 'border-[#0D1F3C] bg-[#0D1F3C]/5 text-[#0D1F3C]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${cat.icon} text-xl`} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Subcategory */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-subcategory"
                name="subCategory"
                required
                value={form.subCategory}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition-all bg-white"
              >
                <option value="">Select subcategory...</option>
                {selectedCategory.subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Photo <span className="font-normal text-gray-400 normal-case">(optional)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Take a photo or upload from your gallery. Max size 10MB.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="complaint-photo"
            name="photoFile"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Preview or picker */}
          {photoPreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full max-h-56 object-cover rounded-xl border border-gray-200"
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-xl gap-2">
                  <svg className="w-6 h-6 animate-spin text-[#0D1F3C]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs text-[#0D1F3C] font-medium">Uploading…</span>
                </div>
              )}
              {!uploadingPhoto && form.photoUrl && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 left-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50 transition-colors"
                title="Remove photo"
              >
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl py-8 text-gray-400 hover:border-[#0D1F3C] hover:text-[#0D1F3C] hover:bg-[#0D1F3C]/5 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Tap to take a photo or choose from gallery</p>
                <p className="text-xs mt-0.5">JPG, PNG, WEBP up to 10MB</p>
              </div>
            </button>
          )}

          {uploadError && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {uploadError}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="submit-complaint-btn"
          type="submit"
          disabled={submitting || !form.category || !form.subCategory || uploadingPhoto}
          className="w-full bg-[#0D1F3C] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#112240] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Complaint'
          )}
        </button>
      </form>
    </div>
  )
}
