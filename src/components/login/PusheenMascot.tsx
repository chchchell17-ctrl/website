import React from 'react';
import { playMascotChirp } from '../../utils/soundEffects.ts';

interface PusheenMascotProps {
  compact?: boolean;
}

export const PusheenMascot: React.FC<PusheenMascotProps> = ({ compact = false }) => {
  return (
    <aside
      aria-label="Detective Pusheen welcome message"
      className={`flex items-end gap-2.5 sm:gap-3.5 ${
        compact ? 'justify-center' : 'justify-center lg:justify-end'
      }`}
    >
      {/* Translucent Welcome Speech Bubble */}
      <div
        className="relative max-w-[235px] sm:max-w-[265px] rounded-2xl bg-white/88 backdrop-blur-md border border-white/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_26px_-8px_rgba(16,55,92,0.22)] text-left"
      >
        <p className="font-[var(--font-display)] text-[11px] sm:text-xs font-bold tracking-wide text-[#0E5B88]">
          DETECTIVE PUSHEEN:
        </p>
        <p className="mt-0.5 text-xs sm:text-[13px] font-medium leading-snug text-[#10375C]">
          &ldquo;Hello there! Welcome to Digital Detective World. Choose your portal to begin!&rdquo;
        </p>
        {/* Speech bubble pointer towards Pusheen */}
        <span
          aria-hidden="true"
          className="absolute -right-2 bottom-4 h-3.5 w-3.5 rotate-45 bg-white/90 border-r border-t border-white/95"
        />
      </div>

      {/* Detective Pusheen SVG Character (Faithful to Character Sheet) */}
      <button
        type="button"
        onClick={() => playMascotChirp()}
        aria-label="Say hello to Detective Pusheen"
        className="shrink-0 w-[92px] sm:w-[116px] lg:w-[126px] rounded-2xl transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/60 cursor-pointer"
      >
        <svg
          viewBox="0 0 180 155"
          role="img"
          aria-label="Detective Pusheen wearing a brown plaid deerstalker hat and holding a magnifying glass"
          className="w-full h-auto drop-shadow-[0_10px_16px_rgba(16,55,92,0.18)]"
        >
          {/* Soft floor shadow */}
          <ellipse cx="92" cy="142" rx="54" ry="9" fill="#9E8BB8" opacity="0.32" />

          {/* Animated breathing body */}
          <g className="animate-pusheen-breathe">
            {/* Striped Tail */}
            <path
              d="M36,115 C14,116 8,98 20,90 C28,85 37,93 40,104"
              fill="#A69B91"
              stroke="#5D5048"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M18,96 C21,98 23,103 22,107" stroke="#5D5048" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M27,93 C30,96 31,101 30,105" stroke="#5D5048" strokeWidth="3.5" strokeLinecap="round" />

            {/* Chubby Cat Body & Ears */}
            <path
              d="M44,126
                 C37,114 38,80 46,60
                 L43,39
                 C43,35 48,34 52,38
                 L64,48
                 C76,44 102,44 114,48
                 L126,38
                 C130,34 135,35 135,39
                 L132,60
                 C140,80 141,114 134,126
                 C128,137 114,139 90,139
                 C66,139 50,137 44,126 Z"
              fill="#A69B91"
              stroke="#5D5048"
              strokeWidth="4.2"
              strokeLinejoin="round"
            />

            {/* Back & Side Tabby Stripes */}
            <path d="M41,94 L50,94" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />
            <path d="M40,105 L49,104" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />
            <path d="M137,94 L128,94" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />
            <path d="M138,105 L129,104" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />

            {/* Tiny Bottom Paws */}
            <ellipse cx="64" cy="136" rx="8" ry="5" fill="#A69B91" stroke="#5D5048" strokeWidth="3.8" />
            <ellipse cx="116" cy="136" rx="8" ry="5" fill="#A69B91" stroke="#5D5048" strokeWidth="3.8" />

            {/* Gentle Head Tilt Group */}
            <g className="animate-pusheen-head">
              {/* Forehead Tabby Stripes */}
              <path d="M81,46 L81,56" stroke="#6E5F56" strokeWidth="3.8" strokeLinecap="round" />
              <path d="M89,45 L89,58" stroke="#6E5F56" strokeWidth="3.8" strokeLinecap="round" />
              <path d="M97,46 L97,56" stroke="#6E5F56" strokeWidth="3.8" strokeLinecap="round" />

              {/* Brown Plaid Deerstalker Detective Hat */}
              <g transform="translate(65, 16)">
                {/* Hat Dome */}
                <path
                  d="M6,26 C6,10 17,4 25,4 C33,4 44,10 44,26 Z"
                  fill="#B88456"
                  stroke="#5D5048"
                  strokeWidth="3.6"
                />
                {/* Plaid Lines */}
                <path d="M16,7 L14,25 M34,7 L36,25 M9,17 L41,17" stroke="#7D502D" strokeWidth="1.8" opacity="0.7" />
                {/* Hat Brim */}
                <path
                  d="M2,26 Q25,21 48,26 Q25,31 2,26 Z"
                  fill="#9E6B40"
                  stroke="#5D5048"
                  strokeWidth="3.4"
                />
                {/* Top Button */}
                <circle cx="25" cy="4" r="3.2" fill="#8C5932" stroke="#5D5048" strokeWidth="2.4" />
              </g>

              {/* Rosy Cheeks */}
              <ellipse cx="67" cy="76" rx="5.5" ry="3.2" fill="#F2ACB4" opacity="0.75" />
              <ellipse cx="111" cy="76" rx="5.5" ry="3.2" fill="#F2ACB4" opacity="0.75" />

              {/* Eyes with Blink */}
              <g className="animate-pusheen-blink">
                <circle cx="72" cy="68" r="4" fill="#3B2F2A" />
                <circle cx="70.8" cy="66.7" r="1.2" fill="#FFFFFF" />
                <circle cx="106" cy="68" r="4" fill="#3B2F2A" />
                <circle cx="104.8" cy="66.7" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Whiskers */}
              <path d="M35,66 L48,68 M34,75 L48,74" stroke="#5D5048" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M143,66 L130,68 M144,75 L130,74" stroke="#5D5048" strokeWidth="3.4" strokeLinecap="round" />

              {/* Friendly ":3" + Cheerful Tongue Mouth */}
              <path
                d="M82,70 Q85.5,75 89,70 Q92.5,75 96,70"
                fill="none"
                stroke="#5D5048"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M85,73 C85,80 93,80 93,73 Z"
                fill="#EE8E9D"
                stroke="#5D5048"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
            </g>

            {/* Right Waving Paw */}
            <g className="animate-pusheen-paw">
              <path
                d="M126,102 C142,96 149,84 143,78 C138,73 128,83 122,92"
                fill="#A69B91"
                stroke="#5D5048"
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Cheerful wave accent ticks */}
              <path d="M150,70 L155,66 M153,79 L159,78" stroke="#F4B740" strokeWidth="2.8" strokeLinecap="round" />
            </g>

            {/* Left Paw + Wooden Magnifying Glass */}
            <g className="animate-pusheen-glass">
              {/* Magnifying Glass Handle */}
              <rect
                x="44"
                y="102"
                width="9"
                height="24"
                rx="4.5"
                transform="rotate(24 48 114)"
                fill="#9E6B43"
                stroke="#5D5048"
                strokeWidth="3.2"
              />
              {/* Magnifying Glass Rim & Glossy Lens */}
              <circle cx="57" cy="88" r="15.5" fill="#DDF4FC" fillOpacity="0.82" stroke="#5D5048" strokeWidth="4" />
              <circle cx="57" cy="88" r="12.5" fill="none" stroke="#B68052" strokeWidth="2.8" />
              {/* Lens Specular Highlight */}
              <path
                d="M49,83 Q53,78 60,79"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Left Paw Holding Handle */}
              <ellipse
                cx="51"
                cy="104"
                rx="8.5"
                ry="6.5"
                transform="rotate(-15 51 104)"
                fill="#A69B91"
                stroke="#5D5048"
                strokeWidth="3.6"
              />
            </g>
          </g>
        </svg>
      </button>
    </aside>
  );
};
