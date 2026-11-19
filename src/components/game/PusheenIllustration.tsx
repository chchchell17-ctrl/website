import React from 'react';
import type { DialogueExpression } from '../../types/game.ts';

interface PusheenIllustrationProps {
  expression?: DialogueExpression;
  pose?: 'normal' | 'waving' | 'peeking' | 'celebrating';
  className?: string;
}

export const PusheenIllustration: React.FC<PusheenIllustrationProps> = ({
  expression = 'happy',
  pose = 'normal',
  className = 'w-full h-full',
}) => {
  const isCelebrating = expression === 'celebrating' || expression === 'excited' || pose === 'celebrating';
  const isThinking = expression === 'thinking' || expression === 'curious';
  const isSurprised = expression === 'surprised';
  const isWorried = expression === 'worried';

  return (
    <svg
      viewBox="0 0 180 160"
      className={className}
      role="img"
      aria-label={`Detective Pusheen looking ${expression}`}
    >
      {/* Celebration Sparkles */}
      {isCelebrating && (
        <g fill="#FBBF24" stroke="#B45309" strokeWidth="1.6">
          <path d="M28,42 L31,34 L34,42 L42,45 L34,48 L31,56 L28,48 L20,45 Z" />
          <path d="M148,36 L151,28 L154,36 L162,39 L154,42 L151,50 L148,42 L140,39 Z" />
        </g>
      )}

      {/* Question or Thought Bubble Accent */}
      {expression === 'curious' && (
        <text x="142" y="42" fontSize="24" fontWeight="800" fill="#DB2777" stroke="#FFFFFF" strokeWidth="1">
          ?
        </text>
      )}
      {expression === 'surprised' && (
        <text x="144" y="44" fontSize="24" fontWeight="800" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1">
          !
        </text>
      )}

      {/* Soft shadow */}
      <ellipse cx="92" cy="146" rx="54" ry="9" fill="#9E8BB8" opacity="0.28" />

      <g className="animate-pusheen-breathe">
        {/* Striped Tail */}
        <path
          d="M36,119 C14,120 8,102 20,94 C28,89 37,97 40,108"
          fill="#A69B91"
          stroke="#5D5048"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path d="M18,100 C21,102 23,107 22,111" stroke="#5D5048" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M27,97 C30,100 31,105 30,109" stroke="#5D5048" strokeWidth="3.5" strokeLinecap="round" />

        {/* Body & Ears */}
        <path
          d="M44,130
             C37,118 38,84 46,64
             L43,43
             C43,39 48,38 52,42
             L64,52
             C76,48 102,48 114,52
             L126,42
             C130,38 135,39 135,43
             L132,64
             C140,84 141,118 134,130
             C128,141 114,143 90,143
             C66,143 50,141 44,130 Z"
          fill="#A69B91"
          stroke="#5D5048"
          strokeWidth="4.2"
          strokeLinejoin="round"
        />

        {/* Stripes */}
        <path d="M41,98 L50,98 M40,109 L49,108" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />
        <path d="M137,98 L128,98 M138,109 L129,108" stroke="#6E5F56" strokeWidth="4" strokeLinecap="round" />

        {/* Bottom Paws */}
        <ellipse cx="64" cy="140" rx="8" ry="5" fill="#A69B91" stroke="#5D5048" strokeWidth="3.8" />
        <ellipse cx="116" cy="140" rx="8" ry="5" fill="#A69B91" stroke="#5D5048" strokeWidth="3.8" />

        {/* Head */}
        <g>
          <path d="M81,50 L81,60 M89,49 L89,62 M97,50 L97,60" stroke="#6E5F56" strokeWidth="3.8" strokeLinecap="round" />

          {/* Brown Plaid Deerstalker Hat */}
          <g transform="translate(65, 20)">
            <path d="M6,26 C6,10 17,4 25,4 C33,4 44,10 44,26 Z" fill="#B88456" stroke="#5D5048" strokeWidth="3.6" />
            <path d="M16,7 L14,25 M34,7 L36,25 M9,17 L41,17" stroke="#7D502D" strokeWidth="1.8" opacity="0.7" />
            <path d="M2,26 Q25,21 48,26 Q25,31 2,26 Z" fill="#9E6B40" stroke="#5D5048" strokeWidth="3.4" />
            <circle cx="25" cy="4" r="3.2" fill="#8C5932" stroke="#5D5048" strokeWidth="2.4" />
          </g>

          {/* Cheeks */}
          <ellipse cx="67" cy="80" rx="5.5" ry="3.2" fill="#F2ACB4" opacity="0.75" />
          <ellipse cx="111" cy="80" rx="5.5" ry="3.2" fill="#F2ACB4" opacity="0.75" />

          {/* Eyes by Expression */}
          {isCelebrating ? (
            <g fill="none" stroke="#3B2F2A" strokeWidth="3.2" strokeLinecap="round">
              <path d="M67,72 Q72,66 77,72" />
              <path d="M101,72 Q106,66 111,72" />
            </g>
          ) : isWorried ? (
            <g>
              <path d="M67,65 L76,68 M111,65 L102,68" stroke="#5D5048" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="72" cy="73" r="3.8" fill="#3B2F2A" />
              <circle cx="106" cy="73" r="3.8" fill="#3B2F2A" />
            </g>
          ) : (
            <g className="animate-pusheen-blink">
              <circle cx="72" cy="72" r={isSurprised ? '5' : '4'} fill="#3B2F2A" />
              <circle cx="70.8" cy="70.6" r="1.3" fill="#FFFFFF" />
              <circle cx="106" cy="72" r={isSurprised ? '5' : '4'} fill="#3B2F2A" />
              <circle cx="104.8" cy="70.6" r="1.3" fill="#FFFFFF" />
            </g>
          )}

          {/* Whiskers */}
          <path d="M35,70 L48,72 M34,79 L48,78" stroke="#5D5048" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M143,70 L130,72 M144,79 L130,78" stroke="#5D5048" strokeWidth="3.4" strokeLinecap="round" />

          {/* Mouth */}
          {isSurprised ? (
            <ellipse cx="89" cy="79" rx="4.5" ry="5.5" fill="#EE8E9D" stroke="#5D5048" strokeWidth="2.6" />
          ) : isWorried ? (
            <path d="M82,80 Q89,75 96,80" fill="none" stroke="#5D5048" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <>
              <path
                d="M82,74 Q85.5,79 89,74 Q92.5,79 96,74"
                fill="none"
                stroke="#5D5048"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {!isThinking && (
                <path
                  d="M85,77 C85,84 93,84 93,77 Z"
                  fill="#EE8E9D"
                  stroke="#5D5048"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
              )}
            </>
          )}
        </g>

        {/* Right Paw */}
        <g className={pose === 'waving' || isCelebrating ? 'animate-pusheen-paw' : ''}>
          <path
            d={
              pose === 'waving' || isCelebrating
                ? 'M126,106 C142,100 149,88 143,82 C138,77 128,87 122,96'
                : 'M122,104 C132,106 134,116 125,118'
            }
            fill="#A69B91"
            stroke="#5D5048"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
        </g>

        {/* Left Paw + Magnifying Glass */}
        <g className={pose === 'peeking' || expression === 'curious' ? 'animate-pusheen-glass' : ''}>
          <rect
            x="44"
            y="106"
            width="9"
            height="24"
            rx="4.5"
            transform="rotate(24 48 118)"
            fill="#9E6B43"
            stroke="#5D5048"
            strokeWidth="3.2"
          />
          <circle cx="57" cy="92" r="15.5" fill="#DDF4FC" fillOpacity="0.82" stroke="#5D5048" strokeWidth="4" />
          <circle cx="57" cy="92" r="12.5" fill="none" stroke="#B68052" strokeWidth="2.8" />
          <path d="M49,87 Q53,82 60,83" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <ellipse
            cx="51"
            cy="108"
            rx="8.5"
            ry="6.5"
            transform="rotate(-15 51 108)"
            fill="#A69B91"
            stroke="#5D5048"
            strokeWidth="3.6"
          />
        </g>
      </g>
    </svg>
  );
};
