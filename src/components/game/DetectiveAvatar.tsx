import React from 'react';
import type {
  AccessoryId,
  AvatarConfig,
  BaseAppearanceId,
  HairColorId,
  HairStyleId,
  OutfitColorId,
  OutfitStyleId,
  ShoeColorId,
  ShoeStyleId,
  SkinToneId,
} from '../../types/game.ts';

export const SKIN_TONES: Record<SkinToneId, { label: string; fill: string; shade: string }> = {
  fair: { label: 'Porcelain', fill: '#FFE2CC', shade: '#F0C5A8' },
  light: { label: 'Warm Peach', fill: '#F7C9A6', shade: '#E2AC84' },
  medium: { label: 'Golden Honey', fill: '#E2A87C', shade: '#C98A5D' },
  tan: { label: 'Caramel', fill: '#C88753', shade: '#AA6C3B' },
  brown: { label: 'Chestnut', fill: '#9A5F36', shade: '#7B4723' },
  deep: { label: 'Deep Cocoa', fill: '#6B3E24', shade: '#4F2B17' },
};

export const HAIR_COLORS: Record<HairColorId, { label: string; fill: string; highlight: string }> = {
  black: { label: 'Ink Black', fill: '#2B2420', highlight: '#4A403A' },
  'dark-brown': { label: 'Dark Brown', fill: '#5C3A21', highlight: '#7B5133' },
  chestnut: { label: 'Chestnut', fill: '#8B542E', highlight: '#AB6E42' },
  blonde: { label: 'Honey Blonde', fill: '#E4B453', highlight: '#F6CF7B' },
  auburn: { label: 'Auburn', fill: '#A8442A', highlight: '#C85E42' },
  midnight: { label: 'Midnight Blue', fill: '#2E4272', highlight: '#48639E' },
};

export const OUTFIT_COLORS: Record<
  OutfitColorId,
  { label: string; main: string; dark: string; accent: string }
> = {
  aqua: { label: 'Aero Aqua', main: '#38BDF8', dark: '#0284C7', accent: '#BAE6FD' },
  mint: { label: 'Fresh Mint', main: '#4ADE80', dark: '#16A34A', accent: '#DCFCE7' },
  lavender: { label: 'Soft Lavender', main: '#A78BFA', dark: '#6D28D9', accent: '#EDE9FE' },
  gold: { label: 'Sunny Gold', main: '#FBBF24', dark: '#D97706', accent: '#FEF3C7' },
  coral: { label: 'Pastel Coral', main: '#F472B6', dark: '#DB2777', accent: '#FCE7F3' },
  navy: { label: 'Detective Navy', main: '#3B82F6', dark: '#1D4ED8', accent: '#DBEAFE' },
};

export const SHOE_COLORS: Record<ShoeColorId, { label: string; main: string; sole: string }> = {
  white: { label: 'Cloud White', main: '#F8FAFC', sole: '#94A3B8' },
  sky: { label: 'Sky Blue', main: '#38BDF8', sole: '#E2E8F0' },
  charcoal: { label: 'Slate', main: '#334155', sole: '#CBD5E1' },
  berry: { label: 'Berry Pink', main: '#EC4899', sole: '#FCE7F3' },
};

export const BASE_APPEARANCES: Record<BaseAppearanceId, string> = {
  cheerful: 'Cheerful Smile',
  curious: 'Curious Spark',
  friendly: 'Warm Grin',
  bold: 'Confident Gaze',
};

export const HAIR_STYLES: Record<HairStyleId, string> = {
  short: 'Short Crop',
  long: 'Long Flowing',
  curly: 'Curly Puff',
  bob: 'Sleek Bob',
  spiky: 'Spiky Tufts',
  pigtails: 'Twin Pigtails',
};

export const OUTFIT_STYLES: Record<OutfitStyleId, string> = {
  hoodie: 'Hoodie',
  jacket: 'Detective Jacket',
  polo: 'Polo Shirt',
  casual: 'Casual Tee',
  overalls: 'Overalls',
};

