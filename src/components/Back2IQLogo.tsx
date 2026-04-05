import React from 'react';

interface Back2IQLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

const Back2IQLogo: React.FC<Back2IQLogoProps> = ({ size = 'md', showSlogan = false }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const sloganClasses = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-sm',
  };

  return (
    <div className="flex flex-col">
      <span
        className={`${sizeClasses[size]} font-extrabold tracking-tight leading-none`}
        style={{ letterSpacing: '-0.03em', fontFamily: "'Inter', sans-serif" }}
      >
        Back2<span style={{ color: '#38bdf8' }}>IQ</span>
      </span>
      {showSlogan && (
        <span
          className={`${sloganClasses[size]} font-semibold uppercase tracking-[0.2em] leading-tight mt-0.5`}
          style={{ color: '#38bdf8' }}
        >
          Ahead by Design
        </span>
      )}
    </div>
  );
};

export default Back2IQLogo;
