import type React from "react"

interface PageSectionProps {
  title: string
  children: React.ReactNode
}

export default function PageSection({ title, children }: PageSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

