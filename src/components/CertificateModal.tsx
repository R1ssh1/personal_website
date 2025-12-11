'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Certification } from '@/types'
import { getImageUrl } from '@/lib/image-utils'

interface CertificateModalProps {
  certification: Certification | null
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ certification, isOpen, onClose }: CertificateModalProps) {
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageFullscreen) {
          setIsImageFullscreen(false)
        } else if (isOpen) {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isImageFullscreen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!certification) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpired = certification.expirationDate && new Date(certification.expirationDate) < new Date()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleImageClick = () => {
    setIsImageFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsImageFullscreen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Main Modal */}
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden glass-morphism rounded-2xl border border-white/10"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Close Button - positioned absolutely at top right of modal */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/10"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto max-h-[90vh] p-6">
                {/* Certificate Image */}
                <div className="relative mb-6">
                  <div
                    className="relative aspect-[4/3] w-full cursor-pointer rounded-xl overflow-hidden border border-white/10"
                    onClick={handleImageClick}
                  >
                    <Image
                      src={getImageUrl(certification.imageUrl)}
                      alt={certification.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {/* Click to expand indicator */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                      <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Click to view fullscreen
                      </div>
                    </div>

                    {/* Expiration badge */}
                    {isExpired && (
                      <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-medium">
                        Expired
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {certification.title}
                    </h2>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium text-white">Issuer:</span>
                        <span>{certification.issuer}</span>
                      </div>

                      <div className="flex items-center gap-2 text-white/70">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-white">Issued:</span>
                        <span>{formatDate(certification.issueDate)}</span>
                      </div>

                      {certification.expirationDate && (
                        <div className={`flex items-center gap-2 ${isExpired ? 'text-red-400' : 'text-white/70'}`}>
                          <svg className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-white">
                            {isExpired ? 'Expired:' : 'Expires:'}
                          </span>
                          <span>{formatDate(certification.expirationDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-morphism rounded-xl p-4 border border-white/10">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Description
                    </h3>
                    <p className="text-white/70 leading-relaxed">{certification.description}</p>
                  </div>

                  {/* Tags */}
                  {certification.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Skills & Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {certification.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white/10 text-white/90 text-sm rounded-full border border-white/10 hover:bg-white/20 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Link */}
                  {certification.verificationLink && (
                    <div className="pt-2">
                      <a
                        href={certification.verificationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl border border-sky-500/30 transition-all duration-300 hover:scale-105 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Verify Certificate
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Fullscreen Image Modal */}
          <AnimatePresence>
            {isImageFullscreen && (
              <motion.div
                className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeFullscreen}
              >
                <button
                  onClick={closeFullscreen}
                  className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/10"
                  aria-label="Close fullscreen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Hint text */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                  Press ESC or click anywhere to close
                </div>

                <motion.div
                  className="relative max-w-7xl max-h-full w-full h-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={getImageUrl(certification.imageUrl)}
                    alt={certification.title}
                    fill
                    className="object-contain"
                    quality={100}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}