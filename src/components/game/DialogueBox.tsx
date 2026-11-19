import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type {
  AvatarConfig,
  DialogueCharacterId,
  DialogueChoice,
  DialogueExpression,
  GameSettings,
} from '../../types/game.ts';
import { playSoftSelect } from '../../utils/soundEffects.ts';
import { DetectiveAvatarPortrait } from './DetectiveAvatar.tsx';
import { PusheenIllustration } from './PusheenIllustration.tsx';

interface DialogueBoxProps {
  speaker: DialogueCharacterId;
  speakerName?: string;
  playerNickname?: string;
  playerAvatar?: AvatarConfig | null;
  expression?: DialogueExpression;
  text: string;
  choices?: DialogueChoice[];
  settings: GameSettings;
  showNextButton?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  onChoiceSelect?: (choice: DialogueChoice) => void;
  onReplay?: () => void;
}

const CHARACTER_META: Record<
  DialogueCharacterId,
  { defaultName: string; accent: string; badgeBg: string }
> = {
  pusheen: {
    defaultName: 'DETECTIVE PUSHEEN',
    accent: 'text-[#0369A1]',
    badgeBg: 'from-sky-100 to-cyan-50 border-sky-200',
  },
  player: {
    defaultName: 'JUNIOR DETECTIVE',
    accent: 'text-[#6D28D9]',
    badgeBg: 'from-purple-100 to-pink-50 border-purple-200',
  },
  aina: {
    defaultName: 'AINA',
    accent: 'text-[#DB2777]',
    badgeBg: 'from-pink-100 to-rose-50 border-pink-200',
  },
  daniel: {
    defaultName: 'DANIEL',
    accent: 'text-[#15803D]',
    badgeBg: 'from-emerald-100 to-lime-50 border-emerald-200',
  },
  byte: {
    defaultName: 'BYTE THE ROBOT',
    accent: 'text-[#0284C7]',
    badgeBg: 'from-cyan-100 to-sky-50 border-cyan-200',
  },
  'teacher-chelsea': {
    defaultName: 'TEACHER CHELSEA',
    accent: 'text-[#0D9488]',
    badgeBg: 'from-teal-100 to-emerald-50 border-teal-200',
  },
  'ainas-mother': {
    defaultName: "AINA'S MOTHER",
    accent: 'text-[#9333EA]',
    badgeBg: 'from-fuchsia-100 to-purple-50 border-fuchsia-200',
  },
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  speakerName,
  playerNickname,
  playerAvatar,
  expression = 'happy',
  text,
  choices,
  settings,
  showNextButton = true,
  nextLabel = 'NEXT',
  onNext,
  onChoiceSelect,
  onReplay,
}) => {
  const [revealedCount, setRevealedCount] = useState(text.length);

  useEffect(() => {
    if (settings.reducedMotion) {
      setRevealedCount(text.length);
    } else {
      setRevealedCount(0);
      const timer = window.setInterval(() => {
        setRevealedCount((prev) => {
          if (prev >= text.length) {
            window.clearInterval(timer);
            return text.length;
          }
          return prev + 2;
        });
      }, 22);
      return () => window.clearInterval(timer);
    }
  }, [text, settings.reducedMotion]);

  const isTyping = revealedCount < text.length;
  const visibleText = text.slice(0, revealedCount);

  const meta = CHARACTER_META[speaker];
  const resolvedName =
    speaker === 'player' && playerNickname
      ? playerNickname.toUpperCase()
      : speakerName?.toUpperCase() || meta.defaultName;

  const textSizeClass =
    settings.textSize === 'large'
      ? 'text-base sm:text-lg'
      : settings.textSize === 'small'
        ? 'text-xs sm:text-sm'
        : 'text-sm sm:text-base';

  const handleBoxAdvance = () => {
    if (isTyping) {
      setRevealedCount(text.length);
      return;
    }
    if (!choices?.length && onNext) {
      playSoftSelect();
      onNext();
    }
  };

  if (!settings.subtitles && !choices?.length && !showNextButton) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={`${resolvedName} dialogue`}
      className="w-full max-w-3xl mx-auto px-3 sm:px-4"
    >
      <div
        style={{
          background:
            'linear-gradient(155deg, rgba(255,255,255,0.94) 0%, rgba(232,248,255,0.92) 100%)',
        }}
        className="aero-glass-card rounded-[24px] border border-white/95 p-3.5 sm:p-5 shadow-[0_18px_40px_-10px_rgba(16,55,92,0.28)]"
      >
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          {/* Character Portrait */}
          <div
            className={`shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-b ${meta.badgeBg} border flex items-center justify-center p-1 shadow-sm`}
          >
            {speaker === 'pusheen' ? (
              <PusheenIllustration expression={expression} className="w-full h-full" />
            ) : speaker === 'player' && playerAvatar ? (
              <DetectiveAvatarPortrait config={playerAvatar} className="w-full h-full" />
            ) : (
              <Sparkles className={`h-8 w-8 ${meta.accent}`} aria-hidden="true" />
            )}
          </div>

          {/* Speech Text & Actions */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`font-[var(--font-display)] text-xs sm:text-sm font-bold tracking-wider ${meta.accent}`}>
                  {resolvedName}
                </span>
                <span className="text-[11px] font-semibold text-[#5B7A96] capitalize">
                  · {expression}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onReplay && (
                  <button
                    type="button"
                    onClick={() => {
                      playSoftSelect();
                      onReplay();
                    }}
                    aria-label="Replay instructions"
                    title="Replay instructions"
                    className="h-8 px-2.5 rounded-full bg-white/80 hover:bg-white border border-sky-100 text-[11px] font-bold text-[#0369A1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden sm:inline">Replay</span>
                  </button>
                )}
              </div>
            </div>

            {settings.subtitles ? (
              <p
                onClick={isTyping ? () => setRevealedCount(text.length) : undefined}
                className={`${textSizeClass} font-semibold text-[#0E3558] leading-relaxed ${
                  isTyping ? 'cursor-pointer' : ''
                }`}
              >
                {visibleText}
                {isTyping && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-sky-500 animate-pulse" />
                )}
              </p>
            ) : (
              <p className="text-xs italic text-[#4A6075]">
                (Subtitles are hidden in Settings — turn Subtitles On in Settings to read dialogue text.)
              </p>
            )}

            {/* Choices or Next Button */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {isTyping && (
                <button
                  type="button"
                  onClick={() => setRevealedCount(text.length)}
                  className="text-xs font-bold text-[#0284C7] hover:underline px-2 py-1 cursor-pointer"
                >
                  Skip typing
                </button>
              )}

              {!isTyping && choices && choices.length > 0 ? (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        playSoftSelect();
                        onChoiceSelect?.(choice);
                      }}
                      className="aero-glossy-btn min-h-[40px] rounded-full bg-gradient-to-b from-[#2AB2DF] to-[#0E83B5] hover:from-[#36BDE9] hover:to-[#1190C6] px-4 py-1.5 text-xs sm:text-sm font-bold text-white cursor-pointer transition-transform active:scale-95"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              ) : (
                showNextButton &&
                onNext && (
                  <button
                    type="button"
                    onClick={handleBoxAdvance}
                    className="aero-glossy-btn min-h-[40px] rounded-full bg-gradient-to-b from-[#2AB2DF] to-[#0E83B5] hover:from-[#36BDE9] hover:to-[#1190C6] px-4 py-1.5 text-xs sm:text-sm font-bold text-white inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>{isTyping ? 'FINISH' : nextLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
