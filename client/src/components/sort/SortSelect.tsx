import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const sortOptions = [
  { id: 'alpha', label: 'Alphabetical', field: 'title', type: 'string' },
  { id: 'likes', label: 'Most Liked', field: 'likes_count', type: 'number' },
  { id: 'follows', label: 'Most Followed', field: 'follows_count', type: 'number' },
  { id: 'watches', label: 'Most Watched', field: 'watches_count', type: 'number' },
  { id: 'created', label: 'Date Created', field: 'created_at', type: 'date' },
  { id: 'updated', label: 'Last Updated', field: 'updated_at', type: 'date' }
];

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SortSelect({ value, onValueChange, className = "" }: SortSelectProps) {
  // Find the current option to display its label
  const currentOption = sortOptions.find(opt => opt.id === value);
  
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`${className} ${value ? 'text-blue-600 font-medium' : ''}`}>
        <SelectValue placeholder="Sort by...">
          {currentOption ? currentOption.label : 'Sort by...'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map(option => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 