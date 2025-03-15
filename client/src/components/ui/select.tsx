import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  placeholder = 'Select an option',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
            children: child.props.children || (
              <SelectValue placeholder={placeholder} value={value} />
            )
          });
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return open ? React.cloneElement(child, {
            onSelect: (val: string) => {
              onValueChange(val);
              setOpen(false);
            },
            value
          }) : null;
        }
        return child;
      })}
    </div>
  );
};

interface SelectTriggerProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = '',
  onClick,
  id
}) => {
  return (
    <button
      type="button"
      id={id}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      onClick={onClick}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
  value?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  value,
  className = ''
}) => {
  return (
    <span className={`block truncate ${!value ? 'text-gray-400' : ''} ${className}`}>
      {value || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  value?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = '',
  onSelect,
  value
}) => {
  return (
    <div className={`absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg ${className}`}>
      <div className="py-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect,
              selected: value === child.props.value
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  onSelect?: (value: string) => void;
  selected?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  className = '',
  onSelect,
  selected
}) => {
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selected ? 'bg-gray-100' : ''} ${className}`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}; 