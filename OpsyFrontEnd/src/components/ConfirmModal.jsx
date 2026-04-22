import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmation requise',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = true,
}) {
  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          onClick={onCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0F051E]/90 backdrop-blur-xl" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#150522] border border-white/10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.8)] max-w-sm w-full overflow-hidden"
          >
            {/* Decorative Glow */}
            <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${
              danger ? 'bg-rose-500/10' : 'bg-primary/10'
            }`} />

            <div className="p-8 space-y-6 relative z-10">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  danger
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-primary/10 border-primary/20 text-primary'
                }`}>
                  <AlertTriangle size={24} />
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-3">
                <h3 className="text-lg font-light text-white uppercase tracking-wide leading-none">
                  {title}
                </h3>
                <p className="text-[11px] text-[#B5A1C2]/50 font-medium leading-relaxed max-w-xs mx-auto">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 py-4 text-[#B5A1C2] hover:text-white font-black uppercase tracking-widest text-[10px] transition-all rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.03] active:scale-[0.97]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg ${
                    danger
                      ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-400'
                      : 'bg-primary text-[#0F051E] shadow-primary/20 hover:bg-primary/90'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
