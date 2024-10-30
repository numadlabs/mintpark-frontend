import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonLgProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
  isLoading?: boolean;
}

const ButtonLg = ({
  children,
  isSelected,
  isLoading = false,
  className = '',
  disabled,
  ...rest
}: ButtonLgProps) => {
  return (
    <button
      className={`
        relative py-3 px-4 w-full rounded-xl text-lg font-semibold
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-50
        ${isSelected 
          ? 'bg-brand text-neutral600' 
          : 'bg-neutral500 text-neutral600'
        }
        ${isLoading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={!isSelected || isLoading || disabled}
      {...rest}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : ''}`}>
        {children}
      </span>
      
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
    </button>
  );
};

export default ButtonLg;