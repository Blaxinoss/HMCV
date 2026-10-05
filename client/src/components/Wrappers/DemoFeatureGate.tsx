import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { features } from '../../config/features';

interface DemoFeatureGateProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  variant?: 'panel' | 'control';
}

const DemoFeatureGate: React.FC<DemoFeatureGateProps> = ({
  children,
  label = 'Available in the full version',
  className = '',
  variant = 'panel',
}) => {
  if (!features.demoMode) {
    return <>{children}</>;
  }

  const isControl = variant === 'control';

  return (
    <div className={`relative isolate ${isControl ? 'inline-flex' : ''} ${className}`}>
      <div className={`pointer-events-none select-none ${isControl ? 'opacity-35' : 'blur-[2px] opacity-45'}`} aria-hidden="true">
        {children}
      </div>
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center bg-gray-950/70 backdrop-blur-[1px] ${isControl ? 'rounded-xl' : 'rounded-2xl'}`}
        title={label}
      >
        <div className={`flex items-center text-amber-300 ${isControl ? 'gap-1 px-2 text-xs font-bold' : 'gap-3 rounded-xl border border-amber-400/30 bg-gray-950/90 px-5 py-4 shadow-2xl'}`}>
          <LockKeyhole className={isControl ? 'h-4 w-4' : 'h-6 w-6'} />
          <span>{isControl ? 'Demo' : label}</span>
        </div>
      </div>
    </div>
  );
};

export default DemoFeatureGate;
