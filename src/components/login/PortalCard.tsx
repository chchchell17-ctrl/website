import React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { PortalType } from '../../types/auth.ts';
import { playHoverTick, playPortalOpen } from '../../utils/soundEffects.ts';

interface PortalCardProps {
  portal: PortalType;
  kicker: string;
  title: string;
  description: string;
  icon: LucideIcon;
  onSelect: (portal: PortalType) => void;
}

const PORTAL_THEMES: Record<
  PortalType,
  {
    surface: string;
    border: string;
    glow: string;
    iconBg: string;
    iconColor: string;
    kickerColor: string;
    titleColor: string;
    descColor: string;
    arrowBg: string;
    focusRing: string;
  }
> = {
  student: {
    surface:
      'linear-gradient(155deg, rgba(232, 251, 255, 0.86) 0%, rgba(168, 221, 242, 0.76) 52%, rgba(141, 217, 223, 0.82) 100%)',
    border: 'border-white/90 hover:border-cyan-100',
    glow: 'hover:shadow-[0_22px_44px_-12px_rgba(32,165,198,0.52),inset_0_2px_0_rgba(255,255,255,0.94)]',
    iconBg:
      'bg-gradient-to-b from-white/95 to-sky-100/90 border border-white shadow-[0_8px_18px_-4px_rgba(14,116,144,0.28)] group-hover:from-white group-hover:to-cyan-50',
    iconColor: 'text-[#0284C7] group-hover:text-[#0369A1]',
    kickerColor: 'text-[#0369A1]',
    titleColor: 'text-[#075985]',
    descColor: 'text-[#0C4A6E]',
    arrowBg: 'bg-white/85 text-[#0369A1] group-hover:bg-white group-hover:text-[#0284C7]',
    focusRing: 'focus-visible:ring-4 focus-visible:ring-sky-500/60',
  },
  teacher: {
    surface:
      'linear-gradient(155deg, rgba(240, 254, 234, 0.86) 0%, rgba(197, 233, 139, 0.74) 52%, rgba(154, 216, 138, 0.82) 100%)',
    border: 'border-white/90 hover:border-lime-100',
    glow: 'hover:shadow-[0_22px_44px_-12px_rgba(68,162,74,0.48),inset_0_2px_0_rgba(255,255,255,0.94)]',
    iconBg:
      'bg-gradient-to-b from-white/95 to-emerald-50/90 border border-white shadow-[0_8px_18px_-4px_rgba(22,101,52,0.26)] group-hover:from-white group-hover:to-lime-50',
    iconColor: 'text-[#16A34A] group-hover:text-[#15803D]',
    kickerColor: 'text-[#15803D]',
    titleColor: 'text-[#166534]',
    descColor: 'text-[#14532D]',
    arrowBg: 'bg-white/85 text-[#15803D] group-hover:bg-white group-hover:text-[#16A34A]',
    focusRing: 'focus-visible:ring-4 focus-visible:ring-emerald-500/60',
  },
  parent: {
    surface:
      'linear-gradient(155deg, rgba(250, 244, 255, 0.88) 0%, rgba(220, 204, 245, 0.8) 54%, rgba(245, 213, 230, 0.78) 100%)',
    border: 'border-white/90 hover:border-purple-100',
    glow: 'hover:shadow-[0_22px_44px_-12px_rgba(139,92,196,0.48),inset_0_2px_0_rgba(255,255,255,0.94)]',
    iconBg:
      'bg-gradient-to-b from-white/95 to-purple-50/90 border border-white shadow-[0_8px_18px_-4px_rgba(107,33,168,0.25)] group-hover:from-white group-hover:to-fuchsia-50',
    iconColor: 'text-[#7E22CE] group-hover:text-[#6B21A8]',
    kickerColor: 'text-[#7E22CE]',
    titleColor: 'text-[#581C87]',
    descColor: 'text-[#4C1D95]',
    arrowBg: 'bg-white/85 text-[#6B21A8] group-hover:bg-white group-hover:text-[#7E22CE]',
    focusRing: 'focus-visible:ring-4 focus-visible:ring-purple-500/60',
  },
};

export const PortalCard: React.FC<PortalCardProps> = ({
  portal,
  kicker,
  title,
  description,
  icon: Icon,
  onSelect,
}) => {
  const theme = PORTAL_THEMES[portal];

  return (
    <button
      type="button"
      onMouseEnter={() => playHoverTick()}
      onClick={() => {
        playPortalOpen();
        onSelect(portal);
      }}
      aria-label={`${title} — ${description}`}
      style={{ background: theme.surface }}
      className={`aero-glass-card group w-full h-full rounded-[26px] border ${theme.border} ${theme.glow} ${theme.focusRing} p-5 sm:p-6 flex flex-col items-center text-center justify-between transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.985] focus:outline-none min-h-[210px] sm:min-h-[240px]`}
    >
      {/* Top Kicker Label (unboxed typography, zero pill clutter) */}
      <span
        className={`relative z-10 text-[11px] font-bold tracking-[0.16em] uppercase ${theme.kickerColor}`}
      >
        {kicker}
      </span>

      {/* Central Glossy Icon */}
      <div
        className={`relative z-10 my-3 sm:my-4 flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}
      >
        <Icon className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors duration-200 ${theme.iconColor}`} strokeWidth={2.2} />
      </div>

      {/* Title & Supporting Description */}
      <div className="relative z-10 space-y-1.5">
        <h2 className={`font-[var(--font-display)] text-xl sm:text-[22px] font-bold tracking-wide uppercase ${theme.titleColor}`}>
          {title}
        </h2>
        <p className={`text-sm font-semibold leading-snug max-w-[24ch] mx-auto ${theme.descColor}`}>
          {description}
        </p>
      </div>

      {/* Subtle Entry Arrow */}
      <div className="relative z-10 mt-4 flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${theme.arrowBg}`}
        >
          <span>Enter</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </button>
  );
};
