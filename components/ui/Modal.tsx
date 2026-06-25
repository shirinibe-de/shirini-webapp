'use client'

import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div
        className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b border-white/20 px-6 py-5">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/50 hover:text-white text-2xl leading-none transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="px-6 py-5 text-indigo-100">{children}</div>

        {footer && <div className="border-t border-white/20 px-6 py-4 bg-white/5">{footer}</div>}
      </div>

      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </div>
  )
}
