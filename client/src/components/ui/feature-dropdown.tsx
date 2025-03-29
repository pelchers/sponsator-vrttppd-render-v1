import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FeatureDropdownProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
}

export function FeatureDropdown({ title, emoji, children }: FeatureDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-250"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-white/5 rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
} 