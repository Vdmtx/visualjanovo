
import React from 'react';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'light';
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary-cyan',
    light: 'text-light-text',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-t-4 ${colorClasses[color]} border-opacity-20 ${sizeClasses[size]} ${className}`}></div>
  );
};
