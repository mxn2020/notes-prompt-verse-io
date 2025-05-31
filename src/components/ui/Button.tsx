import React, { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = twMerge(
    'btn',
    `btn-${variant}`,
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isLoading || disabled ? 'opacity-70 cursor-not-allowed' : '',
    className
  );

  return (
    <button
      className={baseClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm\" color={variant === 'outline' || variant === 'ghost' ? 'neutral-600' : 'white'} />
          <span>{children}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center space-x-2">
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </span>
      )}
    </button>
  );
};

export default Button;