'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { GlareHover } from '@/components/reactbits/GlareHover'

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Hero />

      {/* Quick Links Section */}
      <section className="relative z-20 py-16 px-4 max-w-6xl mx-auto -mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          <Link href="/about" className="group">
            <GlareHover intensity="medium" className="glass-morphism p-6 rounded-xl group-hover:bg-accent/10 transition-all duration-150">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-accent transition-colors">About</h3>
              <p className="text-muted text-sm leading-relaxed">
                Learn more about my background and interests
              </p>
            </GlareHover>
          </Link>
          <Link href="/projects" className="group">
            <GlareHover intensity="medium" className="glass-morphism p-6 rounded-xl group-hover:bg-accent/10 transition-all duration-150">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-accent transition-colors">Projects</h3>
              <p className="text-muted text-sm leading-relaxed">
                Explore my latest projects and technical work
              </p>
            </GlareHover>
          </Link>





          <Link href="/certifications" className="group">
            <GlareHover intensity="medium" className="glass-morphism p-6 rounded-xl group-hover:bg-accent/10 transition-all duration-150">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-accent transition-colors">Certifications</h3>
              <p className="text-muted text-sm leading-relaxed">
                Professional credentials and expertise validation
              </p>
            </GlareHover>
          </Link>


          <Link href="/mind-palace" className="group">
            <GlareHover intensity="medium" className="glass-morphism p-6 rounded-xl group-hover:bg-accent/10 transition-all duration-150">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-accent transition-colors">Mind Palace</h3>
              <p className="text-muted text-sm leading-relaxed">
                My thoughts, ideas, and creative musings
              </p>
            </GlareHover>
          </Link>
          <Link href="/sandbox" className="group">
            <GlareHover intensity="medium" className="glass-morphism p-6 rounded-xl group-hover:bg-accent/10 transition-all duration-150">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-accent transition-colors">The Sandbox</h3>
              <p className="text-muted text-sm leading-relaxed">
                Interactive experiments, games, and creative tools
              </p>
            </GlareHover>
          </Link>
        </div>
      </section>
    </div>
  )
}
