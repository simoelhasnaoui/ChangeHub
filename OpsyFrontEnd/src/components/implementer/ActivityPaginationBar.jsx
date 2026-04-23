import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * @param {{ current_page: number, last_page: number, total?: number } | null} meta
 */
export default function ActivityPaginationBar({ meta, loading, onPrev, onNext }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: page, last_page: last } = meta

  return (
    <div className="flex items-center justify-between gap-4 pt-6 mt-2 border-t border-white/5">
      <button
        type="button"
        disabled={loading || page <= 1}
        onClick={onPrev}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:border-primary/30 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} className="opacity-60" />
        Précédent
      </button>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/50 tabular-nums">
        Page {page} / {last}
      </span>
      <button
        type="button"
        disabled={loading || page >= last}
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:border-primary/30 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Suivant
        <ChevronRight size={16} className="opacity-60" />
      </button>
    </div>
  )
}
