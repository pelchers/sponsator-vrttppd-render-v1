interface InteractionCountProps {
  count: number;
  icon: React.ReactNode;
  className?: string;
}

export function InteractionCount({ count, icon, className = "" }: InteractionCountProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      {icon}
      <span>{formatCount(count)}</span>
    </div>
  );
} 