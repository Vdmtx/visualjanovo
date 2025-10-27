
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-[#001D2D] to-[#010D12] border border-primary-cyan/20 rounded-xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
};
