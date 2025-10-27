
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-light-text mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full p-3 rounded-lg bg-dark-background-start border ${
          error ? 'border-red-500' : 'border-primary-cyan'
        } text-light-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-purple ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
