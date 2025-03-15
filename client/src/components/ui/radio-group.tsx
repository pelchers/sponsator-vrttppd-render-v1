import React, { InputHTMLAttributes } from 'react';

export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

export interface RadioGroupItemProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  id: string;
  className?: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  className = '',
  ...props
}) => {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}; 