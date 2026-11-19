import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  CheckCircle2,
  DoorOpen,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import {
  TOWN_BUILDINGS,
  findPathBetweenNodes,
  resolveWalkableClick,
} from '../../data/townData.ts';
import type {
  AvatarConfig,
  AvatarPosition,
  BuildingDefinition,
  BuildingId,
  DialogueExpression,
} from '../../types/game.ts';
import { playBackClick, playErrorTone, playHoverTick, playPortalOpen, playSoftSelect } from '../../utils/soundEffects.ts';
import type { CustomMapMedia } from '../../utils/customMapStorage.ts';
import { DetectiveAvatar } from './DetectiveAvatar.tsx';
import { PusheenIllustration } from './PusheenIllustration.tsx';
import { TownMapScene } from './TownMapScene.tsx';

export type CameraFocus = 'sky' | 'hills' | 'stream' | 'nature' | 'town' | 'plaza' | 'hq';

export type TownPusheenState = 'hidden' | 'peeking' | 'beside-player' | 'following-hq';

interface TownEnvironmentProps {
  avatarConfig: AvatarConfig;
  nickname: string;
  position: AvatarPosition;
  unlockedBuildings: BuildingId[];
  discoveredBuildings?: BuildingId[];
  showDiscoveryBadges?: boolean;
  cameraFocus: CameraFocus;
  reducedMotion: boolean;
  allowMovement: boolean;
  allowBuildingClicks: boolean;
  highlightPathway?: boolean;
  highlightHq?: boolean;
  hqIlluminated?: boolean;
  hqDoorOpen?: boolean;
  showRustleBehindTree?: boolean;
  customMapMedia?: CustomMapMedia | null;
  pusheenState: TownPusheenState;
  pusheenExpression?: DialogueExpression;
  pusheenPose?: 'normal' | 'waving' | 'peeking' | 'celebrating';
  avatarOverridePose?: 'idle' | 'walk' | 'wave';
  selectedBuilding: BuildingDefinition | null;
  lockedFeedbackBuildingId?: BuildingId | null;
  onPositionChange: (nextPos: AvatarPosition) => void;
  onMovementCompleted?: () => void;
  onOffPathClick?: () => void;
  onSelectBuilding: (building: BuildingDefinition) => void;
  onCloseBuildingModal: () => void;
  onEnterBuilding?: (building: BuildingDefinition) => void;
}

const CAMERA_TRANSFORM: Record<CameraFocus, string> = {
  sky: 'scale(1.42) translate3d(0%, 18%, 0)',
  hills: 'scale(1.36) translate3d(5%, 8%, 0)',
  stream: 'scale(1.45) translate3d(-18%, -12%, 0)',
  nature: 'scale(1.42) translate3d(16%, -12%, 0)',
  town: 'scale(1) translate3d(0%, 0%, 0)',
  plaza: 'scale(1.3) translate3d(3%, -14%, 0)',
  hq: 'scale(1.38) translate3d(20%, 4%, 0)',
};

