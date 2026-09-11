import React from 'react';

interface InstitutionalStripeProps {
  className?: string;
  height?: string;
}

export const InstitutionalStripe: React.FC<InstitutionalStripeProps> = ({
  className = '',
  height = 'h-1.5',
}) => {
  return (
    <div
      id="institutional-stripe"
      className={`w-full flex ${height} overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="flex-1 bg-[#E62382]" title="Gebalis Magenta" />
      <div className="flex-1 bg-[#379C8D]" title="Gebalis Turquesa" />
      <div className="flex-1 bg-[#8CBD45]" title="Gebalis Verde" />
    </div>
  );
};
