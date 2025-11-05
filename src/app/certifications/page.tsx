'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Certification } from '@/types'
import { CertificateCard } from '@/components/CertificateCard'
import { CertificateModal } from '@/components/CertificateModal'

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
      <div className="min-h-screen relative">
        <div className="relative z-10 pt-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
              <p className="text-muted">Loading certifications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="relative z-10 pt-32 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="glass-morphism p-8 max-w-md mx-auto border border-red-500/20">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchCertifications}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen relative">
        <div className="relative z-10 pt-32 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="font-logo text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6">
                Certifications
              </h1>
              <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
                Professional certifications and credentials that validate my expertise
                in various technologies and domains.
              </p>

              {certifications.length > 0 && (
                <div className="mt-8">
                  <span className="inline-block glass-morphism px-6 py-3 rounded-full text-accent font-medium border border-accent/20">
                    {certifications.length} {certifications.length === 1 ? 'Certification' : 'Certifications'}
                  </span>
                </div>
              )}
            </div>

            {/* Certifications Grid */}
            {certifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass-morphism rounded-2xl p-12 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/20">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-text mb-3">No Certifications Yet</h2>
                  <p className="text-muted">
                    Certifications will appear here once they are added to the portfolio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {certifications.map((certification) => (
                  <div key={certification.id}>
                    <CertificateCard
                      certification={certification}
                      onClick={() => handleCertificateClick(certification)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Bottom spacing */}
            <div className="py-16" />
          </div>
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