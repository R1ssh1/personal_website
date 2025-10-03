'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { Certification } from '@/types'
import { getImageUrl } from '@/lib/image-utils'

interface CertificateModalProps {
  certification: Certification | null
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ certification, isOpen, onClose }: CertificateModalProps) {
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-morphism rounded-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <div className="p-6">
                {/* Certificate Image */}
                <div className="relative mb-6">
                  <div
                    className="relative aspect-[4/3] w-full cursor-pointer rounded-xl overflow-hidden"
                    onClick={handleImageClick}
                  >
                    <Image
                      src={getImageUrl(certification.imageUrl)}
                      alt={certification.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Click to expand indicator */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                      <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
                        🔍 Click to view fullscreen
                      </div>
                    </div>

                    {/* Expiration badge */}
                    {isExpired && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                        Expired
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-2">
                      {certification.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                      <div>
                        <span className="font-medium text-text">Issuer:</span> {certification.issuer}
                      </div>

                      <div>
                        <span className="font-medium text-text">Issued:</span> {formatDate(certification.issueDate)}
                      </div>

                      {certification.expirationDate && (
                        <div className={isExpired ? 'text-red-400' : ''}>
                          <span className="font-medium text-text">
                            {isExpired ? 'Expired:' : 'Expires:'}
                          </span> {formatDate(certification.expirationDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text mb-2">Description</h3>
                    <p className="text-muted leading-relaxed">{certification.description}</p>
                  </div>

                  {/* Tags */}
                  {certification.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-text mb-2">Skills & Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {certification.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Link */}
                  {certification.verificationLink && (
                    <div>
                      <h3 className="font-semibold text-text mb-2">Verification</h3>
                      <a
                        href={certification.verificationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Verify Certificate
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
                className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeFullscreen}
              >
                <button
                  onClick={closeFullscreen}
                  className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  aria-label="Close fullscreen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <motion.div
                  className="relative max-w-7xl max-h-full w-full h-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.3 }}
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