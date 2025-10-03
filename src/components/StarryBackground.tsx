'use client'

export default function StarryBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="stars opacity-40" />
      <div className="stars2 opacity-30" />
      <div className="stars3 opacity-20" />
    </div>
  )
}