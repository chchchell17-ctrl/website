import React from 'react';
import { TOWN_PATH_NODES, WALKABLE_SEGMENTS } from '../../data/townData.ts';

interface TownMapSceneProps {
  highlightPathway?: boolean;
  hqIlluminated?: boolean;
  hqDoorOpen?: boolean;
  showRustleBehindTree?: boolean;
}

export const TownMapScene: React.FC<TownMapSceneProps> = ({
  highlightPathway = false,
  hqIlluminated = false,
  hqDoorOpen = false,
  showRustleBehindTree = false,
}) => {
  return (
    <svg
      viewBox="0 0 1200 572"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      <defs>
        {/* Vibrant Frutiger Aero Sky */}
        <linearGradient id="tm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0073E6" />
          <stop offset="45%" stopColor="#1DBBFF" />
          <stop offset="82%" stopColor="#86E8FF" />
          <stop offset="100%" stopColor="#D6F8FF" />
        </linearGradient>

        {/* Sun Glow */}
        <radialGradient id="tm-sun-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDE4" stopOpacity="1" />
          <stop offset="38%" stopColor="#FDE047" stopOpacity="0.68" />
          <stop offset="72%" stopColor="#FBBF24" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tm-sun-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>

        {/* Aero Glass Globe */}
        <radialGradient id="tm-globe" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#67E8F9" stopOpacity="0.82" />
          <stop offset="75%" stopColor="#0284C7" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.88" />
        </radialGradient>

        {/* Vibrant Rolling Hills */}
        <linearGradient id="tm-hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="tm-hill-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84CC16" />
          <stop offset="45%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="tm-meadow-main" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="38%" stopColor="#4ADE80" />
          <stop offset="78%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        {/* Crystal Stream */}
        <linearGradient id="tm-stream" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="tm-stream-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
        </linearGradient>

        {/* Warm Cobblestone Road */}
        <linearGradient id="tm-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>

        {/* Building Roof & Wall Gradients */}
        <linearGradient id="tm-hq-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="tm-redflag-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="tm-aina-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E879F9" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="tm-cafe-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="tm-advice-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="tm-arcade-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <radialGradient id="tm-dome-glass" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#A5F3FC" stopOpacity="0.65" />
          <stop offset="85%" stopColor="#22D3EE" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0.7" />
        </radialGradient>

        {/* Foliage Gradients */}
        <radialGradient id="tm-tree-leaf" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#D9F99D" />
          <stop offset="45%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>

        {/* Soft Building Shadow Filter */}
        <filter id="tm-soft-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0C4A6E" floodOpacity="0.24" />
        </filter>
      </defs>

      {/* ==================== SKY & ATMOSPHERE ==================== */}
      <rect width="1200" height="310" fill="url(#tm-sky)" />

      {/* Distant Aero City Skyline (Right Horizon) */}
      <g opacity="0.52" fill="#BAE6FD">
        <rect x="1038" y="128" width="14" height="58" rx="2" />
        <rect x="1055" y="106" width="18" height="80" rx="2" />
        <polygon points="1064,88 1068,106 1060,106" />
        <rect x="1077" y="118" width="15" height="68" rx="2" />
        <rect x="1096" y="98" width="20" height="88" rx="3" />
        <rect x="1120" y="120" width="16" height="66" rx="2" />
        <rect x="1140" y="132" width="14" height="54" rx="2" />
      </g>

      {/* Luminous Translucent Frutiger Aero Globe (Upper Left) */}
      <g transform="translate(178, 118)" opacity="0.88">
        <circle cx="0" cy="0" r="66" fill="url(#tm-globe)" stroke="#E0F2FE" strokeWidth="2.5" />
        {/* Globe grid latitude & longitude */}
        <ellipse cx="0" cy="0" rx="66" ry="22" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.45" />
        <ellipse cx="0" cy="0" rx="66" ry="44" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.32" />
        <ellipse cx="0" cy="0" rx="26" ry="66" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.42" />
        <line x1="0" y1="-66" x2="0" y2="66" stroke="#FFFFFF" strokeWidth="1.1" opacity="0.4" />
        {/* Orbital rings */}
        <ellipse
          cx="0"
          cy="2"
          rx="86"
          ry="18"
          transform="rotate(-14)"
          fill="none"
          stroke="#E0F9FF"
          strokeWidth="2.4"
          opacity="0.7"
        />
        <ellipse
          cx="0"
          cy="2"
          rx="76"
          ry="14"
          transform="rotate(11)"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* Specular highlight */}
        <ellipse cx="-22" cy="-28" rx="22" ry="12" transform="rotate(-24 -22 -28)" fill="#FFFFFF" opacity="0.55" />
      </g>

      {/* Smooth Sun Halo & Gentle Rays (Upper Right) */}
      <g>
        <g className="animate-sun-pulse" style={{ transformOrigin: '1086px 68px' }}>
          <circle cx="1086" cy="68" r="105" fill="url(#tm-sun-halo)" />
        </g>
        <g className="animate-sun-rays" style={{ transformOrigin: '1086px 68px' }} opacity="0.24">
          <polygon points="1086,68 900,150 936,184" fill="#FFFBEB" />
          <polygon points="1086,68 995,212 1040,224" fill="#FFFBEB" />
          <polygon points="1086,68 860,72 868,108" fill="#FFFBEB" />
          <polygon points="1086,68 1190,192 1152,216" fill="#FFFBEB" />
        </g>
        <circle cx="1086" cy="68" r="34" fill="url(#tm-sun-core)" stroke="#FEF9C3" strokeWidth="3" />
      </g>

      {/* Smooth Drifting Fluffy Clouds */}
      <g className="animate-cloud-slow" opacity="0.92">
        <g fill="#FFFFFF">
          <ellipse cx="320" cy="66" rx="54" ry="18" />
          <circle cx="298" cy="56" r="20" />
          <circle cx="324" cy="50" r="24" />
          <circle cx="348" cy="58" r="17" />
        </g>
        <g fill="#FFFFFF" opacity="0.88">
          <ellipse cx="755" cy="54" rx="64" ry="19" />
          <circle cx="728" cy="44" r="21" />
          <circle cx="758" cy="38" r="26" />
          <circle cx="788" cy="46" r="19" />
        </g>
      </g>
      <g className="animate-cloud-wide" opacity="0.84">
        <g fill="#FFFFFF">
          <ellipse cx="535" cy="96" rx="48" ry="15" />
          <circle cx="516" cy="87" r="17" />
          <circle cx="540" cy="82" r="20" />
          <circle cx="562" cy="89" r="15" />
        </g>
        <g fill="#FFFFFF" opacity="0.86">
          <ellipse cx="965" cy="112" rx="56" ry="16" />
          <circle cx="942" cy="102" r="18" />
          <circle cx="968" cy="96" r="22" />
          <circle cx="994" cy="104" r="16" />
        </g>
      </g>

      {/* Subtle Floating Aero Bubbles in Sky */}
      <g opacity="0.55">
        <g className="animate-bubble-rise">
          <circle cx="92" cy="135" r="11" fill="rgba(255,255,255,0.22)" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="88" cy="131" r="3" fill="#FFFFFF" />
          <circle cx="630" cy="128" r="9" fill="rgba(255,255,255,0.22)" stroke="#FFFFFF" strokeWidth="1.4" />
          <circle cx="627" cy="125" r="2.4" fill="#FFFFFF" />
          <circle cx="890" cy="144" r="10" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="1.4" />
          <circle cx="886" cy="140" r="2.8" fill="#FFFFFF" />
        </g>
      </g>

      {/* ==================== VIBRANT HILLS & MEADOW ==================== */}
      {/* Far Rolling Emerald Hills */}
      <path
        d="M0,188 Q160,132 340,174 Q515,126 690,168 Q875,134 1060,172 Q1140,152 1200,170 L1200,320 L0,320 Z"
        fill="url(#tm-hill-far)"
      />
      {/* Mid Sunlit Lime-Green Hills */}
      <path
        d="M0,218 Q210,162 420,204 Q610,166 830,198 Q1030,166 1200,206 L1200,340 L0,340 Z"
        fill="url(#tm-hill-mid)"
      />
      {/* Main Town Meadow */}
      <path
        d="M0,235 Q300,205 600,224 Q900,204 1200,232 L1200,572 L0,572 Z"
        fill="url(#tm-meadow-main)"
      />
      {/* Sunlit Meadow Highlights */}
      <ellipse cx="520" cy="365" rx="340" ry="90" fill="#BEF264" opacity="0.28" />
      <ellipse cx="220" cy="480" rx="220" ry="70" fill="#BEF264" opacity="0.22" />

      {/* ==================== CRYSTAL TURQUOISE STREAM ==================== */}
      {/* Stream grassy bank shadow */}
      <path
        d="M1210,312 C1070,330 985,375 918,412 C845,450 785,482 708,578 L792,578 C865,500 928,460 1015,420 C1085,388 1148,368 1210,360 Z"
        fill="#0369A1"
        opacity="0.32"
      />
      {/* Main Stream Body */}
      <path
        d="M1210,318 C1075,335 992,378 922,415 C848,454 788,486 714,578 L786,578 C858,500 924,460 1012,418 C1082,386 1146,365 1210,356 Z"
        fill="url(#tm-stream)"
        stroke="#E0F2FE"
        strokeWidth="3"
      />
      {/* Stream Glossy Reflection */}
      <path
        d="M1200,330 C1078,348 1002,388 932,425 C864,460 806,494 736,574 L764,574 C832,498 892,464 968,426 C1038,392 1114,362 1200,346 Z"
        fill="url(#tm-stream-sheen)"
      />

      {/* Smooth Water Ripples */}
      <g className="animate-stream-shimmer" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M1110,346 Q1084,358 1058,366" />
        <path d="M1018,390 Q992,404 964,418" />
        <path d="M845,488 Q824,504 800,520" />
        <path d="M778,538 Q760,554 742,568" />
      </g>

      {/* Calm Lily Pads & Pink Lotus in Lower-Right Stream */}
      <g transform="translate(838, 530)">
        <ellipse cx="0" cy="0" rx="22" ry="9" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
        <path d="M0,0 L18,-4 L14,4 Z" fill="#0284C7" />
        <g transform="translate(-3, -6)">
          <ellipse cx="-7" cy="2" rx="7" ry="4.5" fill="#F472B6" stroke="#BE185D" strokeWidth="1" />
          <ellipse cx="7" cy="2" rx="7" ry="4.5" fill="#F472B6" stroke="#BE185D" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="6" ry="7" fill="#F9A8D4" stroke="#BE185D" strokeWidth="1" />
          <circle cx="0" cy="1" r="2.6" fill="#FDE047" />
        </g>
      </g>
      <g transform="translate(1075, 368)">
        <ellipse cx="0" cy="0" rx="16" ry="6.5" fill="#4ADE80" stroke="#166534" strokeWidth="1.2" />
      </g>

      {/* Smoothly Gliding Tropical Fish */}
      <g className="animate-fish-right">
        <g transform="translate(770, 528)">
          <ellipse cx="0" cy="0" rx="8.5" ry="5" fill="#FB923C" stroke="#FFFFFF" strokeWidth="1.4" />
          <polygon points="-8,0 -15,-4.5 -15,4.5" fill="#F97316" />
          <line x1="-1" y1="-4.5" x2="-1" y2="4.5" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="3.8" cy="-1" r="1.2" fill="#0F172A" />
        </g>
      </g>
      <g className="animate-fish-left">
        <g transform="translate(1038, 392)">
          <ellipse cx="0" cy="0" rx="8" ry="4.6" fill="#FACC15" stroke="#0369A1" strokeWidth="1.3" />
          <polygon points="-7,0 -13,-4 -13,4" fill="#38BDF8" />
          <circle cx="3.4" cy="-1" r="1.1" fill="#0F172A" />
        </g>
      </g>

      {/* ==================== COBBLESTONE PATHWAY NETWORK ==================== */}
      {/* Exact match to TOWN_PATH_NODES & WALKABLE_SEGMENTS */}
      {/* Outer Curb Border */}
      <g stroke="#B45309" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.45">
        {WALKABLE_SEGMENTS.map(([aId, bId]) => {
          const a = TOWN_PATH_NODES[aId];
          const b = TOWN_PATH_NODES[bId];
          return (
            <line
              key={`curb-${aId}-${bId}`}
              x1={(a.x / 100) * 1200}
              y1={(a.y / 100) * 572}
              x2={(b.x / 100) * 1200}
              y2={(b.y / 100) * 572}
            />
          );
        })}
      </g>
      {/* Main Warm Sandstone Path */}
      <g stroke="url(#tm-road)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {WALKABLE_SEGMENTS.map(([aId, bId]) => {
          const a = TOWN_PATH_NODES[aId];
          const b = TOWN_PATH_NODES[bId];
          return (
            <line
              key={`road-${aId}-${bId}`}
              x1={(a.x / 100) * 1200}
              y1={(a.y / 100) * 572}
              x2={(b.x / 100) * 1200}
              y2={(b.y / 100) * 572}
            />
          );
        })}
      </g>
      {/* Inner Sunlit Cobblestone Center Highlight */}
      <g stroke="#FEF3C7" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.72">
        {WALKABLE_SEGMENTS.map(([aId, bId]) => {
          const a = TOWN_PATH_NODES[aId];
          const b = TOWN_PATH_NODES[bId];
          return (
            <line
              key={`inner-${aId}-${bId}`}
              x1={(a.x / 100) * 1200}
              y1={(a.y / 100) * 572}
              x2={(b.x / 100) * 1200}
              y2={(b.y / 100) * 572}
            />
          );
        })}
      </g>

      {/* Cobblestone Plaza Center Circle at (45%, 84.5%) => (540, 483) */}
      <g transform="translate(540, 488)">
        <ellipse cx="0" cy="0" rx="68" ry="28" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
        <ellipse cx="0" cy="-2" rx="52" ry="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" strokeDasharray="8 6" />
        <ellipse cx="-24" cy="4" rx="10" ry="5" fill="#FDBA74" opacity="0.6" />
        <ellipse cx="22" cy="-5" rx="11" ry="5" fill="#FDBA74" opacity="0.6" />
        <ellipse cx="6" cy="8" rx="9" ry="4" fill="#FDBA74" opacity="0.6" />
      </g>

      {/* Arched Stone Bridge over the Stream between bridge-west (762, 466) & bridge-east (858, 469) */}
      <g transform="translate(810, 467)">
        {/* Bridge Arch Shadow */}
        <path d="M-54,14 Q0,-10 54,14 L54,28 Q0,4 -54,28 Z" fill="#92400E" opacity="0.55" />
        {/* Bridge Deck */}
        <path
          d="M-56,6 Q0,-18 56,6 L54,20 Q0,-4 -54,20 Z"
          fill="#FDE68A"
          stroke="#78350F"
          strokeWidth="2.6"
        />
        {/* Parapet Railings & Stone Posts */}
        <path d="M-52,-4 Q0,-26 52,-4" fill="none" stroke="#FEF3C7" strokeWidth="6" strokeLinecap="round" />
        <path d="M-52,-4 Q0,-26 52,-4" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="-56" y="-14" width="11" height="22" rx="3" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
        <rect x="45" y="-14" width="11" height="22" rx="3" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
        <rect x="-5" y="-22" width="10" height="16" rx="3" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
      </g>

      {/* Pathway Tutorial Highlight Overlay (Scene 11) */}
      {highlightPathway && (
        <g strokeLinecap="round" strokeLinejoin="round">
          {WALKABLE_SEGMENTS.map(([aId, bId]) => {
            const a = TOWN_PATH_NODES[aId];
            const b = TOWN_PATH_NODES[bId];
            return (
              <line
                key={`glow-${aId}-${bId}`}
                x1={(a.x / 100) * 1200}
                y1={(a.y / 100) * 572}
                x2={(b.x / 100) * 1200}
                y2={(b.y / 100) * 572}
                stroke="#FEF08A"
                strokeWidth="22"
                strokeDasharray="12 10"
                opacity="0.72"
              />
            );
          })}
        </g>
      )}

      {/* ==================== TREES & SHRUBS (BETWEEN BUILDINGS) ==================== */}
      {/* Left Foreground / Edge Tree */}
      <g transform="translate(56, 232)">
        <rect x="-10" y="34" width="20" height="54" rx="6" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
        <circle cx="-18" cy="18" r="28" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
        <circle cx="18" cy="20" r="27" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
        <circle cx="0" cy="-4" r="32" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
      </g>

      {/* Tree between Detective HQ & Red Flag Centre (also rustles in Scene 02!) */}
      <g transform="translate(306, 214)">
        <rect x="-8" y="26" width="16" height="40" rx="5" fill="#92400E" stroke="#451A03" strokeWidth="2.2" />
        <circle cx="-14" cy="14" r="22" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="14" cy="15" r="21" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="0" cy="-4" r="25" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
      </g>

      {/* Tree between Red Flag Centre & Aina's House */}
      <g transform="translate(598, 206)">
        <rect x="-8" y="26" width="16" height="38" rx="5" fill="#92400E" stroke="#451A03" strokeWidth="2.2" />
        <circle cx="-14" cy="14" r="21" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="14" cy="14" r="21" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="0" cy="-4" r="24" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
      </g>

      {/* Tree between Aina's House & Cyber Café */}
      <g transform="translate(868, 216)">
        <rect x="-8" y="26" width="16" height="38" rx="5" fill="#92400E" stroke="#451A03" strokeWidth="2.2" />
        <circle cx="-13" cy="13" r="20" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="13" cy="13" r="20" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="0" cy="-4" r="23" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.2" />
      </g>

      {/* Right Edge Shade Tree */}
      <g transform="translate(1148, 236)">
        <rect x="-10" y="34" width="20" height="52" rx="6" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
        <circle cx="-18" cy="16" r="28" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
        <circle cx="18" cy="18" r="26" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
        <circle cx="0" cy="-6" r="31" fill="url(#tm-tree-leaf)" stroke="#14532D" strokeWidth="2.5" />
      </g>

      {/* ==================== ALL SEVEN TOWN BUILDINGS ==================== */}

      {/* 1. DETECTIVE HQ — (16.5%, 44.5%) => center (198, 254.5), door ~(210, 311) */}
      <g transform="translate(198, 252)" filter="url(#tm-soft-shadow)">
        {hqIlluminated && (
          <ellipse cx="0" cy="4" rx="105" ry="78" fill="#FEF08A" opacity="0.42" />
        )}
        {/* Base Platform & Bushes */}
        <ellipse cx="0" cy="52" rx="80" ry="16" fill="#15803D" opacity="0.35" />
        <circle cx="-68" cy="42" r="15" fill="#22C55E" stroke="#14532D" strokeWidth="2.2" />
        <circle cx="68" cy="42" r="15" fill="#22C55E" stroke="#14532D" strokeWidth="2.2" />
        {/* Building Body */}
        <rect x="-64" y="-8" width="128" height="60" rx="12" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="3" />
        {/* Striped Blue Awning Roof */}
        <path
          d="M-76,-4 L-58,-44 L58,-44 L76,-4 Z"
          fill="url(#tm-hq-roof)"
          stroke="#1E3A8A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line x1="-26" y1="-44" x2="-34" y2="-4" stroke="#BAE6FD" strokeWidth="6" opacity="0.45" />
        <line x1="0" y1="-44" x2="0" y2="-4" stroke="#BAE6FD" strokeWidth="6" opacity="0.45" />
        <line x1="26" y1="-44" x2="34" y2="-4" stroke="#BAE6FD" strokeWidth="6" opacity="0.45" />
        {/* Magnifying Glass Rooftop Emblem */}
        <g transform="translate(0, -56)">
          <circle cx="0" cy="0" r="22" fill="#BAE6FD" stroke="#F59E0B" strokeWidth="6" />
          <ellipse cx="-6" cy="-7" rx="7" ry="4" transform="rotate(-30 -6 -7)" fill="#FFFFFF" opacity="0.8" />
          <line x1="-15" y1="15" x2="-30" y2="30" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />
        </g>
        {/* Windows */}
        <rect x="-48" y="10" width="24" height="22" rx="6" fill={hqIlluminated ? '#FEF9C3' : '#FDE047'} stroke="#0284C7" strokeWidth="2.4" />
        <rect x="24" y="10" width="24" height="22" rx="6" fill={hqIlluminated ? '#FEF9C3' : '#FDE047'} stroke="#0284C7" strokeWidth="2.4" />
        {/* Center Detective Shield */}
        <polygon points="0,-16 11,-11 9,2 0,8 -9,2 -11,-11" fill="#2563EB" stroke="#FACC15" strokeWidth="2.5" />
        {/* Arched Blue Double Doors */}
        <path
          d="M-16,52 L-16,24 A16,16 0 0,1 16,24 L16,52 Z"
          fill={hqDoorOpen ? '#FEF08A' : '#0284C7'}
          stroke="#1E3A8A"
          strokeWidth="2.8"
        />
        {!hqDoorOpen && <line x1="0" y1="9" x2="0" y2="52" stroke="#1E3A8A" strokeWidth="2" />}
        {/* Signboard */}
        <rect x="-54" y="50" width="108" height="22" rx="11" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.4" />
        <text x="0" y="65" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#0F4C81">
          Detective HQ
        </text>
      </g>

      {/* 2. RED FLAG CENTRE — (38.2%, 39%) => center (458.4, 223.1) */}
      <g transform="translate(458, 220)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="46" rx="74" ry="14" fill="#15803D" opacity="0.32" />
        <circle cx="-62" cy="36" r="13" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        <circle cx="62" cy="36" r="13" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        {/* Walls */}
        <rect x="-58" y="-6" width="116" height="52" rx="10" fill="#FFF1F2" stroke="#991B1B" strokeWidth="3" />
        {/* Peaked Red Roof */}
        <polygon
          points="-70,-4 0,-48 70,-4"
          fill="url(#tm-redflag-roof)"
          stroke="#991B1B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Red Flags on Roof */}
        <line x1="-26" y1="-34" x2="-26" y2="-62" stroke="#7F1D1D" strokeWidth="2.8" />
        <polygon points="-25,-62 2,-55 -25,-48" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
        <line x1="26" y1="-34" x2="26" y2="-62" stroke="#7F1D1D" strokeWidth="2.8" />
        <polygon points="27,-62 54,-55 27,-48" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
        {/* Warning Triangle Sign in Gable */}
        <polygon points="0,-34 15,-12 -15,-12" fill="#FDE047" stroke="#991B1B" strokeWidth="2.4" strokeLinejoin="round" />
        <text x="0" y="-15" textAnchor="middle" fontSize="13" fontWeight="900" fill="#991B1B">
          !
        </text>
        {/* Windows & Door */}
        <rect x="-44" y="8" width="20" height="20" rx="5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.2" />
        <rect x="24" y="8" width="20" height="20" rx="5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.2" />
        <path d="M-14,46 L-14,20 A14,14 0 0,1 14,20 L14,46 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.6" />
        {/* Signboard */}
        <rect x="-56" y="44" width="112" height="21" rx="10.5" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2.2" />
        <text x="0" y="58.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#991B1B">
          Red Flag Centre
        </text>
      </g>

      {/* 3. AINA'S HOUSE — (61.5%, 38.5%) => center (738, 220.2) */}
      <g transform="translate(738, 218)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="46" rx="74" ry="14" fill="#15803D" opacity="0.32" />
        <circle cx="-60" cy="36" r="13" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        <circle cx="60" cy="36" r="13" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        {/* Cottage Walls */}
        <rect x="-56" y="-4" width="112" height="50" rx="10" fill="#FAF5FF" stroke="#6B21A8" strokeWidth="3" />
        {/* Lavender Roof */}
        <polygon
          points="-68,-2 0,-46 68,-2"
          fill="url(#tm-aina-roof)"
          stroke="#6B21A8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Heart Emblem */}
        <path
          d="M0,-14 C-4,-24 -16,-24 -16,-14 C-16,-6 0,2 0,2 C0,2 16,-6 16,-14 C16,-24 4,-24 0,-14 Z"
          fill="#F472B6"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Warm Windows & Flowerboxes */}
        <rect x="-43" y="8" width="20" height="20" rx="5" fill="#FDE047" stroke="#7E22CE" strokeWidth="2.2" />
        <rect x="23" y="8" width="20" height="20" rx="5" fill="#FDE047" stroke="#7E22CE" strokeWidth="2.2" />
        <rect x="-45" y="27" width="24" height="7" rx="3" fill="#F472B6" />
        <rect x="21" y="27" width="24" height="7" rx="3" fill="#F472B6" />
        {/* Door */}
        <path d="M-12,46 L-12,20 A12,12 0 0,1 12,20 L12,46 Z" fill="#A855F7" stroke="#581C87" strokeWidth="2.5" />
        {/* Signboard */}
        <rect x="-50" y="44" width="100" height="21" rx="10.5" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2.2" />
        <text x="0" y="58.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#6B21A8">
          Aina&apos;s House
        </text>
      </g>

      {/* 4. CYBER CAFÉ — (82.8%, 45%) => center (993.6, 257.4) */}
      <g transform="translate(994, 254)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="48" rx="80" ry="15" fill="#15803D" opacity="0.32" />
        {/* Bistro Patio Umbrella & Table */}
        <g transform="translate(56, 26)">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#78350F" strokeWidth="2.5" />
          <path d="M-24,2 Q0,-18 24,2 Z" fill="#FB7185" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="-12" y="14" width="24" height="5" rx="2" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
        </g>
        {/* Café Building */}
        <rect x="-62" y="-6" width="114" height="54" rx="11" fill="#FFF7ED" stroke="#9A3412" strokeWidth="3" />
        {/* Striped Tangerine Awning */}
        <path d="M-72,-4 L-54,-36 L44,-36 L62,-4 Z" fill="url(#tm-cafe-roof)" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round" />
        <line x1="-30" y1="-36" x2="-38" y2="-4" stroke="#FFFBEB" strokeWidth="8" opacity="0.7" />
        <line x1="-5" y1="-36" x2="-5" y2="-4" stroke="#FFFBEB" strokeWidth="8" opacity="0.7" />
        <line x1="20" y1="-36" x2="28" y2="-4" stroke="#FFFBEB" strokeWidth="8" opacity="0.7" />
        {/* Rooftop Laptop & Coffee Cup Sign */}
        <g transform="translate(-5, -52)">
          <rect x="-24" y="-12" width="48" height="30" rx="5" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2.5" />
          <rect x="-19" y="-8" width="38" height="22" rx="3" fill="#E0F2FE" />
          <ellipse cx="0" cy="4" rx="8" ry="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
          <path d="M-28,18 L28,18 L34,24 L-34,24 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        </g>
        {/* Glowing Pink Door & Windows */}
        <rect x="-46" y="10" width="22" height="22" rx="5" fill="#FDE047" stroke="#C2410C" strokeWidth="2.2" />
        <rect x="16" y="10" width="22" height="22" rx="5" fill="#FDE047" stroke="#C2410C" strokeWidth="2.2" />
        <path d="M-16,48 L-16,18 A13,13 0 0,1 10,18 L10,48 Z" fill="#EC4899" stroke="#831843" strokeWidth="2.5" />
        {/* Signboard */}
        <rect x="-54" y="46" width="104" height="21" rx="10.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.2" />
        <text x="-2" y="60.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#9A3412">
          Cyber Café
        </text>
      </g>

      {/* 5. ADVICE CENTRE — (56.5%, 64.5%) => center (678, 368.9) */}
      <g transform="translate(678, 368)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="50" rx="80" ry="15" fill="#15803D" opacity="0.34" />
        <circle cx="-64" cy="40" r="14" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        <circle cx="64" cy="40" r="14" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        {/* Walls */}
        <rect x="-60" y="-4" width="120" height="54" rx="12" fill="#F0FDFA" stroke="#115E59" strokeWidth="3" />
        {/* Teal Roof */}
        <path d="M-72,-2 L-54,-38 L54,-38 L72,-2 Z" fill="url(#tm-advice-roof)" stroke="#115E59" strokeWidth="3" strokeLinejoin="round" />
        {/* Speech Bubble Rooftop Sign */}
        <g transform="translate(0, -54)">
          <rect x="-26" y="-14" width="52" height="32" rx="14" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="3" />
          <polygon points="-6,17 4,17 -8,27" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="-11" cy="2" r="3.4" fill="#FFFFFF" />
          <circle cx="0" cy="2" r="3.4" fill="#FFFFFF" />
          <circle cx="11" cy="2" r="3.4" fill="#FFFFFF" />
        </g>
        {/* Library Windows & Double Glass Doors */}
        <rect x="-48" y="10" width="24" height="24" rx="5" fill="#FEF08A" stroke="#0F766E" strokeWidth="2.2" />
        <rect x="24" y="10" width="24" height="24" rx="5" fill="#FEF08A" stroke="#0F766E" strokeWidth="2.2" />
        <path d="M-15,50 L-15,20 A15,15 0 0,1 15,20 L15,50 Z" fill="#2DD4BF" stroke="#115E59" strokeWidth="2.6" />
        {/* Signboard */}
        <rect x="-56" y="48" width="112" height="22" rx="11" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.4" />
        <text x="0" y="63" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#115E59">
          Advice Centre
        </text>
      </g>

      {/* 6. GAME ARCADE — (32.5%, 66.5%) => center (390, 380.4) */}
      <g transform="translate(390, 380)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="52" rx="82" ry="15" fill="#15803D" opacity="0.34" />
        <circle cx="-66" cy="42" r="14" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        <circle cx="66" cy="42" r="14" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        {/* Vibrant Purple Arcade Body */}
        <rect x="-64" y="-6" width="128" height="58" rx="14" fill="#EDE9FE" stroke="#4C1D95" strokeWidth="3" />
        <path d="M-74,-4 Q0,-44 74,-4 Z" fill="url(#tm-arcade-roof)" stroke="#4C1D95" strokeWidth="3" />
        {/* Purble-Place-Inspired Playful Eyes on Roof */}
        <g transform="translate(-18, -32)">
          <circle cx="0" cy="0" r="13" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2.5" />
          <circle cx="2" cy="1" r="6" fill="#2563EB" />
          <circle cx="3" cy="-1" r="2.2" fill="#FFFFFF" />
        </g>
        <g transform="translate(18, -32)">
          <circle cx="0" cy="0" r="13" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2.5" />
          <circle cx="-2" cy="1" r="6" fill="#2563EB" />
          <circle cx="-1" cy="-1" r="2.2" fill="#FFFFFF" />
        </g>
        {/* Controller Neon Sign */}
        <rect x="-26" y="-12" width="52" height="22" rx="11" fill="#6D28D9" stroke="#FDE047" strokeWidth="2.5" />
        <circle cx="-10" cy="-1" r="4" fill="#FFFFFF" />
        <circle cx="10" cy="-1" r="4" fill="#F472B6" />
        <rect x="-6" y="-3" width="12" height="4" rx="2" fill="#FFFFFF" />
        {/* Arcade Doors & Star Accents */}
        <polygon points="-44,12 -40,20 -32,20 -38,25 -36,33 -44,28 -52,33 -50,25 -56,20 -48,20" fill="#FACC15" />
        <polygon points="44,12 48,20 56,20 50,25 52,33 44,28 36,33 38,25 32,20 40,20" fill="#FACC15" />
        <path d="M-16,52 L-16,22 A16,16 0 0,1 16,22 L16,52 Z" fill="#8B5CF6" stroke="#4C1D95" strokeWidth="2.6" />
        {/* Signboard */}
        <rect x="-54" y="50" width="108" height="22" rx="11" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.4" />
        <text x="0" y="65" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#4C1D95">
          Game Arcade
        </text>
      </g>

      {/* 7. DIGITAL SAFE GARDEN — (81.5%, 73.5%) => center (978, 420.4) */}
      <g transform="translate(978, 420)" filter="url(#tm-soft-shadow)">
        <ellipse cx="0" cy="48" rx="82" ry="15" fill="#15803D" opacity="0.34" />
        {/* Garden Flowers Inside & Around */}
        <circle cx="-64" cy="40" r="12" fill="#F472B6" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="64" cy="40" r="12" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2" />
        <ellipse cx="-26" cy="36" rx="20" ry="10" fill="#22C55E" />
        <ellipse cx="26" cy="36" rx="20" ry="10" fill="#4ADE80" />
        {/* Crystal Glass Greenhouse Dome */}
        <path
          d="M-66,44 L-66,12 A66,62 0 0,1 66,12 L66,44 Z"
          fill="url(#tm-dome-glass)"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        {/* Greenhouse Ribs */}
        <path d="M-28,44 L-28,12 A28,62 0 0,1 0,-50 A28,62 0 0,1 28,12 L28,44" fill="none" stroke="#E0F2FE" strokeWidth="2" opacity="0.85" />
        <line x1="-66" y1="14" x2="66" y2="14" stroke="#E0F2FE" strokeWidth="2" opacity="0.75" />
        {/* Sprouting Green Leaves on Top */}
        <g transform="translate(0, -52)">
          <path d="M0,4 C-18,-2 -24,-22 -4,-24 C6,-24 6,-6 0,4 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="2.2" />
          <path d="M0,4 C18,-2 24,-22 4,-24 C-6,-24 -6,-6 0,4 Z" fill="#84CC16" stroke="#15803D" strokeWidth="2.2" />
        </g>
        {/* Greenhouse Entrance Arch */}
        <path d="M-14,44 L-14,18 A14,14 0 0,1 14,18 L14,44 Z" fill="#BBF7D0" stroke="#0D9488" strokeWidth="2.4" />
        {/* Signboard */}
        <rect x="-66" y="42" width="132" height="22" rx="11" fill="#FFFFFF" stroke="#16A34A" strokeWidth="2.4" />
        <text x="0" y="57" textAnchor="middle" fontSize="11.2" fontWeight="900" fill="#15803D">
          Digital Safe Garden
        </text>
      </g>

      {/* ==================== FOREGROUND FLORA & BUTTERFLIES ==================== */}
      {/* Lower-Left Hibiscus & Fence Corner */}
      <g transform="translate(46, 515)">
        <ellipse cx="14" cy="24" rx="44" ry="22" fill="#16A34A" />
        <g transform="translate(0, 0)">
          <circle cx="-12" cy="-8" r="14" fill="#F472B6" />
          <circle cx="12" cy="-8" r="14" fill="#FB7185" />
          <circle cx="-10" cy="12" r="14" fill="#F472B6" />
          <circle cx="10" cy="12" r="14" fill="#FB7185" />
          <circle cx="0" cy="-16" r="13" fill="#EC4899" />
          <circle cx="0" cy="0" r="6" fill="#FDE047" />
        </g>
      </g>
      {/* Lower-Right Hibiscus */}
      <g transform="translate(1152, 520)">
        <ellipse cx="-14" cy="24" rx="44" ry="22" fill="#16A34A" />
        <g transform="translate(0, 0)">
          <circle cx="-11" cy="-7" r="13" fill="#F472B6" />
          <circle cx="11" cy="-7" r="13" fill="#FB7185" />
          <circle cx="-9" cy="11" r="13" fill="#F472B6" />
          <circle cx="9" cy="11" r="13" fill="#FB7185" />
          <circle cx="0" cy="-14" r="12" fill="#EC4899" />
          <circle cx="0" cy="0" r="5.5" fill="#FDE047" />
        </g>
      </g>

      {/* Smoothly Fluttering Butterflies */}
      <g className="animate-butterfly-a">
        <g transform="translate(260, 500)">
          <g className="animate-wing-flutter">
            <ellipse cx="-6" cy="0" rx="6.5" ry="4.5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1" />
            <ellipse cx="6" cy="0" rx="6.5" ry="4.5" fill="#FB923C" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        </g>
      </g>
      <g className="animate-butterfly-b">
        <g transform="translate(945, 422)">
          <g className="animate-wing-flutter">
            <ellipse cx="-5.5" cy="0" rx="6" ry="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
            <ellipse cx="5.5" cy="0" rx="6" ry="4" fill="#F472B6" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        </g>
      </g>

      {/* HQ Door Glow during Scene 14 Entrance */}
      {hqDoorOpen && (
        <rect
          x="182"
          y="265"
          width="32"
          height="40"
          rx="10"
          fill="#FEF08A"
          stroke="#F59E0B"
          strokeWidth="3"
          opacity="0.92"
        />
      )}

      {/* Rustle behind nearby tree at end of Scene 02 */}
      {showRustleBehindTree && (
        <g transform="translate(285, 212)" className="animate-bounce">
          <text
            x="0"
            y="0"
            fontSize="18"
            fontWeight="900"
            fill="#FEF08A"
            stroke="#0369A1"
            strokeWidth="1.2"
          >
            *rustle!*
          </text>
        </g>
      )}
    </svg>
  );
};
