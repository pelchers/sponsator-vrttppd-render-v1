import type React from "react"
interface PageSectionProps {
  title: string
  children: React.ReactNode
}

export default function PageSection({ title, children }: PageSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

