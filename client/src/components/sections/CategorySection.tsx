import type React from "react"

interface CategorySectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CategorySection({ title, children, className = '' }: CategorySectionProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded p-3 ${className}`}>
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div className="w-full">{children}</div>
    </div>
  );
}