export const ACCESSORIES: Record<AccessoryId, string> = {
  none: 'None',
  glasses: 'Round Glasses',
  headband: 'Star Headband',
  cap: 'Detective Cap',
  backpack: 'Explorer Backpack',
  'magnifier-pin': 'Magnifier Badge',
};

export const SHOE_STYLES: Record<ShoeStyleId, string> = {
  trainers: 'Trainers',
  boots: 'Explorer Boots',
  casual: 'Casual Shoes',
};

interface DetectiveAvatarProps {
  config: AvatarConfig;
  view?: 'front' | 'right' | 'back' | 'left';
  pose?: 'idle' | 'walk' | 'wave';
  className?: string;
}

export const DetectiveAvatar: React.FC<DetectiveAvatarProps> = ({
  config,
  view = 'front',
  pose = 'idle',
  className = 'w-full h-full',
}) => {
  const skin = SKIN_TONES[config.skinTone] ?? SKIN_TONES.light;
  const hair = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS['dark-brown'];
  const outfit = OUTFIT_COLORS[config.outfitColor] ?? OUTFIT_COLORS.aqua;
  const shoe = SHOE_COLORS[config.shoesColor] ?? SHOE_COLORS.white;

  const isBack = view === 'back';
  const isSide = view === 'left' || view === 'right';
  const flipX = view === 'left' ? -1 : 1;

  const isWalking = pose === 'walk';
  const isWaving = pose === 'wave';

  return (
    <svg
      viewBox="0 0 180 240"
      className={className}
      role="img"
      aria-label="Customisable Junior Detective character"
    >
      {/* Ground Shadow */}
      <ellipse
        cx="90"
        cy="226"
        rx="40"
        ry="8"
        fill="#10375C"
        opacity="0.18"
        className={isWalking ? 'animate-walk-shadow' : ''}
      />

      <g
        transform={`translate(90, 0) scale(${flipX}, 1) translate(-90, 0)`}
      >
        <g className={isWalking ? 'animate-walk-bob' : ''}>
        {/* Explorer Backpack (behind torso when front/side, visible on back!) */}
        {config.accessory === 'backpack' && !isBack && (
          <g>
            <rect
              x="54"
              y="108"
              width="72"
              height="52"
              rx="14"
              fill="#D97706"
              stroke="#78350F"
              strokeWidth="3"
            />
            <rect x="60" y="114" width="60" height="14" rx="6" fill="#F59E0B" />
          </g>
        )}

        {/* Long Hair Back Layer */}
        {config.hairStyle === 'long' && !isBack && (
          <path
            d="M52,58 C44,82 46,122 54,134 L126,134 C134,122 136,82 128,58 Z"
            fill={hair.fill}
            stroke="#2B2420"
            strokeWidth="2.8"
          />
        )}
        {config.hairStyle === 'pigtails' && (
          <g fill={hair.fill} stroke="#2B2420" strokeWidth="2.8">
            <ellipse cx="45" cy="84" rx="11" ry="22" transform="rotate(14 45 84)" />
            <ellipse cx="135" cy="84" rx="11" ry="22" transform="rotate(-14 135 84)" />
            <circle cx="52" cy="68" r="4.5" fill={outfit.main} />
            <circle cx="128" cy="68" r="4.5" fill={outfit.main} />
          </g>
        )}

        {/* Back Arm (visible in side view for natural opposite arm swing) */}
        {isSide && (
          <g
            style={{ transformOrigin: '94px 114px' }}
            className={isWalking ? 'animate-walk-arm-b' : ''}
          >
            <path
              d="M94,114 L104,148"
              fill="none"
              stroke={outfit.dark}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <circle cx="104" cy="150" r="7" fill={skin.shade} stroke="#2B2420" strokeWidth="2.2" />
          </g>
        )}

        {/* Legs & Shoes (both front/back and side views have two distinct swinging legs!) */}
        <g>
          {/* Back / Left Leg */}
          <g
            style={{ transformOrigin: isSide ? '92px 160px' : '74px 160px' }}
            className={isWalking ? 'animate-walk-leg-a' : ''}
          >
            <rect
              x={isSide ? '82' : '64'}
              y="158"
              width="20"
              height="44"
              rx="8"
              fill={config.outfitStyle === 'overalls' ? outfit.dark : isSide ? '#1E293B' : '#334155'}
              stroke="#1E293B"
              strokeWidth="2.8"
            />
            {config.shoesStyle === 'boots' ? (
              <path
                d={`M${isSide ? 80 : 62},192 H${isSide ? 104 : 86} V212 Q${isSide ? 104 : 86},218 ${isSide ? 96 : 78},218 H${isSide ? 76 : 58} Q${isSide ? 76 : 58},208 ${isSide ? 80 : 62},204 Z`}
                fill={shoe.main}
                stroke="#1E293B"
                strokeWidth="2.8"
              />
            ) : (
              <rect
                x={isSide ? '78' : '58'}
                y="198"
                width="28"
                height="18"
                rx={config.shoesStyle === 'casual' ? '9' : '6'}
                fill={shoe.main}
                stroke="#1E293B"
                strokeWidth="2.8"
              />
            )}
            <rect
              x={isSide ? '78' : '58'}
              y="211"
              width="28"
              height="6"
              rx="3"
              fill={shoe.sole}
              stroke="#1E293B"
              strokeWidth="2"
            />
          </g>

          {/* Front / Right Leg */}
          <g
            style={{ transformOrigin: isSide ? '86px 160px' : '106px 160px' }}
            className={isWalking ? 'animate-walk-leg-b' : ''}
          >
            <rect
              x={isSide ? '76' : '96'}
              y="158"
              width="20"
              height="44"
              rx="8"
              fill={config.outfitStyle === 'overalls' ? outfit.dark : '#334155'}
              stroke="#1E293B"
              strokeWidth="2.8"
            />
            {config.shoesStyle === 'boots' ? (
              <path
                d={`M${isSide ? 74 : 94},192 H${isSide ? 98 : 118} V204 Q${isSide ? 102 : 122},208 ${isSide ? 102 : 122},218 H${isSide ? 82 : 102} Q${isSide ? 74 : 94},218 ${isSide ? 74 : 94},212 Z`}
                fill={shoe.main}
                stroke="#1E293B"
                strokeWidth="2.8"
              />
            ) : (
              <rect
                x={isSide ? '76' : '94'}
                y="198"
                width="28"
                height="18"
                rx={config.shoesStyle === 'casual' ? '9' : '6'}
                fill={shoe.main}
                stroke="#1E293B"
                strokeWidth="2.8"
              />
            )}
            <rect
              x={isSide ? '76' : '94'}
              y="211"
              width="28"
              height="6"
              rx="3"
              fill={shoe.sole}
              stroke="#1E293B"
              strokeWidth="2"
            />
          </g>
        </g>

        {/* Left / Front-Side Arm */}
        <g
          style={{ transformOrigin: isSide ? '86px 114px' : '58px 114px' }}
          className={isWalking ? 'animate-walk-arm-a' : ''}
        >
          <path
            d={isSide ? 'M86,114 L74,148' : 'M58,112 C46,124 44,142 50,152'}
            fill="none"
            stroke={outfit.dark}
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d={isSide ? 'M86,114 L74,148' : 'M58,112 C46,124 44,142 50,152'}
            fill="none"
            stroke={outfit.main}
            strokeWidth="10.5"
            strokeLinecap="round"
          />
          <circle cx={isSide ? '74' : '50'} cy={isSide ? '150' : '153'} r="7.5" fill={skin.fill} stroke="#2B2420" strokeWidth="2.4" />
        </g>

        {/* Torso / Outfit */}
        <g>
          <rect
            x={isSide ? '66' : '58'}
            y="102"
            width={isSide ? '48' : '64'}
            height="62"
            rx="16"
            fill={outfit.main}
            stroke="#1E293B"
            strokeWidth="3"
          />

          {/* Outfit Details */}
          {config.outfitStyle === 'hoodie' && !isBack && (
            <g>
              <path d="M74,104 Q90,118 106,104" fill="none" stroke={outfit.accent} strokeWidth="3.5" />
              <rect x="72" y="136" width="36" height="18" rx="7" fill={outfit.dark} opacity="0.55" />
              <line x1="84" y1="112" x2="84" y2="126" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="96" y1="112" x2="96" y2="126" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          )}

          {config.outfitStyle === 'jacket' && !isBack && (
            <g>
              <line x1="90" y1="103" x2="90" y2="163" stroke="#1E293B" strokeWidth="2.6" />
              <polygon points="74,104 90,122 80,104" fill={outfit.accent} />
              <polygon points="106,104 90,122 100,104" fill={outfit.accent} />
              <rect x="66" y="138" width="14" height="12" rx="3" fill={outfit.dark} />
              <rect x="100" y="138" width="14" height="12" rx="3" fill={outfit.dark} />
            </g>
          )}

          {config.outfitStyle === 'polo' && !isBack && (
            <g>
              <polygon points="74,102 90,116 106,102" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
              <circle cx="90" cy="122" r="2.2" fill="#FFFFFF" />
              <circle cx="90" cy="130" r="2.2" fill="#FFFFFF" />
            </g>
          )}

          {config.outfitStyle === 'overalls' && !isBack && (
            <g>
              <rect x="66" y="102" width="48" height="22" rx="6" fill="#FFFFFF" />
              <rect x="68" y="102" width="10" height="62" fill={outfit.dark} />
              <rect x="102" y="102" width="10" height="62" fill={outfit.dark} />
              <rect x="68" y="122" width="44" height="42" rx="8" fill={outfit.dark} />
              <circle cx="73" cy="126" r="2.6" fill="#FBBF24" />
              <circle cx="107" cy="126" r="2.6" fill="#FBBF24" />
            </g>
          )}

          {config.outfitStyle === 'casual' && !isBack && (
            <circle cx="90" cy="128" r="10" fill={outfit.accent} opacity="0.85" />
          )}

          {/* Magnifier Pin Accessory */}
          {config.accessory === 'magnifier-pin' && !isBack && (
            <g transform="translate(103, 120)">
              <circle cx="0" cy="0" r="6" fill="#FEF08A" stroke="#78350F" strokeWidth="2" />
              <line x1="4" y1="4" x2="8" y2="8" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* Right Arm (waves in wave pose, swings in opposite phase when walking!) */}
        {!isSide && (
          <g
            style={{ transformOrigin: '122px 114px' }}
            className={
              isWaving
                ? 'animate-[pusheenPawWave_1.2s_ease-in-out_infinite]'
                : isWalking
                  ? 'animate-walk-arm-b'
                  : ''
            }
          >
            <path
              d={isWaving ? 'M122,112 C136,100 144,82 140,70' : 'M122,112 C134,124 136,142 130,152'}
              fill="none"
              stroke={outfit.dark}
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d={isWaving ? 'M122,112 C136,100 144,82 140,70' : 'M122,112 C134,124 136,142 130,152'}
              fill="none"
              stroke={outfit.main}
              strokeWidth="10.5"
              strokeLinecap="round"
            />
            <circle
              cx={isWaving ? '140' : '130'}
              cy={isWaving ? '68' : '153'}
              r="7.5"
              fill={skin.fill}
              stroke="#2B2420"
              strokeWidth="2.4"
            />
          </g>
        )}

        {/* Explorer Backpack on Back View */}
        {config.accessory === 'backpack' && isBack && (
          <g>
            <rect
              x="58"
              y="106"
              width="64"
              height="52"
              rx="14"
              fill="#D97706"
              stroke="#78350F"
              strokeWidth="3"
            />
            <rect x="64" y="112" width="52" height="16" rx="7" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
            <circle cx="90" cy="134" r="5" fill="#FEF3C7" />
          </g>
        )}

        {/* Neck */}
        <rect x="81" y="90" width="18" height="16" rx="7" fill={skin.shade} />

        {/* Head */}
        <g>
          {/* Ears */}
          {!isSide && (
            <>
              <circle cx="52" cy="66" r="8" fill={skin.fill} stroke="#2B2420" strokeWidth="2.6" />
              <circle cx="128" cy="66" r="8" fill={skin.fill} stroke="#2B2420" strokeWidth="2.6" />
            </>
          )}

          {/* Face Circle */}
          <ellipse
            cx="90"
            cy="64"
            rx={isSide ? '31' : '36'}
            ry="34"
            fill={skin.fill}
            stroke="#2B2420"
            strokeWidth="3"
          />

          {/* Facial Features (Front & Side only) */}
          {!isBack && (
            <g transform={isSide ? 'translate(10, 0)' : ''}>
              {/* Rosy Cheeks */}
              <ellipse cx="68" cy="74" rx="5.5" ry="3.2" fill="#F48FB1" opacity="0.55" />
              {!isSide && <ellipse cx="112" cy="74" rx="5.5" ry="3.2" fill="#F48FB1" opacity="0.55" />}

              {/* Eyes & Brows by Base Appearance */}
              {config.baseStyle === 'curious' ? (
                <>
                  <path d="M68,52 Q74,47 80,52" fill="none" stroke="#2B2420" strokeWidth="2.4" strokeLinecap="round" />
                  {!isSide && (
                    <path d="M100,50 Q106,45 112,50" fill="none" stroke="#2B2420" strokeWidth="2.4" strokeLinecap="round" />
                  )}
                  <circle cx="74" cy="62" r="4.8" fill="#1E293B" />
                  <circle cx="72.5" cy="60.3" r="1.6" fill="#FFFFFF" />
                  {!isSide && (
                    <>
                      <circle cx="106" cy="62" r="4.8" fill="#1E293B" />
                      <circle cx="104.5" cy="60.3" r="1.6" fill="#FFFFFF" />
                    </>
                  )}
                </>
              ) : config.baseStyle === 'bold' ? (
                <>
                  <line x1="68" y1="53" x2="80" y2="55" stroke="#2B2420" strokeWidth="2.6" strokeLinecap="round" />
                  {!isSide && (
                    <line x1="112" y1="53" x2="100" y2="55" stroke="#2B2420" strokeWidth="2.6" strokeLinecap="round" />
                  )}
                  <circle cx="74" cy="63" r="4.5" fill="#1E293B" />
                  <circle cx="72.7" cy="61.5" r="1.4" fill="#FFFFFF" />
                  {!isSide && (
                    <>
                      <circle cx="106" cy="63" r="4.5" fill="#1E293B" />
                      <circle cx="104.7" cy="61.5" r="1.4" fill="#FFFFFF" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <circle cx="74" cy="63" r="4.6" fill="#1E293B" />
                  <circle cx="72.6" cy="61.4" r="1.6" fill="#FFFFFF" />
                  {!isSide && (
                    <>
                      <circle cx="106" cy="63" r="4.6" fill="#1E293B" />
                      <circle cx="104.6" cy="61.4" r="1.6" fill="#FFFFFF" />
                    </>
                  )}
                </>
              )}

              {/* Mouth */}
              {config.baseStyle === 'friendly' ? (
                <path
                  d="M80,77 Q90,85 100,77 Z"
                  fill="#F472B6"
                  stroke="#2B2420"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d={isSide ? 'M82,78 Q88,83 94,78' : 'M81,77 Q90,85 99,77'}
                  fill="none"
                  stroke="#2B2420"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              )}

              {/* Round Glasses Accessory */}
              {config.accessory === 'glasses' && (
                <g stroke="#1E293B" strokeWidth="2.4" fill="rgba(224,242,254,0.35)">
                  <circle cx="74" cy="63" r="9" />
                  {!isSide && (
                    <>
                      <circle cx="106" cy="63" r="9" />
                      <line x1="83" y1="63" x2="97" y2="63" />
                    </>
                  )}
                </g>
              )}
            </g>
          )}

          {/* Hairstyles */}
          {isBack ? (
            <path
              d={
                config.hairStyle === 'long'
                  ? 'M52,58 C46,85 48,125 56,134 L124,134 C132,125 134,85 128,58 C124,34 108,26 90,26 C72,26 56,34 52,58 Z'
                  : 'M53,62 C52,35 70,25 90,25 C110,25 128,35 127,62 C126,82 115,92 90,92 C65,92 54,82 53,62 Z'
              }
              fill={hair.fill}
              stroke="#2B2420"
              strokeWidth="2.8"
            />
          ) : (
            <g fill={hair.fill} stroke="#2B2420" strokeWidth="2.8" strokeLinejoin="round">
              {config.hairStyle === 'short' && (
                <path d="M54,58 C54,32 72,24 90,24 C108,24 126,32 126,58 C120,44 106,40 90,42 C74,40 60,44 54,58 Z" />
              )}
              {config.hairStyle === 'long' && (
                <path d="M53,58 C53,32 72,24 90,24 C108,24 127,32 127,58 C118,46 105,40 90,44 C75,40 62,46 53,58 Z" />
              )}
              {config.hairStyle === 'curly' && (
                <g>
                  <circle cx="64" cy="40" r="14" />
                  <circle cx="82" cy="31" r="15" />
                  <circle cx="102" cy="31" r="15" />
                  <circle cx="117" cy="41" r="14" />
                  <circle cx="56" cy="54" r="10" />
                  <circle cx="124" cy="54" r="10" />
                </g>
              )}
              {config.hairStyle === 'bob' && (
                <path d="M50,68 C48,36 68,24 90,24 C112,24 132,36 130,68 L124,84 C122,64 114,44 90,44 C66,44 58,64 56,84 Z" />
              )}
              {config.hairStyle === 'spiky' && (
                <path d="M54,58 L48,40 L66,44 L72,22 L90,34 L106,20 L114,42 L132,36 L126,58 C114,44 98,42 90,42 C82,42 66,44 54,58 Z" />
              )}
              {config.hairStyle === 'pigtails' && (
                <path d="M54,58 C54,32 72,24 90,24 C108,24 126,32 126,58 C118,44 104,40 90,44 C76,40 62,44 54,58 Z" />
              )}
            </g>
          )}

          {/* Star Headband Accessory */}
          {config.accessory === 'headband' && (
            <g>
              <path d="M56,48 Q90,28 124,48" fill="none" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
              <circle cx="110" cy="36" r="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
            </g>
          )}

          {/* Detective Cap Accessory */}
          {config.accessory === 'cap' && (
            <g transform="translate(54, 14)">
              <path
                d="M10,26 C10,10 24,2 36,2 C48,2 62,10 62,26 Z"
                fill="#B88456"
                stroke="#5D5048"
                strokeWidth="2.8"
              />
              <path d="M22,6 L20,25 M50,6 L52,25 M14,16 L58,16" stroke="#7D502D" strokeWidth="1.6" opacity="0.7" />
              <path d="M2,26 Q36,20 72,26 Q36,32 2,26 Z" fill="#9E6B40" stroke="#5D5048" strokeWidth="2.8" />
            </g>
          )}
        </g>
        </g>
      </g>
    </svg>
  );
};

interface DetectiveAvatarPortraitProps {
  config: AvatarConfig;
  className?: string;
}

export const DetectiveAvatarPortrait: React.FC<DetectiveAvatarPortraitProps> = ({
  config,
  className = 'w-11 h-11',
}) => {
  return (
    <svg viewBox="40 12 100 100" className={className} aria-hidden="true">
      <svg x="0" y="0" width="180" height="240" viewBox="0 0 180 240">
        <DetectiveAvatar config={config} view="front" pose="idle" />
      </svg>
    </svg>
  );
};
