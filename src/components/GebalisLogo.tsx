import React from 'react';

interface GebalisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GebalisLogo: React.FC<GebalisLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const dimensions = {
    sm: { h: 28, markSize: 24, textSize: 'text-lg' },
    md: { h: 36, markSize: 32, textSize: 'text-2xl' },
    lg: { h: 48, markSize: 42, textSize: 'text-3xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="gebalis-logo-brand">
      {/* Brand Icon SVG */}
      <svg
        width={dimensions.markSize}
        height={dimensions.markSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Top-left pill: Magenta */}
        <rect x="8" y="10" width="38" height="38" rx="19" fill="#E62382" />
        {/* Top-right pill: Turquoise */}
        <rect x="54" y="10" width="38" height="38" rx="19" fill="#379C8D" />
        {/* Bottom-left pill: Green */}
        <rect x="8" y="56" width="38" height="38" rx="19" fill="#8CBD45" />
        {/* Bottom-right small accent pill: Graphite with white detail */}
        <rect x="54" y="56" width="38" height="38" rx="19" fill="#181717" />
        <circle cx="73" cy="75" r="7" fill="#FFFFFF" />
      </svg>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <span
          className={`font-display font-extrabold tracking-tight text-[#181717] leading-none ${dimensions.textSize}`}
        >
          GEBALIS
        </span>
        <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-500 mt-0.5 leading-none">
          Lisboa Habitação
        </span>
      </div>
    </div>
  );
};
