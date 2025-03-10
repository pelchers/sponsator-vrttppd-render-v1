interface FilterOption {
  id: string;
  label: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterGroup({ 
  title, 
  options, 
  selected, 
  onChange 
}: FilterGroupProps) {
  const handleChange = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter(item => item !== id)
      : [...selected, id];
    
    onChange(newSelected.length ? newSelected : [options[0].id]); // Default to 'all' if nothing selected
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => handleChange(option.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 