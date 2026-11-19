import React from 'react';
import {
  Backpack,
  Check,
  Compass,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  Star,
  WifiOff,
  Loader2,
} from 'lucide-react';
import type {
  AvatarConfig,
  SaveSyncStatus,
  StudentGameState,
} from '../../types/game.ts';
import { playHoverTick, playSoftSelect } from '../../utils/soundEffects.ts';
import { DetectiveAvatarPortrait } from './DetectiveAvatar.tsx';

export type HudModalType = 'profile' | 'bag' | 'mission-tracker' | 'settings' | 'help';
export type SpotlightTarget = 'profile' | 'bag' | 'mission-tracker' | 'settings' | null;

interface GameHudProps {
  gameState: StudentGameState;
  saveStatus: SaveSyncStatus;
  spotlightTarget: SpotlightTarget;
  disabled?: boolean;
  onOpenModal: (modal: HudModalType) => void;
  onSpotlightBackdropClick?: () => void;
  onSignOut?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  gameState,
  saveStatus,
  spotlightTarget,
  disabled = false,
  onOpenModal,
  onSpotlightBackdropClick,
  onSignOut,
}) => {
  const avatar: AvatarConfig | null = gameState.avatarConfig;
  const nickname = gameState.detectiveNickname || 'Junior Detective';
  const totalBadges = gameState.inventory.badges.length;

  const isHighlighted = (target: SpotlightTarget) => spotlightTarget === target;

  const handleOpen = (modal: HudModalType) => {
    if (disabled) return;
    if (spotlightTarget && spotlightTarget !== modal && !(spotlightTarget === 'settings' && modal === 'help')) {
      onSpotlightBackdropClick?.();
      return;
    }
    playSoftSelect();
    onOpenModal(modal);
  };

  return (
    <>
      {/* Dimmed spotlight backdrop when guiding student to click a specific HUD control */}
      {spotlightTarget && (
        <div
          aria-hidden="true"
          onClick={onSpotlightBackdropClick}
          className="fixed inset-0 z-30 bg-[#0B2945]/45 backdrop-blur-[1.5px] transition-opacity"
        />
      )}

      <header
        aria-label="Game Interface HUD"
        className={`relative w-full px-2.5 sm:px-4 pt-2 sm:pt-2.5 pointer-events-none ${
          spotlightTarget ? 'z-40' : 'z-20'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-start justify-between gap-2 sm:gap-3">
          {/* TOP LEFT: Player Profile */}
          <div
            className={`pointer-events-auto transition-opacity ${
              isHighlighted('profile')
                ? 'relative z-50'
                : spotlightTarget
                  ? 'opacity-45'
                  : ''
            }`}
          >
            <button
              type="button"
              onClick={() => handleOpen('profile')}
              onMouseEnter={() => playHoverTick()}
              title="Open Player Profile"
              aria-label={`Open Player Profile for ${nickname}`}
              className={`aero-glass-card min-h-[48px] rounded-2xl border border-white/95 bg-white/90 hover:bg-white pl-2 pr-3.5 py-1.5 flex items-center gap-2.5 shadow-md transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer ${
                isHighlighted('profile') ? 'tutorial-spotlight-ring ring-4 ring-amber-300' : ''
              }`}
            >
              <div className="relative z-10 h-10 w-10 rounded-xl bg-gradient-to-b from-sky-100 to-cyan-200 border border-white flex items-center justify-center overflow-hidden shrink-0">
                {avatar ? (
                  <DetectiveAvatarPortrait config={avatar} className="w-10 h-10 block" />
                ) : (
                  <Sparkles className="h-5 w-5 text-sky-600" aria-hidden="true" />
                )}
              </div>
              <div className="relative z-10 text-left leading-tight">
                <p className="font-[var(--font-display)] text-xs sm:text-sm font-bold text-[#0E3558] max-w-[130px] sm:max-w-[170px] truncate">
                  {nickname}
                </p>
                <p className="text-[11px] font-extrabold text-[#0284C7] uppercase tracking-wider">
                  LEVEL {gameState.level}
                </p>
              </div>
            </button>
          </div>

          {/* TOP CENTRE: XP, Stars, Level & Mission Progress */}
          <div
            className={`pointer-events-auto order-3 lg:order-2 w-full lg:w-auto flex justify-center transition-opacity ${
              spotlightTarget ? 'opacity-45' : ''
            }`}
          >
            <div
              style={{
                background:
                  'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(226,247,255,0.9) 100%)',
              }}
              className="aero-glass-card rounded-2xl border border-white/95 px-3.5 py-1.5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 shadow-md"
            >
              <div className="relative z-10 flex items-center gap-1.5 text-xs font-extrabold text-[#0369A1]">
                <span className="rounded-lg bg-sky-100 px-2 py-0.5 border border-sky-200">
                  LEVEL {gameState.level}
                </span>
              </div>

              <div className="relative z-10 flex items-center gap-1 text-xs font-extrabold text-[#6D28D9]">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" aria-hidden="true" />
                <span>{gameState.xp} XP</span>
              </div>

              <div className="relative z-10 flex items-center gap-1 text-xs font-extrabold text-[#B45309]">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" aria-hidden="true" />
                <span>{gameState.stars} STARS</span>
              </div>

              <div className="relative z-10 hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#15803D] border-l border-sky-200 pl-3">
                <span>
                  {gameState.completedMissions.length > 0
                    ? `MISSIONS: ${gameState.completedMissions.length}/7`
                    : totalBadges > 0
                      ? `BADGES: ${totalBadges}`
                      : 'MISSION 01 READY'}
                </span>
              </div>
            </div>
          </div>

          {/* TOP RIGHT: Game Tools + Save Status + Log Out */}
          <div className="pointer-events-auto order-2 lg:order-3 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Detective Bag */}
              <div
                className={
                  isHighlighted('bag')
                    ? 'relative z-50'
                    : spotlightTarget
                      ? 'opacity-45'
                      : ''
                }
              >
                <button
                  type="button"
                  onClick={() => handleOpen('bag')}
                  onMouseEnter={() => playHoverTick()}
                  title="Detective Bag"
                  aria-label="Open Detective Bag"
                  className={`aero-glass-card min-h-[44px] min-w-[44px] rounded-2xl border border-white/95 bg-white/90 hover:bg-white px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0F766E] shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                    isHighlighted('bag') ? 'tutorial-spotlight-ring ring-4 ring-amber-300' : ''
                  }`}
                >
                  <Backpack className="h-4 w-4 text-[#0D9488]" aria-hidden="true" />
                  <span className="hidden md:inline">Bag</span>
                </button>
              </div>

              {/* Mission Tracker */}
              <div
                className={
                  isHighlighted('mission-tracker')
                    ? 'relative z-50'
                    : spotlightTarget
                      ? 'opacity-45'
                      : ''
                }
              >
                <button
                  type="button"
                  onClick={() => handleOpen('mission-tracker')}
                  onMouseEnter={() => playHoverTick()}
                  title="Mission Tracker"
                  aria-label="Open Mission Tracker"
                  className={`aero-glass-card min-h-[44px] min-w-[44px] rounded-2xl border border-white/95 bg-white/90 hover:bg-white px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                    isHighlighted('mission-tracker')
                      ? 'tutorial-spotlight-ring ring-4 ring-amber-300'
                      : ''
                  }`}
                >
                  <Compass className="h-4 w-4 text-[#7C3AED]" aria-hidden="true" />
                  <span className="hidden md:inline">Missions</span>
                </button>
              </div>

              {/* Settings */}
              <div
                className={
                  isHighlighted('settings')
                    ? 'relative z-50'
                    : spotlightTarget
                      ? 'opacity-45'
                      : ''
                }
              >
                <button
                  type="button"
                  onClick={() => handleOpen('settings')}
                  onMouseEnter={() => playHoverTick()}
                  title="Settings"
                  aria-label="Open Settings"
                  className={`aero-glass-card min-h-[44px] min-w-[44px] rounded-2xl border border-white/95 bg-white/90 hover:bg-white px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0369A1] shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                    isHighlighted('settings') ? 'tutorial-spotlight-ring ring-4 ring-amber-300' : ''
                  }`}
                >
                  <Settings className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
                  <span className="hidden xl:inline">Settings</span>
                </button>
              </div>

              {/* Help */}
              <button
                type="button"
                onClick={() => handleOpen('help')}
                onMouseEnter={() => playHoverTick()}
                title="Help & Tutorial Guide"
                aria-label="Open Help"
                className={`aero-glass-card min-h-[44px] min-w-[44px] rounded-2xl border border-white/95 bg-white/90 hover:bg-white px-2.5 py-1.5 flex items-center gap-1 text-xs font-bold text-[#DB2777] shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                  spotlightTarget ? 'opacity-45' : ''
                }`}
              >
                <HelpCircle className="h-4 w-4 text-[#EC4899]" aria-hidden="true" />
                <span className="hidden xl:inline">Help</span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out back to Portal"
                  aria-label="Sign out"
                  className={`aero-glass-card min-h-[44px] min-w-[44px] rounded-2xl border border-white/95 bg-white/85 hover:bg-white px-2.5 py-1.5 flex items-center gap-1 text-xs font-bold text-[#475569] shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                    spotlightTarget ? 'opacity-45' : ''
                  }`}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Real Save Sync Status Indicator */}
            {saveStatus !== 'idle' && (
              <div
                aria-live="polite"
                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border shadow-xs inline-flex items-center gap-1 ${
                  saveStatus === 'saving'
                    ? 'bg-sky-50/90 border-sky-200 text-[#0369A1]'
                    : saveStatus === 'saved'
                      ? 'bg-emerald-50/90 border-emerald-200 text-[#15803D]'
                      : 'bg-amber-50/95 border-amber-300 text-[#B45309]'
                }`}
              >
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    <span>SAVING...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>SAVED</span>
                  </>
                )}
                {saveStatus === 'offline' && (
                  <>
                    <WifiOff className="h-3 w-3" aria-hidden="true" />
                    <span>OFFLINE – SAVED LOCALLY</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
