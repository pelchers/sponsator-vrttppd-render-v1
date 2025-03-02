import type React from "react"

interface CategorySectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function CategorySection({ title, children, className = "" }: CategorySectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {title && <h3 className="text-lg font-medium mb-3 text-gray-700">{title}</h3>}
      {children}
    </div>
  )
}

