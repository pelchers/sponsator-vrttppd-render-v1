import React from "react";

interface SectionFullProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionFull({ children, className = "" }: SectionFullProps) {
  return (
    <section className={`w-full ${className}`}>
      {children}
    </section>
  );
} 