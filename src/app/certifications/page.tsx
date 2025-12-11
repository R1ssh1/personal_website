'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Certification } from '@/types'
import { CertificateCard } from '@/components/CertificateCard'
import { CertificateModal } from '@/components/CertificateModal'

// Tint colors for variety - cycles through certifications
const tintColors = [
  'rgba(139, 92, 246, 0.15)',  // Purple
  'rgba(59, 130, 246, 0.15)',  // Blue
  'rgba(16, 185, 129, 0.15)',  // Green
  'rgba(245, 158, 11, 0.15)',  // Amber
  'rgba(236, 72, 153, 0.15)',  // Pink
  'rgba(6, 182, 212, 0.15)',   // Cyan
]

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/certifications')
      if (!response.ok) {
        throw new Error('Failed to fetch certifications')
      }
      const data = await response.json()

      // Ensure data is an array
      if (Array.isArray(data)) {
        setCertifications(data)
      } else if (data && typeof data === 'object' && data.certifications && Array.isArray(data.certifications)) {
        // Handle case where API returns { certifications: [...] }
        setCertifications(data.certifications)
      } else {
        console.error('Unexpected data format:', data)
        setCertifications([])
      }
    } catch (error) {
      console.error('Error fetching certifications:', error)
      setError('Failed to load certifications')
      setCertifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCertificateClick = (certification: Certification) => {
    setSelectedCertification(certification)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCertification(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white/60">Loading certifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="glass-morphism p-8 max-w-md mx-auto border border-red-500/20 rounded-2xl">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchCertifications}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-medium border border-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Certifications
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Professional certifications and credentials that validate my expertise
              in various technologies and domains.
            </p>
          </motion.div>

          {/* Certifications Grid */}
          {certifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="glass-morphism rounded-2xl p-12 max-w-md mx-auto border border-white/10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">No Certifications Yet</h2>
                <p className="text-white/60">
                  Certifications will appear here once they are added to the portfolio.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {certifications.map((certification, index) => (
                <CertificateCard
                  key={certification.id}
                  certification={certification}
                  onClick={() => handleCertificateClick(certification)}
                  tintColor={tintColors[index % tintColors.length]}
                />
              ))}
            </motion.div>
          )}

          {/* Bottom spacing */}
          <div className="py-16" />
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        certification={selectedCertification}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  )
}