export const TownEnvironment: React.FC<TownEnvironmentProps> = ({
  avatarConfig,
  nickname,
  position,
  unlockedBuildings,
  discoveredBuildings = [],
  showDiscoveryBadges = false,
  cameraFocus,
  reducedMotion,
  allowMovement,
  allowBuildingClicks,
  highlightPathway = false,
  highlightHq = false,
  hqIlluminated = false,
  hqDoorOpen = false,
  showRustleBehindTree = false,
  customMapMedia = null,
  pusheenState,
  pusheenExpression = 'happy',
  pusheenPose = 'normal',
  avatarOverridePose,
  selectedBuilding,
  lockedFeedbackBuildingId,
  onPositionChange,
  onMovementCompleted,
  onOffPathClick,
  onSelectBuilding,
  onCloseBuildingModal,
  onEnterBuilding,
}) => {
  const mapStageRef = useRef<HTMLDivElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);

  const [hoveredBuildingId, setHoveredBuildingId] = useState<BuildingId | null>(null);
  const [avatarPose, setAvatarPose] = useState<'idle' | 'walk' | 'wave'>('idle');
  const [avatarView, setAvatarView] = useState<'front' | 'right' | 'back' | 'left'>('front');
  const [walkStepDurationMs, setWalkStepDurationMs] = useState<number>(320);
  const [destinationRing, setDestinationRing] = useState<{ x: number; y: number } | null>(null);
  const [wobbleBuildingId, setWobbleBuildingId] = useState<BuildingId | null>(null);

  const walkCancelRef = useRef<number>(0);

  useEffect(() => {
    if (lockedFeedbackBuildingId) {
      setWobbleBuildingId(lockedFeedbackBuildingId);
      const t = window.setTimeout(() => setWobbleBuildingId(null), 550);
      return () => window.clearTimeout(t);
    }
  }, [lockedFeedbackBuildingId]);

  // Auto-pan mobile scrollable container toward focus area
  useEffect(() => {
    const el = scrollWrapRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const targetFrac =
      cameraFocus === 'hq'
        ? 0.1
        : cameraFocus === 'stream'
          ? 0.82
          : cameraFocus === 'nature'
            ? 0.22
            : 0.48;
    const targetLeft = (el.scrollWidth - el.clientWidth) * targetFrac;
    el.scrollTo({ left: targetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [cameraFocus, reducedMotion]);

  // Animate multi-waypoint walk along walkable stone path with constant speed per waypoint
  const walkAlongPath = (targetX: number, targetY: number, targetNodeId: string) => {
    const startNodeId = position.nodeId || 'plaza-center';
    const pathNodes = findPathBetweenNodes(startNodeId, targetNodeId);
    const waypoints: Array<{ x: number; y: number; nodeId: string }> = [
      ...pathNodes.map((n) => ({ x: n.x, y: n.y, nodeId: n.id })),
      { x: targetX, y: targetY, nodeId: targetNodeId },
    ];

    const walkId = Date.now();
    walkCancelRef.current = walkId;
    setDestinationRing({ x: targetX, y: targetY });
    setAvatarPose('walk');

    let stepIdx = 0;
    const stepNext = (currX: number, currY: number) => {
      if (walkCancelRef.current !== walkId) return;
      if (stepIdx >= waypoints.length) {
        setAvatarPose('idle');
        setAvatarView('front');
        setDestinationRing(null);
        onMovementCompleted?.();
        return;
      }

      const nextPt = waypoints[stepIdx];
      const dx = nextPt.x - currX;
      const dy = nextPt.y - currY;
      if (Math.abs(dx) > Math.abs(dy)) {
        setAvatarView(dx >= 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > 1) {
        setAvatarView(dy < 0 ? 'back' : 'front');
      }

      const distance = Math.hypot(dx, dy);
      const durationMs = reducedMotion ? 40 : Math.max(140, Math.min(720, Math.round(distance * 26)));
      setWalkStepDurationMs(durationMs);
      onPositionChange(nextPt);
      stepIdx += 1;

      window.setTimeout(() => {
        stepNext(nextPt.x, nextPt.y);
      }, durationMs);
    };

    stepNext(position.x, position.y);
  };

  // Optional keyboard WASD / Arrow-key movement along walkable stone network
  useEffect(() => {
    if (!allowMovement) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBuilding) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      let dirX = 0;
      let dirY = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dirY = -1;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dirY = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dirX = -1;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dirX = 1;

      if (dirX === 0 && dirY === 0) return;
      e.preventDefault();

      const candidateX = Math.max(4, Math.min(90, position.x + dirX * 5));
      const candidateY = Math.max(42, Math.min(88, position.y + dirY * 5));
      const snapped = resolveWalkableClick(candidateX, candidateY, 9.5);
      if (snapped) {
        playSoftSelect();
        if (dirX !== 0) setAvatarView(dirX > 0 ? 'right' : 'left');
        else setAvatarView(dirY < 0 ? 'back' : 'front');
        setWalkStepDurationMs(reducedMotion ? 40 : 210);
        setAvatarPose('walk');
        onPositionChange({ x: snapped.x, y: snapped.y, nodeId: snapped.nearestNodeId });
        onMovementCompleted?.();
        window.setTimeout(() => setAvatarPose('idle'), 230);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allowMovement, selectedBuilding, position, reducedMotion, onPositionChange, onMovementCompleted]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowMovement || !mapStageRef.current) return;
    const rect = mapStageRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const valid = resolveWalkableClick(xPct, yPct, 8.0);
    if (!valid) {
      playErrorTone();
      onOffPathClick?.();
      return;
    }

    playSoftSelect();
    walkAlongPath(valid.x, valid.y, valid.nearestNodeId);
  };

  const activeAvatarPose = avatarOverridePose ?? avatarPose;

  // Pusheen position inside Detective Town
  const pusheenCoords =
    pusheenState === 'peeking'
      ? { x: 25.5, y: 45.5 }
      : pusheenState === 'following-hq'
        ? { x: 22.5, y: 55 }
        : { x: Math.min(89, position.x + 6.5), y: position.y + 0.5 };

  const selectedIsUnlocked = selectedBuilding
    ? unlockedBuildings.includes(selectedBuilding.id)
    : false;

  const isCustomVideo = Boolean(customMapMedia?.mimeType.startsWith('video/'));

  return (
    <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#2FAEEB] via-[#7DD5FA] to-[#53C4F7]">
      {/* Touch-pannable container on narrow mobile screens (zero page horizontal overflow) */}
      <div
        ref={scrollWrapRef}
        className="w-full h-full overflow-x-auto md:overflow-hidden overflow-y-hidden flex items-center justify-start md:justify-center"
      >
        <div
          ref={mapStageRef}
          onClick={handleMapClick}
          style={{
            transform: CAMERA_TRANSFORM[cameraFocus],
            transition: reducedMotion
              ? 'none'
              : 'transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="relative min-w-[920px] md:min-w-0 w-full max-w-[1440px] aspect-[1817/866] select-none overflow-hidden rounded-none md:rounded-2xl shadow-[0_20px_50px_rgba(14,53,88,0.28)]"
        >
          {/* LAYER 1: Recreated Vibrant Smooth Animated Town Scene OR User-Selected Custom GIF / Looping Video */}
          {customMapMedia ? (
            isCustomVideo ? (
              <video
                src={customMapMedia.url}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              />
            ) : (
              <img
                src={customMapMedia.url}
                alt="Custom animated Digital Detective Town map"
                draggable={false}
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              />
            )
          ) : (
            <TownMapScene
              highlightPathway={highlightPathway}
              hqIlluminated={hqIlluminated}
              hqDoorOpen={hqDoorOpen}
              showRustleBehindTree={showRustleBehindTree}
            />
          )}

          {/* Pathway Tutorial Prompt Banner (Scene 11) */}
          {highlightPathway && (
            <div className="absolute left-1/2 top-[77%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="rounded-full bg-amber-300/95 border-2 border-white px-4 py-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#1E1B4B] shadow-lg animate-bounce whitespace-nowrap">
                CLICK THE GLOWING PATHWAY TO MOVE YOUR CHARACTER!
              </div>
            </div>
          )}

          {/* Destination Ripple Ring */}
          {destinationRing && (
            <div
              aria-hidden="true"
              style={{ left: `${destinationRing.x}%`, top: `${destinationRing.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border-4 border-amber-300 bg-sky-200/40 animate-ping pointer-events-none"
            />
          )}

          {/* LAYER 3: Interactive Hotspots Aligned Over All Seven Buildings in the Map Artwork */}
          {TOWN_BUILDINGS.map((building) => {
            const isUnlocked = unlockedBuildings.includes(building.id);
            const isDiscovered = discoveredBuildings.includes(building.id);
            const isHovered = hoveredBuildingId === building.id;
            const isTargetHq = highlightHq && building.id === 'detective-hq';
            const isWobbling = wobbleBuildingId === building.id;

            return (
              <div
                key={building.id}
                style={{ left: `${building.x}%`, top: `${building.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 w-[16%] h-[23%]"
              >
                {/* Animated Pointer Arrow for Scene 12 HQ Tutorial */}
                {isTargetHq && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                    <span className="rounded-full bg-amber-300 border-2 border-white px-3 py-0.5 text-[11px] font-extrabold text-[#1E1B4B] shadow-md whitespace-nowrap mb-0.5">
                      CLICK DETECTIVE HQ!
                    </span>
                    <ArrowDown className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] animate-bounce" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!allowBuildingClicks) return;
                    playSoftSelect();
                    onSelectBuilding(building);
                  }}
                  onMouseEnter={() => {
                    setHoveredBuildingId(building.id);
                    if (allowBuildingClicks) playHoverTick();
                  }}
                  onMouseLeave={() => setHoveredBuildingId(null)}
                  onFocus={() => setHoveredBuildingId(building.id)}
                  onBlur={() => setHoveredBuildingId(null)}
                  disabled={!allowBuildingClicks}
                  aria-label={`${building.name} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
                  className={`relative w-full h-full rounded-3xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
                    allowBuildingClicks
                      ? 'cursor-pointer hover:bg-white/15 hover:ring-3 hover:ring-white/80 active:scale-95'
                      : 'cursor-default'
                  } ${
                    isTargetHq
                      ? 'tutorial-spotlight-ring ring-4 ring-amber-300 bg-amber-200/20'
                      : ''
                  } ${isWobbling ? 'animate-lock-wobble' : ''}`}
                >
                  {/* Compact Corner Status Badge (Unlocked / Locked + Discovery Check) */}
                  <span
                    className={`absolute -top-2 right-1 rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wide shadow-sm whitespace-nowrap inline-flex items-center gap-1 transition-transform ${
                      isHovered || isTargetHq ? 'scale-105 bg-white' : 'bg-white/92'
                    } ${
                      isUnlocked
                        ? 'border-emerald-300 text-[#15803D]'
                        : 'border-slate-200 text-[#475569]'
                    }`}
                  >
                    {isUnlocked ? (
                      <Unlock className="h-2.5 w-2.5 text-[#16A34A]" aria-hidden="true" />
                    ) : (
                      <Lock className="h-2.5 w-2.5 text-[#64748B]" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">
                      {isUnlocked ? 'OPEN' : 'LOCKED'}
                    </span>
                    {showDiscoveryBadges && isDiscovered && (
                      <CheckCircle2 className="h-3 w-3 text-[#0284C7]" aria-label="Inspected" />
                    )}
                  </span>

                  {/* Hover Tooltip Name Label */}
                  {isHovered && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#0E3558]/90 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none">
                      {building.name}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* LAYER 4: Player's Customised Avatar + Nickname Badge */}
          <div
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transition: reducedMotion
                ? 'none'
                : `left ${walkStepDurationMs}ms linear, top ${walkStepDurationMs}ms linear`,
            }}
            className="absolute -translate-x-1/2 -translate-y-[84%] z-20 flex flex-col items-center pointer-events-none"
          >
            <div className="mb-0.5 rounded-full bg-white/94 border border-purple-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-[#6D28D9] shadow-sm whitespace-nowrap">
              {nickname}
            </div>
            <div className="w-12 h-16 sm:w-16 sm:h-22 drop-shadow-[0_4px_8px_rgba(0,0,0,0.28)]">
              <DetectiveAvatar config={avatarConfig} view={avatarView} pose={activeAvatarPose} />
            </div>
          </div>

          {/* LAYER 5: Detective Pusheen Companion Inside Detective Town */}
          {pusheenState !== 'hidden' && (
            <div
              style={{
                left: `${pusheenCoords.x}%`,
                top: `${pusheenCoords.y}%`,
                transition: reducedMotion
                  ? 'none'
                  : 'left 850ms cubic-bezier(0.22, 1, 0.36, 1), top 850ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="absolute -translate-x-1/2 -translate-y-[80%] z-20 flex flex-col items-center pointer-events-none"
            >
              <div className="mb-0.5 rounded-full bg-sky-50/95 border border-sky-200 px-2 py-0.5 text-[10px] font-extrabold text-[#0369A1] shadow-xs whitespace-nowrap">
                Detective Pusheen
              </div>
              <div className="w-14 h-12 sm:w-16 sm:h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.24)]">
                <PusheenIllustration expression={pusheenExpression} pose={pusheenPose} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BUILDING INFORMATION CARD MODAL */}
      {selectedBuilding && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedBuilding.name} information`}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0B2945]/45 backdrop-blur-xs"
        >
          <div
            style={{
              background: selectedBuilding.glassGradient,
            }}
            className="aero-glass-card w-full max-w-lg rounded-[28px] border border-white p-5 sm:p-6 shadow-[0_24px_60px_-10px_rgba(16,55,92,0.4)]"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider mb-1 border ${
                      selectedIsUnlocked
                        ? 'bg-emerald-100 border-emerald-300 text-[#15803D]'
                        : 'bg-slate-100 border-slate-300 text-[#475569]'
                    }`}
                  >
                    {selectedIsUnlocked ? (
                      <>
                        <Unlock className="h-3 w-3" aria-hidden="true" />
                        <span>STATUS: UNLOCKED</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        <span>STATUS: LOCKED</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-[var(--font-display)] text-xl font-bold text-[#0E3558]">
                    {selectedBuilding.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playBackClick();
                    onCloseBuildingModal();
                  }}
                  aria-label="Close building card"
                  className="h-9 w-9 rounded-full bg-white/90 hover:bg-white border border-sky-200 text-[#0E3558] flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-2xl bg-white/90 border border-white p-3.5 text-sm font-semibold text-[#0E3558]">
                {selectedBuilding.description}
              </div>

              {/* Pusheen feedback inside Building Card */}
              <div className="rounded-2xl bg-sky-50/95 border border-sky-200 p-3.5 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0">
                  <PusheenIllustration
                    expression={selectedIsUnlocked ? 'excited' : 'encouraging'}
                  />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#0E3558] space-y-1">
                  <p>
                    <strong>Detective Pusheen:</strong> &ldquo;{selectedBuilding.pusheenLine}&rdquo;
                  </p>
                  {!selectedIsUnlocked && (
                    <p className="text-[#6D28D9]">
                      &ldquo;Not yet, Detective! We still have some important clues to discover before
                      we can visit this place.&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playBackClick();
                    onCloseBuildingModal();
                  }}
                  className="min-h-[42px] rounded-full bg-white/90 hover:bg-white border border-sky-200 px-5 py-2 text-xs sm:text-sm font-bold text-[#0E3558] cursor-pointer"
                >
                  {selectedIsUnlocked ? 'KEEP EXPLORING' : 'GOT IT'}
                </button>

                {selectedIsUnlocked && onEnterBuilding && (
                  <button
                    type="button"
                    onClick={() => {
                      playPortalOpen();
                      onEnterBuilding(selectedBuilding);
                    }}
                    className="aero-glossy-btn min-h-[44px] rounded-full bg-gradient-to-b from-[#34D399] to-[#16A34A] hover:from-[#4ADE80] hover:to-[#15803D] px-6 py-2 text-xs sm:text-sm font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <DoorOpen className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {selectedBuilding.id === 'detective-hq'
                        ? 'ENTER DETECTIVE HQ'
                        : `ENTER ${selectedBuilding.name}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
