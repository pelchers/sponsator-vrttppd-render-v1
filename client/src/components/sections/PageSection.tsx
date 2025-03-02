import type React from "react"

interface PageSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function PageSection({ title, children, className = "" }: PageSectionProps) {
  return (
    <section className={`mb-8 bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{title}</h2>
      {children}
    </section>
  )
}

