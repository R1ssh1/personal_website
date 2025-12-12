'use client'

import CodeTypingChallenge from '@/components/playground/CodeTypingChallenge'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CodeTypingChallengePage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/sandbox"
          className="inline-flex items-center space-x-2 text-white/60 hover:text-sky-400 transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to Sandbox</span>
        </Link>

        {/* Glass Container - 75% minimum width */}
        <motion.div 
          className="w-full min-h-[75vh] bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CodeTypingChallenge />
        </motion.div>
      </div>
    </div>
  )
}