import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'cream' | 'white';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'cream', className = '' }) => {
  const bg = variant === 'white' ? 'bg-[#F9F8F5]' : 'bg-[#ECEAE3]';

  return (
    <div
      className={`${bg} border border-[#292A27]/10 rounded-[1.75rem] p-6 md:p-8 shadow-sm transition-all ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
