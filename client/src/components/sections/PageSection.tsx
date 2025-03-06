import type React from "react"

interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function PageSection({ title, children, className = '' }: PageSectionProps) {
  return (
    <section className={`mb-4 ${className}`}>
      {title && (
        <h2 className="text-sm font-medium mb-3">{title}</h2>
      )}
      {children}
    </section>
  );
}

