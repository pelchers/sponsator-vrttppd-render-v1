import type React from "react"

interface CategorySectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function CategorySection({ title, children, className = '' }: CategorySectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

