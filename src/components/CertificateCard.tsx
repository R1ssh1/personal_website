'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Certification } from '@/types'
import { getImageUrl } from '@/lib/image-utils'

interface CertificateCardProps {
  certification: Certification
  onClick: () => void
}

export function CertificateCard({ certification, onClick }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const isExpired = certification.expirationDate && new Date(certification.expirationDate) < new Date()

  return (
    <motion.div
      className="relative group cursor-pointer bg-secondary/20 rounded-xl overflow-hidden aspect-[4/3]"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Certificate Image */}
      <div className="relative w-full h-full">
        <Image
          src={getImageUrl(certification.imageUrl)}
          alt={certification.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="text-center p-6 max-w-full">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
              {certification.title}
            </h3>

            <div className="text-gray-400">
              Issued: <span className="text-white">{formatDate(certification.issueDate)}</span>
            </div>
          </div>
        </motion.div>

        {/* Expiration indicator */}
        {isExpired && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Expired
          </div>
        )}
      </div>
    </motion.div>
  )
}