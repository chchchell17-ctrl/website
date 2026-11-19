import React from 'react';
import { GraduationCap, School, Users } from 'lucide-react';
import type { PortalType } from '../../types/auth.ts';
import { PortalCard } from './PortalCard.tsx';

interface PortalSelectionProps {
  onSelectPortal: (portal: PortalType) => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal }) => {
  return (
    <section
      aria-labelledby="portal-heading"
      className="w-full max-w-5xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2
          id="portal-heading"
          className="font-[var(--font-display)] text-xl sm:text-2xl font-bold tracking-wide uppercase casper-sub-halo"
        >
          <span className="text-[#0369A1]">WHO&apos;S </span>
          <span className="text-[#7E22CE]">ENTERING </span>
          <span className="text-[#15803D]">TODAY?</span>
        </h2>
        <p className="mt-1 inline-block rounded-full bg-white/72 backdrop-blur-sm border border-white/85 px-3.5 py-0.5 text-xs sm:text-sm font-bold text-[#0E4A73] shadow-xs">
          Choose your portal to continue.
        </p>
      </div>

      {/* Side-by-side equal cards on desktop/tablet, stacked vertically on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        <PortalCard
          portal="student"
          kicker="STUDENT PORTAL"
          title="STUDENT LOGIN"
          description="Ready to become a Junior Detective?"
          icon={GraduationCap}
          onSelect={onSelectPortal}
        />

        <PortalCard
          portal="teacher"
          kicker="TEACHER PORTAL"
          title="TEACHER LOGIN"
          description="Access your Teacher Control Centre."
          icon={School}
          onSelect={onSelectPortal}
        />

        <PortalCard
          portal="parent"
          kicker="PARENT PORTAL"
          title="PARENT LOGIN"
          description="See your child's learning progress."
          icon={Users}
          onSelect={onSelectPortal}
        />
      </div>
    </section>
  );
};
