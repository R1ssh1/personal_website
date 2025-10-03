'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
    const [emailCopied, setEmailCopied] = useState(false)

    const copyEmail = () => {
        navigator.clipboard.writeText('rishijha2025@gmail.com')
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
    }

    const contactMethods = [
        {
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
            title: 'GitHub',
            description: 'Check out my projects and contributions',
            value: 'R1ssh1',
            link: 'https://github.com/R1ssh1',
            action: 'View Profile'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            title: 'LinkedIn',
            description: 'Connect with me professionally',
            value: 'Rishi Jha',
            link: 'https://www.linkedin.com/in/rishi-jha-85b52b250/',
            action: 'Connect'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Email',
            description: 'Send me a message directly',
            value: 'rishijha2025@gmail.com',
            action: emailCopied ? 'Copied!' : 'Copy Email',
            onClick: copyEmail
        }
    ]

    return (
        <div className="min-h-screen pt-32 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        Let&apos;s Connect
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        I&apos;m always excited to collaborate on interesting projects, discuss new technologies,
                        or simply chat about software development. Let&apos;s build something amazing together!
                    </p>
                </motion.div>

                {/* Contact Methods */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {contactMethods.map((method, index) => (
                        <motion.div
                            key={method.title}
                            className="bg-secondary/50 rounded-xl p-6 hover:bg-secondary/70 transition-all duration-300 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex justify-center mb-4 text-accent">
                                {method.icon}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{method.title}</h3>
                            <p className="text-muted-foreground mb-3">{method.description}</p>
                            <p className="text-foreground font-medium mb-4">{method.value}</p>

                            {method.link ? (
                                <a
                                    href={method.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-all duration-300 font-medium"
                                >
                                    {method.action}
                                </a>
                            ) : (
                                <button
                                    onClick={method.onClick}
                                    className={`inline-block px-4 py-2 rounded-lg transition-all duration-300 font-medium ${emailCopied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-accent hover:bg-accent/90 text-white'
                                        }`}
                                >
                                    {method.action}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <motion.div
                    className="text-center bg-accent/5 rounded-xl p-8 border border-accent/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3 className="text-2xl font-bold text-foreground mb-4">Open to Opportunities</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Currently pursuing my Computer Science degree and actively seeking internships,
                        collaborative projects, and learning opportunities. I&apos;m particularly interested in
                        full-stack development, modern web technologies, and innovative problem-solving.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Full-Stack', 'AI/ML'].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium border border-accent/20"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}