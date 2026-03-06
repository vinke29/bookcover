'use client'

import { BookInfo } from '@/lib/types'

interface Props {
  bookInfo: BookInfo
  onChange: (info: BookInfo) => void
  onGenerate: () => void
  onImageUpload: (url: string) => void
  isGenerating: boolean
  error: string | null
}

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
  'Historical Fiction', 'Horror', 'Literary Fiction', 'Young Adult',
  'Non-Fiction', 'Biography', 'Self-Help', 'Cozy Mystery', 'Adventure',
]

const MOODS = [
  'Dark & Mysterious', 'Epic & Grand', 'Romantic & Soft', 'Tense & Thrilling',
  'Whimsical & Magical', 'Gritty & Raw', 'Peaceful & Serene', 'Nostalgic & Melancholic',
  'Hopeful & Uplifting', 'Cold & Dystopian',
]

const inputClass =
  'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'

export default function DescriptionPanel({ bookInfo, onChange, onGenerate, onImageUpload, isGenerating, error }: Props) {
  const set = (key: keyof BookInfo, value: string) => onChange({ ...bookInfo, [key]: value })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onImageUpload(url)
    e.target.value = '' // reset so same file can be re-selected
  }

  return (
    <aside className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-y-auto shrink-0">
      <div className="p-5 flex-1 space-y-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Book Details</p>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Book Title <span className="text-zinc-600">*</span></label>
          <input
            value={bookInfo.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. The Shadow Protocol"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Author Name</label>
          <input
            value={bookInfo.author}
            onChange={e => set('author', e.target.value)}
            placeholder="e.g. Jane Smith"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Genre <span className="text-zinc-600">*</span></label>
          <select
            value={bookInfo.genre}
            onChange={e => set('genre', e.target.value)}
            className={inputClass}
          >
            <option value="">Select a genre...</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Mood / Tone</label>
          <select
            value={bookInfo.mood}
            onChange={e => set('mood', e.target.value)}
            className={inputClass}
          >
            <option value="">Select a mood...</option>
            {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            Description / Blurb
            <span className="text-zinc-600 font-normal ml-1">(helps the AI)</span>
          </label>
          <textarea
            value={bookInfo.blurb}
            onChange={e => set('blurb', e.target.value)}
            placeholder="A few sentences about your book's story, setting, or themes. The more detail, the better the cover."
            rows={5}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}
      </div>

      <div className="p-5 border-t border-zinc-800 space-y-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating...
            </>
          ) : 'Generate Cover'}
        </button>

        {/* Upload own image */}
        <label className="w-full py-2 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm rounded-md transition-colors cursor-pointer">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </aside>
  )
}
