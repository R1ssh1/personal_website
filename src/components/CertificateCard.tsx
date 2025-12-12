'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Certification } from '@/types'
import { getImageUrl } from '@/lib/image-utils'

interface CertificateCardProps {
  certification: Certification
  onClick: () => void
  tintColor?: string
}

export function CertificateCard({ certification, onClick, tintColor }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const isExpired = certification.expirationDate && new Date(certification.expirationDate) < new Date()
  const defaultTint = 'rgba(139, 92, 246, 0.1)'
  const cardTint = tintColor || defaultTint

  return (
    <motion.div
      className="relative group cursor-pointer h-full"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="h-full glass-morphism rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-150"
        style={{ background: `linear-gradient(135deg, ${cardTint}, transparent)` }}
      >
        {/* Certificate Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={getImageUrl(certification.imageUrl)}
            alt={certification.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Hover Overlay with Details */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
              {certification.title}
            </h3>
            <p className="text-white/70 text-sm">
              {certification.issuer}
            </p>
            <p className="text-white/50 text-xs mt-1">
              Issued: {formatDate(certification.issueDate)}
            </p>
          </div>

          {/* Expiration Badge */}
          {isExpired && (
            <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Expired
            </div>
          )}

          {/* View indicator */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}