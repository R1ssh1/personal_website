'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { ShinyText } from '@/components/reactbits/ShinyText'
import { StarBorder } from '@/components/reactbits/StarBorder'

export function Hero() {
  const [emailCopied, setEmailCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  // Mouse tracking values for magnetic effect and rotation
  const githubX = useSpring(0, { stiffness: 150, damping: 15 })
  const githubY = useSpring(0, { stiffness: 150, damping: 15 })
  const githubRotation = useSpring(0, { stiffness: 200, damping: 20 })

  const linkedinX = useSpring(0, { stiffness: 150, damping: 15 })
  const linkedinY = useSpring(0, { stiffness: 150, damping: 15 })
  const linkedinRotation = useSpring(0, { stiffness: 200, damping: 20 })

  const emailX = useSpring(0, { stiffness: 150, damping: 15 })
  const emailY = useSpring(0, { stiffness: 150, damping: 15 })
  const emailRotation = useSpring(0, { stiffness: 200, damping: 20 })

  // Velocity tracking refs
  const prevMouseX = useRef(0)
  const prevMouseY = useRef(0)
  const lastUpdateTime = useRef(Date.now())

  // Enhanced magnetic following with velocity-based rotation
  const handleMouseMove = (event: React.MouseEvent, springX: any, springY: any, rotationSpring: any) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseXPos = event.clientX - centerX
    const mouseYPos = event.clientY - centerY

    // Calculate mouse velocity
    const currentTime = Date.now()
    const deltaTime = Math.max(currentTime - lastUpdateTime.current, 1)
    const velocityX = (event.clientX - prevMouseX.current) / deltaTime * 1000
    const velocityY = (event.clientY - prevMouseY.current) / deltaTime * 1000

    // Calculate rotation using cross product for direction (negated for correct rotation)
    const rotationVelocity = -(velocityX * mouseYPos - velocityY * mouseXPos)
    const rotationIntensity = Math.abs(rotationVelocity) * 0.1 // Increased multiplier for more rotation
    const rotationDirection = rotationVelocity > 0 ? 1 : -1

    // Apply magnetic attraction
    const strength = 0.4
    springX.set(mouseXPos * strength)
    springY.set(mouseYPos * strength)

    // Apply velocity-based rotation (allow full 360+ degrees)
    rotationSpring.set(rotationDirection * rotationIntensity)

    // Update tracking values
    prevMouseX.current = event.clientX
    prevMouseY.current = event.clientY
    lastUpdateTime.current = currentTime
  }

  const handleMouseLeave = (springX: any, springY: any, rotationSpring: any) => {
    springX.set(0)
    springY.set(0)
    rotationSpring.set(0)
  }

  return (
    <motion.section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-4 pt-20 relative overflow-hidden"
    >
      <motion.div
        className="max-w-4xl mx-auto text-center"
        style={{ y, opacity }}
      >
        <div>
          <h1
            className="text-5xl md:text-7xl font-bold text-text mb-6 leading-tight cursor-default relative"
          >
            <span>
              Hi, I&apos;m{' '}
            </span>
            <motion.span
              className="text-accent inline-block relative"
              whileHover={{
                scale: 1.05,
                y: -2
              }}
            >
              <ShinyText text="Rishi Jha" className="text-accent" pulseInterval={10000} />
            </motion.span>
          </h1>

          <div
            className="relative h-1 w-40 mx-auto mb-8 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/80 to-white/50"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          <p
            className="text-xl md:text-2xl text-muted mb-8 font-medium"
          >
            Computer Science Student & Software Developer
          </p>

          <p
            className="text-lg text-muted mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Passionate about building innovative solutions and exploring the latest technologies.
            Currently in my 4th year of Computer Science, with a focus on full-stack development
            and modern web technologies.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              <StarBorder speed={6}>
                <Link
                  href="/projects"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent via-blue-600 to-purple-600 text-white rounded-xl transition-all duration-500 font-semibold shadow-xl hover:shadow-accent/40 overflow-hidden transform-gpu"
                >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-accent opacity-0 group-hover:opacity-100"
                  initial={{ scale: 1.5, opacity: 0 }}
                  whileHover={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut"
                    }
                  }}
                />

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-70 transition-opacity duration-500" />

                <span className="relative z-10 flex items-center justify-center gap-3 text-center">
                  <motion.span
                    className="font-semibold tracking-wide"
                  >
                    View My Projects
                  </motion.span>
                  <motion.span
                    animate={{
                      x: [0, 4, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    whileHover={{
                      x: 6,
                      rotate: 15,
                      scale: 1.1
                    }}
                    className="inline-flex items-center justify-center"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 drop-shadow-sm"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.span>
                </span>
              </Link>
              </StarBorder>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              <Link
                href="/about"
                className="group relative inline-flex items-center justify-center px-8 py-4 glass-morphism text-text hover:text-white border border-secondary/30 hover:border-accent/50 rounded-xl transition-all duration-500 font-semibold backdrop-blur-sm overflow-hidden transform-gpu"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent/80 to-purple-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn More About Me
                  </motion.span>
                  <motion.span
                    whileHover={{
                      x: 4,
                      scale: 1.1
                    }}
                    className="inline-flex items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.span>
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Social icons with magnetic attraction and velocity-based rotation */}
          <div
            className="flex justify-center space-x-8"
          >
            {/* GitHub Icon */}
            <motion.a
              href="https://github.com/R1ssh1"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-4 glass-morphism hover:glass-morphism-hover text-muted hover:text-accent transition-all duration-500 rounded-xl border border-secondary/20 hover:border-accent/40 backdrop-blur-sm overflow-hidden cursor-pointer"
              aria-label="GitHub"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8, rotateX: -45 },
                visible: { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }}
              whileHover={{
                scale: 1.15,
                y: -4,
                boxShadow: "0 15px 35px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseMove={(e) => handleMouseMove(e, githubX, githubY, githubRotation)}
              onMouseLeave={() => handleMouseLeave(githubX, githubY, githubRotation)}
              style={{ x: githubX, y: githubY }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent/30 to-purple-600/30 rounded-xl opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />

              <motion.svg
                className="relative z-10 w-7 h-7"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ rotate: githubRotation }}
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </motion.svg>
            </motion.a>

            {/* LinkedIn Icon */}
            <motion.a
              href="https://www.linkedin.com/in/rishi-jha-85b52b250/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-4 glass-morphism hover:glass-morphism-hover text-muted hover:text-blue-500 transition-all duration-500 rounded-xl border border-secondary/20 hover:border-blue-500/40 backdrop-blur-sm overflow-hidden cursor-pointer"
              aria-label="LinkedIn"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8, rotateX: -45 },
                visible: { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }}
              whileHover={{
                scale: 1.15,
                y: -4,
                boxShadow: "0 15px 35px rgba(59, 130, 246, 0.2)"
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseMove={(e) => handleMouseMove(e, linkedinX, linkedinY, linkedinRotation)}
              onMouseLeave={() => handleMouseLeave(linkedinX, linkedinY, linkedinRotation)}
              style={{ x: linkedinX, y: linkedinY }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-xl opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />

              <motion.svg
                className="relative z-10 w-7 h-7"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ rotate: linkedinRotation }}
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </motion.svg>
            </motion.a>

            {/* Email Icon */}
            <motion.button
              className="group relative p-4 glass-morphism hover:glass-morphism-hover text-muted hover:text-green-500 transition-all duration-500 rounded-xl border border-secondary/20 hover:border-green-500/40 backdrop-blur-sm overflow-hidden cursor-pointer"
              aria-label="Copy email to clipboard"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8, rotateX: -45 },
                visible: { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }}
              whileHover={{
                scale: 1.15,
                y: -4,
                boxShadow: "0 15px 35px rgba(34, 197, 94, 0.2)"
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseMove={(e) => handleMouseMove(e, emailX, emailY, emailRotation)}
              onMouseLeave={() => handleMouseLeave(emailX, emailY, emailRotation)}
              style={{ x: emailX, y: emailY }}
              onClick={async () => {
                try {
                  if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText('rishi.sk.j@gmail.com')
                  } else {
                    const textArea = document.createElement('textarea')
                    textArea.value = 'rishi.sk.j@gmail.com'
                    textArea.style.position = 'fixed'
                    textArea.style.left = '-999999px'
                    textArea.style.top = '-999999px'
                    document.body.appendChild(textArea)
                    textArea.focus()
                    textArea.select()
                    document.execCommand('copy')
                    textArea.remove()
                  }
                  setEmailCopied(true)
                  setTimeout(() => setEmailCopied(false), 2000)
                } catch (err) {
                  console.error('Failed to copy email:', err)
                }
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />

              <motion.svg
                className="relative z-10 w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ rotate: emailRotation }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </motion.svg>
            </motion.button>
          </div>

          {/* Email copied notification */}
          {emailCopied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
              }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-morphism text-text px-6 py-3 rounded-2xl shadow-2xl z-50 border border-accent/20 backdrop-blur-md"
            >
              <motion.div
                className="flex items-center space-x-2"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span className="font-medium">Email copied to clipboard!</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.section>
  )
}