import { Button } from "@/components/ui/button";

interface SortOrderProps {
  order: 'asc' | 'desc';
  onChange: (order: 'asc' | 'desc') => void;
  className?: string;
}

// Simple arrow SVG icons
const ArrowUpIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className="h-4 w-4"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className="h-4 w-4"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export function SortOrder({ order, onChange, className = "" }: SortOrderProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onChange(order === 'asc' ? 'desc' : 'asc')}
      className={className}
    >
      {order === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
    </Button>
  );
} 