import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  DoorOpen,
  Edit3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  TOWN_BUILDINGS,
  TOWN_PATH_NODES,
  WELCOME_DIALOGUE_SCRIPT,
} from '../../data/townData.ts';
import {
  buildInitialStudentStateFromSession,
  fetchStudentStateFromServer,
  saveStudentStateToServer,
} from '../../services/studentProgressApi.ts';
import type { StudentSession } from '../../types/auth.ts';
import type {
  AvatarConfig,
  AvatarPosition,
  BuildingDefinition,
  BuildingId,
  DialogueChoice,
  DialogueStep,
  GameSettings,
  SaveSyncStatus,
  StudentGameState,
} from '../../types/game.ts';
import {
  playLoginSuccess,
  playPortalOpen,
  playSoftSelect,
  setBackgroundMusicEnabled,
  setSoundEnabled,
  stopNarration,
  unlockAudioOnFirstGesture,
} from '../../utils/soundEffects.ts';
import {
  type CustomMapMedia,
  clearCustomMapMedia,
  loadCustomMapMedia,
  saveCustomMapFile,
} from '../../utils/customMapStorage.ts';
import { CharacterCustomisation } from './CharacterCustomisation.tsx';
import { DetectiveAvatar } from './DetectiveAvatar.tsx';
import { DialogueBox } from './DialogueBox.tsx';
import { GameHud, type HudModalType, type SpotlightTarget } from './GameHud.tsx';
import { HudModals } from './HudModals.tsx';
import { PusheenIllustration } from './PusheenIllustration.tsx';
import {
  type CameraFocus,
  TownEnvironment,
  type TownPusheenState,
} from './TownEnvironment.tsx';

interface Screen02ExperienceProps {
  session: StudentSession;
  onSignOut: () => void;
}

type Screen02Stage =
  | 'customisation'
  | 'returning-welcome'
  | 'cinematic'
  | 'welcome-dialogue'
  | 'hud-intro'
  | 'tut-profile'
  | 'tut-bag'
  | 'tut-mission'
  | 'tut-settings'
  | 'explore-intro'
  | 'explore-buildings'
  | 'tut-movement'
  | 'tut-hq'
  | 'tut-complete'
  | 'hq-entrance'
  | 'town-free'
  | 'screen-03-handoff';

const CINEMATIC_SHOTS: Array<{
  focus: CameraFocus;
  caption: string;
  durationMs: number;
}> = [
  {
    focus: 'sky',
    caption: 'Look up at the bright blue sky and drifting white clouds...',
    durationMs: 2100,
  },
  {
    focus: 'hills',
    caption: 'Across the soft green rolling hills...',
    durationMs: 2000,
  },
  {
    focus: 'stream',
    caption: 'Past a crystal-clear stream full of colourful fish...',
    durationMs: 2100,
  },
  {
    focus: 'nature',
    caption: 'Through blooming flowers, butterflies and shady trees...',
    durationMs: 2100,
  },
  {
    focus: 'town',
    caption: 'Welcome to Detective Town, home to seven special locations!',
    durationMs: 2300,
  },
  {
    focus: 'plaza',
    caption: 'Right in front of Detective HQ, a brand-new detective arrives...',
    durationMs: 2200,
  },
];

const EXPLORE_INTRO_SCRIPT: DialogueStep[] = [
  {
    id: 'ex1',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'happy',
    text: "Wonderful! Now that you know how to use your detective tools, let's explore our town!",
  },
  {
    id: 'ex2',
    speaker: 'player',
    expression: 'curious',
    text: 'How many places are there?',
  },
  {
    id: 'ex3',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'excited',
    text: 'There are SEVEN special locations! Each one has a different mission waiting for you.',
  },
  {
    id: 'ex4',
    speaker: 'player',
    expression: 'curious',
    text: 'Can we visit all of them?',
  },
  {
    id: 'ex5',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'encouraging',
    text: 'Absolutely! But we need to complete our missions one by one. Click all seven buildings to learn what each one is for!',
  },
];

const TUT_BAG_INTRO_SCRIPT: DialogueStep[] = [
  {
    id: 'bag1',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'happy',
    text: 'Every detective needs a bag!',
  },
  {
    id: 'bag2',
    speaker: 'player',
    expression: 'curious',
    text: 'What do I keep inside?',
  },
  {
    id: 'bag3',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'encouraging',
    text: 'Your special items, badges and collectibles! You can check them whenever you want. Click your Detective Bag to open it!',
  },
];

const TUT_MOVEMENT_INTRO_SCRIPT: DialogueStep[] = [
  {
    id: 'mv1',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'happy',
    text: "Now, let's practise moving around!",
  },
  {
    id: 'mv2',
    speaker: 'player',
    expression: 'curious',
    text: 'How do I move?',
  },
  {
    id: 'mv3',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'encouraging',
    text: 'Simply click or tap a place on the pathway, and your character will walk towards it!',
  },
];

const TUT_COMPLETE_SCRIPT: DialogueStep[] = [
  {
    id: 'tc1',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'celebrating',
    text: 'Excellent work, Detective! You have created your character, discovered your detective tools and learned how to explore our town.',
  },
  {
    id: 'tc2',
    speaker: 'player',
    expression: 'curious',
    text: 'So, what happens now?',
  },
  {
    id: 'tc3',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'excited',
    text: "Now, our real adventure begins! There's a mystery waiting inside Detective HQ. And I think you're just the detective we need!",
  },
  {
    id: 'tc4',
    speaker: 'player',
    expression: 'excited',
    text: "Let's go!",
  },
  {
    id: 'tc5',
    speaker: 'pusheen',
    speakerName: 'Detective Pusheen',
    expression: 'happy',
    text: 'Follow me!',
  },
];

export const Screen02Experience: React.FC<Screen02ExperienceProps> = ({
  session,
  onSignOut,
}) => {
  const [gameState, setGameState] = useState<StudentGameState>(() =>
    buildInitialStudentStateFromSession(session)
  );
  const gameStateRef = useRef<StudentGameState>(gameState);
  gameStateRef.current = gameState;

  const [saveStatus, setSaveStatus] = useState<SaveSyncStatus>('idle');

  const isReturningOnStart = Boolean(
    session.progress.hasAvatar && buildInitialStudentStateFromSession(session).avatarConfig
  );

  const [stage, setStage] = useState<Screen02Stage>(() =>
    isReturningOnStart ? 'returning-welcome' : 'customisation'
  );
  const [isEditingExistingCharacter, setIsEditingExistingCharacter] = useState(false);

  // Cinematic Scene 02 state
  const [cinematicShotIdx, setCinematicShotIdx] = useState(0);
  const [arrivalLineIdx, setArrivalLineIdx] = useState<0 | 1 | 2>(0);

  // Welcome Conversation Scene 03 state
  const [welcomeSubStep, setWelcomeSubStep] = useState<'peeking' | 'dialogue'>('peeking');
  const [welcomeDialogueIdx, setWelcomeDialogueIdx] = useState(0);

  // Tutorial Spotlight Sub-phase
  const [tutPhase, setTutPhase] = useState<'intro' | 'await-click' | 'feedback'>('await-click');
  const [tutSubIdx, setTutSubIdx] = useState(0);
  const [activeModal, setActiveModal] = useState<HudModalType | null>(null);
  const [spotlightHintToast, setSpotlightHintToast] = useState(false);

  // Explore 7 Buildings & Movement & HQ state
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDefinition | null>(null);
  const [lockedFeedbackBuildingId, setLockedFeedbackBuildingId] = useState<BuildingId | null>(null);
  const [allBuildingsCheered, setAllBuildingsCheered] = useState(false);
  const [offPathWarning, setOffPathWarning] = useState(false);
  const [movementSucceeded, setMovementSucceeded] = useState(false);
  const [hqDialogueStep, setHqDialogueStep] = useState<'prompt' | 'ready-confirm'>('prompt');
  const [tutCompleteCardShown, setTutCompleteCardShown] = useState(false);

  // Scene 14 HQ Entrance animation state
  const [hqIlluminated, setHqIlluminated] = useState(false);
  const [hqDoorOpen, setHqDoorOpen] = useState(false);
  const [entranceFading, setEntranceFading] = useState(false);

  // Optional browser-saved custom animated map (.gif / .mp4)
  const [customMapMedia, setCustomMapMedia] = useState<CustomMapMedia | null>(null);
  const customMapUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadCustomMapMedia().then((media) => {
      if (!mounted) {
        if (media?.url) URL.revokeObjectURL(media.url);
        return;
      }
      if (media) {
        customMapUrlRef.current = media.url;
        setCustomMapMedia(media);
      }
    });
    return () => {
      mounted = false;
      if (customMapUrlRef.current) {
        URL.revokeObjectURL(customMapUrlRef.current);
        customMapUrlRef.current = null;
      }
    };
  }, []);

  const handleUploadCustomMap = useCallback(async (file: File) => {
    const saved = await saveCustomMapFile(file);
    if (customMapUrlRef.current) {
      URL.revokeObjectURL(customMapUrlRef.current);
    }
    customMapUrlRef.current = saved.url;
    setCustomMapMedia(saved);
  }, []);

  const handleResetCustomMap = useCallback(async () => {
    await clearCustomMapMedia();
    if (customMapUrlRef.current) {
      URL.revokeObjectURL(customMapUrlRef.current);
      customMapUrlRef.current = null;
    }
    setCustomMapMedia(null);
  }, []);

  // Persist helper
  const persistState = useCallback(
    async (nextState: StudentGameState) => {
      setGameState(nextState);
      gameStateRef.current = nextState;
      setSaveStatus('saving');
      const res = await saveStudentStateToServer(session, nextState);
      if (res.ok) {
        setGameState(res.state);
        gameStateRef.current = res.state;
        setSaveStatus('saved');
      } else {
        setSaveStatus('offline');
      }
    },
    [session]
  );

  // Sync fresher server state on mount if available
  useEffect(() => {
    let mounted = true;
    fetchStudentStateFromServer().then((res) => {
      if (!mounted || !res.ok || !res.state) return;
      if (res.state.updatedAt > gameStateRef.current.updatedAt) {
        setGameState(res.state);
        gameStateRef.current = res.state;
        if (res.state.avatarConfig && stage === 'customisation' && !isEditingExistingCharacter) {
          setStage('returning-welcome');
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [stage, isEditingExistingCharacter]);

  // Re-sync offline saved changes automatically when connectivity returns
  useEffect(() => {
    const handleOnline = () => {
      if (saveStatus === 'offline') {
        persistState(gameStateRef.current);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [saveStatus, persistState]);

  // Apply sound & music settings live and unlock audio cleanly on first gesture
  useEffect(() => {
    unlockAudioOnFirstGesture();
    setSoundEnabled(gameState.settings.soundEffects);
    setBackgroundMusicEnabled(gameState.settings.backgroundMusic);
  }, [gameState.settings.soundEffects, gameState.settings.backgroundMusic]);

  useEffect(() => {
    return () => {
      setBackgroundMusicEnabled(false);
      stopNarration();
    };
  }, []);

  // Cinematic auto-advance timer for Shots 1..6 -> Shot 7 Arrival
  useEffect(() => {
    if (stage !== 'cinematic' || arrivalLineIdx > 0) return;

    if (cinematicShotIdx < CINEMATIC_SHOTS.length) {
      const duration = gameState.settings.reducedMotion
        ? 900
        : CINEMATIC_SHOTS[cinematicShotIdx].durationMs;
      const timer = window.setTimeout(() => {
        if (cinematicShotIdx + 1 < CINEMATIC_SHOTS.length) {
          setCinematicShotIdx((prev) => prev + 1);
        } else {
          setCinematicShotIdx(CINEMATIC_SHOTS.length);
          setArrivalLineIdx(1);
        }
      }, duration);
      return () => window.clearTimeout(timer);
    }
  }, [stage, cinematicShotIdx, arrivalLineIdx, gameState.settings.reducedMotion]);

  // Welcome Conversation Scene 03 entrance transition (peeking -> beside-player)
  useEffect(() => {
    if (stage !== 'welcome-dialogue' || welcomeSubStep !== 'peeking') return;
    const t = window.setTimeout(() => {
      setWelcomeSubStep('dialogue');
    }, gameState.settings.reducedMotion ? 350 : 1200);
    return () => window.clearTimeout(t);
  }, [stage, welcomeSubStep, gameState.settings.reducedMotion]);

  // Scene 14 HQ Entrance Sequence
  useEffect(() => {
    if (stage !== 'hq-entrance') return;
    setHqIlluminated(false);
    setHqDoorOpen(false);
    setEntranceFading(false);

    const hqDoor = TOWN_PATH_NODES['hq-door'];
    setGameState((prev) => ({
      ...prev,
      lastPosition: { x: hqDoor.x, y: hqDoor.y, nodeId: 'hq-door' },
    }));

    const t1 = window.setTimeout(() => {
      playSoftSelect();
      setHqIlluminated(true);
    }, 600);
    const t2 = window.setTimeout(() => {
      playPortalOpen();
      setHqDoorOpen(true);
    }, 1350);
    const t3 = window.setTimeout(() => {
      setEntranceFading(true);
    }, 2250);
    const t4 = window.setTimeout(() => {
      const next: StudentGameState = {
        ...gameStateRef.current,
        lastPosition: { x: hqDoor.x, y: hqDoor.y, nodeId: 'hq-door' },
        lastScene: 'screen-03-handoff',
      };
      persistState(next);
      setStage('screen-03-handoff');
      setEntranceFading(false);
    }, 2950);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [stage, persistState]);

  const handleConfirmCharacter = async (config: AvatarConfig, nickname: string) => {
    const nextState: StudentGameState = {
      ...gameStateRef.current,
      avatarConfig: config,
      detectiveNickname: nickname,
      tutorialProgress: {
        ...gameStateRef.current.tutorialProgress,
        characterConfirmed: true,
      },
      lastScene: isEditingExistingCharacter ? 'town' : 'cinematic',
    };
    await persistState(nextState);

    if (isEditingExistingCharacter) {
      setIsEditingExistingCharacter(false);
      setStage('town-free');
      return;
    }

    setCinematicShotIdx(0);
    setArrivalLineIdx(0);
    setStage('cinematic');
  };

  const handleUpdateSettings = (patch: Partial<GameSettings>) => {
    const next: StudentGameState = {
      ...gameStateRef.current,
      settings: {
        ...gameStateRef.current.settings,
        ...patch,
      },
    };
    persistState(next);
  };

  const handleReplayTutorial = () => {
    setActiveModal(null);
    setSelectedBuilding(null);
    setAllBuildingsCheered(false);
    setMovementSucceeded(false);
    setOffPathWarning(false);
    setHqDialogueStep('prompt');
    setTutCompleteCardShown(false);
    setTutPhase('await-click');
    setTutSubIdx(0);
    setStage('hud-intro');
  };

  const handleOpenHudModal = (modal: HudModalType) => {
    setActiveModal(modal);
  };

  const handleCloseHudModal = (modal: HudModalType) => {
    setActiveModal(null);

    if (stage === 'tut-profile' && modal === 'profile') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          profileExplored: true,
        },
      };
      persistState(next);
      setTutPhase('feedback');
      return;
    }

    if (stage === 'tut-bag' && modal === 'bag') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          bagExplored: true,
        },
      };
      persistState(next);
      setTutPhase('feedback');
      return;
    }

    if (stage === 'tut-mission' && modal === 'mission-tracker') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          missionTrackerExplored: true,
        },
      };
      persistState(next);
      setTutPhase('feedback');
      return;
    }

    if (stage === 'tut-settings' && modal === 'settings') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          settingsExplored: true,
        },
      };
      persistState(next);
      setTutPhase('feedback');
    }
  };

  const handleSelectBuilding = (building: BuildingDefinition) => {
    const isUnlocked = gameState.unlockedBuildings.includes(building.id);
    if (!isUnlocked) {
      setLockedFeedbackBuildingId(building.id);
      window.setTimeout(() => setLockedFeedbackBuildingId(null), 600);
    }

    setSelectedBuilding(building);

    if (stage === 'explore-buildings') {
      const prev = gameStateRef.current.tutorialProgress.buildingsDiscovered;
      if (!prev.includes(building.id)) {
        const updated = [...prev, building.id];
        const next: StudentGameState = {
          ...gameStateRef.current,
          tutorialProgress: {
            ...gameStateRef.current.tutorialProgress,
            buildingsDiscovered: updated,
          },
        };
        persistState(next);
      }
    }
  };

  const handleCloseBuildingModal = () => {
    const closed = selectedBuilding;
    setSelectedBuilding(null);

    if (
      stage === 'explore-buildings' &&
      gameStateRef.current.tutorialProgress.buildingsDiscovered.length >= TOWN_BUILDINGS.length
    ) {
      setAllBuildingsCheered(true);
      playLoginSuccess();
    }

    if (stage === 'tut-hq' && closed?.id === 'detective-hq') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          hqSelected: true,
        },
      };
      persistState(next);
      setHqDialogueStep('ready-confirm');
    }
  };

  const handleEnterBuilding = (building: BuildingDefinition) => {
    setSelectedBuilding(null);
    if (building.id !== 'detective-hq') return;

    if (stage === 'tut-hq') {
      const next: StudentGameState = {
        ...gameStateRef.current,
        tutorialProgress: {
          ...gameStateRef.current.tutorialProgress,
          hqSelected: true,
        },
      };
      persistState(next);
      setHqDialogueStep('ready-confirm');
      return;
    }

    if (stage === 'explore-buildings') {
      if (gameStateRef.current.tutorialProgress.buildingsDiscovered.length >= TOWN_BUILDINGS.length) {
        setAllBuildingsCheered(true);
      }
      return;
    }

    setStage('hq-entrance');
  };

  const handlePositionChange = (nextPos: AvatarPosition) => {
    setGameState((prev) => ({
      ...prev,
      lastPosition: nextPos,
    }));
  };

  const handleMovementCompleted = () => {
    setOffPathWarning(false);
    const next: StudentGameState = {
      ...gameStateRef.current,
      tutorialProgress: {
        ...gameStateRef.current.tutorialProgress,
        movementCompleted: true,
      },
    };
    persistState(next);
    if (stage === 'tut-movement') {
      setMovementSucceeded(true);
    }
  };

  const spotlightTarget: SpotlightTarget =
    stage === 'tut-profile' && tutPhase === 'await-click'
      ? 'profile'
      : stage === 'tut-bag' && tutPhase === 'await-click'
        ? 'bag'
        : stage === 'tut-mission' && tutPhase === 'await-click'
          ? 'mission-tracker'
          : stage === 'tut-settings' && tutPhase === 'await-click'
            ? 'settings'
            : null;

  const avatarConfig = gameState.avatarConfig;
  const nickname = gameState.detectiveNickname || 'Junior Detective';
  const showHud =
    stage !== 'customisation' &&
    stage !== 'cinematic' &&
    stage !== 'welcome-dialogue' &&
    stage !== 'screen-03-handoff';

  const cameraFocus: CameraFocus =
    stage === 'cinematic'
      ? cinematicShotIdx < CINEMATIC_SHOTS.length
        ? CINEMATIC_SHOTS[cinematicShotIdx].focus
        : 'plaza'
      : stage === 'welcome-dialogue'
        ? 'plaza'
        : stage === 'tut-hq' || stage === 'hq-entrance'
          ? 'hq'
          : 'town';

  const townPusheenState: TownPusheenState =
    stage === 'cinematic' || stage === 'customisation'
      ? 'hidden'
      : stage === 'welcome-dialogue' && welcomeSubStep === 'peeking'
        ? 'peeking'
        : stage === 'hq-entrance'
          ? 'following-hq'
          : 'beside-player';

  const currentWelcomeStep = WELCOME_DIALOGUE_SCRIPT[welcomeDialogueIdx];
  const currentExploreStep = EXPLORE_INTRO_SCRIPT[tutSubIdx];
  const currentBagStep = TUT_BAG_INTRO_SCRIPT[tutSubIdx];
  const currentMovementStep = TUT_MOVEMENT_INTRO_SCRIPT[tutSubIdx];
  const currentCompleteStep = TUT_COMPLETE_SCRIPT[tutSubIdx];

  // SCENE 01: Character Customisation
  if (stage === 'customisation' || !avatarConfig) {
    return (
      <div
        className={`relative min-h-dvh w-full overflow-x-hidden ${
          gameState.settings.reducedMotion ? 'reduced-motion' : ''
        }`}
      >
        {/* Blurred uploaded Frutiger Metro wallpaper background */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 overflow-hidden bg-[#5BBBE9]"
        >
          <img
            src="/assets/aistudio/Fruigtar_Metro_0c77f8a2.jpg"
            alt=""
            className="w-full h-full object-cover blur-[7px] scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(220,245,255,0.28) 0%, rgba(186,230,253,0.22) 55%, rgba(232,248,255,0.34) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <CharacterCustomisation
            initialConfig={avatarConfig}
            initialNickname={gameState.detectiveNickname}
            isEditingExisting={isEditingExistingCharacter}
            onConfirmAndContinue={handleConfirmCharacter}
            onCancelEdit={
              isEditingExistingCharacter
                ? () => {
                    setIsEditingExistingCharacter(false);
                    setStage('town-free');
                  }
                : undefined
            }
          />
        </div>
      </div>
    );
  }

  // SCREEN 03 HANDOFF VIEW (Part 13 & Part 20 Scope Boundary)
  if (stage === 'screen-03-handoff') {
    return (
      <div
        className={`min-h-dvh w-full flex flex-col bg-gradient-to-b from-[#4EBDF2] via-[#A9E4FA] to-[#DCF5FF] ${
          gameState.settings.reducedMotion ? 'reduced-motion' : ''
        }`}
      >
        <GameHud
          gameState={gameState}
          saveStatus={saveStatus}
          spotlightTarget={null}
          onOpenModal={handleOpenHudModal}
          onSignOut={onSignOut}
        />

        <main className="flex-1 flex items-center justify-center p-4">
          <div
            style={{
              background:
                'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(232,248,255,0.92) 55%, rgba(237,233,254,0.92) 100%)',
            }}
            className="aero-glass-card w-full max-w-2xl rounded-[32px] border border-white p-6 sm:p-8 text-center space-y-5 shadow-[0_24px_60px_-10px_rgba(16,55,92,0.3)]"
          >
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-4 py-1 text-xs font-extrabold tracking-widest uppercase text-[#6D28D9]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>DETECTIVE HQ · SCREEN 03 READY</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0284C7]">
                  MISSION 01
                </p>
                <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[#0E3558] casper-sub-halo">
                  THE MYSTERY OF THE UNEXPECTED PRIZE
                </h1>
                <p className="text-sm sm:text-base font-semibold text-[#18466E]">
                  Your first digital mystery is waiting!
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="w-24 h-32">
                  <DetectiveAvatar config={avatarConfig} view="front" pose="wave" />
                </div>
                <div className="w-24 h-22">
                  <PusheenIllustration expression="excited" pose="waving" />
                </div>
              </div>

              <div className="rounded-2xl bg-sky-50/90 border border-sky-200 p-4 text-xs sm:text-sm font-semibold text-[#0E3558] space-y-1">
                <p className="font-extrabold text-[#0369A1]">
                  SCREEN 03 – DETECTIVE HQ: SEGMENT 1, ACTIVITY 1, INDUCTION SET
                </p>
                <p className="text-[#475569]">
                  Welcome inside Detective HQ, {nickname}! Screen 02 onboarding is complete and your
                  progress is linked to your student account.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playSoftSelect();
                    persistState({ ...gameStateRef.current, lastScene: 'town' });
                    setStage('town-free');
                  }}
                  className="min-h-[44px] rounded-full bg-white hover:bg-sky-50 border border-sky-200 px-5 py-2 text-xs sm:text-sm font-bold text-[#0369A1] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>RETURN TO DETECTIVE TOWN</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <HudModals
          activeModal={activeModal}
          gameState={gameState}
          canEditCharacter={true}
          customMapMedia={customMapMedia}
          onUploadCustomMap={handleUploadCustomMap}
          onResetCustomMap={handleResetCustomMap}
          onUpdateSettings={handleUpdateSettings}
          onCloseModal={handleCloseHudModal}
          onEditCharacter={() => {
            setActiveModal(null);
            setIsEditingExistingCharacter(true);
            setStage('customisation');
          }}
          onReplayTutorial={handleReplayTutorial}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-dvh w-full flex flex-col overflow-hidden bg-[#53C4F7] ${
        gameState.settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Persistent Top Game HUD */}
      {showHud && (
        <GameHud
          gameState={gameState}
          saveStatus={saveStatus}
          spotlightTarget={spotlightTarget}
          onOpenModal={handleOpenHudModal}
          onSpotlightBackdropClick={() => setSpotlightHintToast(true)}
          onSignOut={onSignOut}
        />
      )}

      {/* Scene 10 Building Discovery Progress Bar */}
      {stage === 'explore-buildings' && (
        <div className="relative z-20 mx-auto mt-1.5 px-3">
          <div className="rounded-full bg-white/90 backdrop-blur-md border border-white px-4 py-1.5 shadow-md flex items-center gap-2 text-xs font-extrabold text-[#0369A1]">
            <Compass className="h-4 w-4 text-[#7C3AED]" aria-hidden="true" />
            <span>
              DISCOVERED BUILDINGS:{' '}
              {gameState.tutorialProgress.buildingsDiscovered.length} / {TOWN_BUILDINGS.length}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Layered Town World */}
      <TownEnvironment
        avatarConfig={avatarConfig}
        nickname={nickname}
        position={gameState.lastPosition}
        unlockedBuildings={gameState.unlockedBuildings}
        discoveredBuildings={gameState.tutorialProgress.buildingsDiscovered}
        showDiscoveryBadges={stage === 'explore-buildings'}
        cameraFocus={cameraFocus}
        reducedMotion={gameState.settings.reducedMotion}
        allowMovement={
          stage === 'tut-movement' ||
          stage === 'town-free' ||
          stage === 'explore-buildings'
        }
        allowBuildingClicks={
          stage === 'explore-buildings' ||
          stage === 'tut-hq' ||
          stage === 'town-free'
        }
        highlightPathway={stage === 'tut-movement' && tutPhase === 'await-click' && !movementSucceeded}
        highlightHq={stage === 'tut-hq' && hqDialogueStep === 'prompt'}
        hqIlluminated={hqIlluminated}
        hqDoorOpen={hqDoorOpen}
        showRustleBehindTree={stage === 'cinematic' && arrivalLineIdx === 2}
        customMapMedia={customMapMedia}
        pusheenState={townPusheenState}
        pusheenExpression={
          stage === 'welcome-dialogue' && currentWelcomeStep
            ? currentWelcomeStep.expression
            : stage === 'hq-entrance'
              ? 'excited'
              : 'happy'
        }
        pusheenPose={
          stage === 'welcome-dialogue' && welcomeSubStep === 'peeking'
            ? 'peeking'
            : stage === 'welcome-dialogue'
              ? 'waving'
              : 'normal'
        }
        avatarOverridePose={stage === 'cinematic' && arrivalLineIdx >= 1 ? 'wave' : undefined}
        selectedBuilding={selectedBuilding}
        lockedFeedbackBuildingId={lockedFeedbackBuildingId}
        onPositionChange={handlePositionChange}
        onMovementCompleted={handleMovementCompleted}
        onOffPathClick={() => setOffPathWarning(true)}
        onSelectBuilding={handleSelectBuilding}
        onCloseBuildingModal={handleCloseBuildingModal}
        onEnterBuilding={handleEnterBuilding}
      />

      {/* PATH B: Returning Student Welcome Card */}
      {stage === 'returning-welcome' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome back Junior Detective"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#0B2945]/45 backdrop-blur-xs"
        >
          <div
            style={{
              background:
                'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(226,248,255,0.93) 100%)',
            }}
            className="aero-glass-card w-full max-w-lg rounded-[30px] border border-white p-6 text-center space-y-4 shadow-[0_24px_60px_-10px_rgba(16,55,92,0.4)]"
          >
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 border border-sky-200 px-3.5 py-1 text-[11px] font-extrabold tracking-widest uppercase text-[#0369A1]">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                <span>WELCOME BACK, DETECTIVE!</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="w-24 h-32">
                  <DetectiveAvatar config={avatarConfig} view="front" pose="wave" />
                </div>
                <div className="w-20 h-18">
                  <PusheenIllustration expression="happy" pose="waving" />
                </div>
              </div>

              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-bold text-[#6D28D9]">
                  {nickname}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#18466E] mt-0.5">
                  LEVEL {gameState.level} · {gameState.xp} XP ·{' '}
                  <Star className="inline h-3.5 w-3.5 text-amber-500 fill-amber-400" />{' '}
                  {gameState.stars} STARS
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50/90 border border-sky-200 p-3 text-xs sm:text-sm font-semibold text-[#0E3558]">
                <strong>Detective Pusheen:</strong> &ldquo;Welcome back, {nickname}! Detective Town is
                ready whenever you are!&rdquo;
              </div>

              <button
                type="button"
                onClick={() => {
                  playPortalOpen();
                  if (gameState.lastScene === 'screen-03-handoff') {
                    setStage('screen-03-handoff');
                  } else {
                    setStage('town-free');
                  }
                }}
                className="aero-glossy-btn w-full min-h-[48px] rounded-full bg-gradient-to-b from-[#34D399] to-[#16A34A] hover:from-[#4ADE80] hover:to-[#15803D] px-6 py-2.5 text-sm sm:text-base font-bold text-white cursor-pointer"
              >
                CONTINUE MY ADVENTURE
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playSoftSelect();
                    setIsEditingExistingCharacter(true);
                    setStage('customisation');
                  }}
                  className="min-h-[38px] rounded-full bg-white hover:bg-purple-50 border border-purple-200 px-4 py-1.5 text-xs font-bold text-[#6D28D9] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit Character</span>
                </button>
                <button
                  type="button"
                  onClick={handleReplayTutorial}
                  className="min-h-[38px] rounded-full bg-white hover:bg-sky-50 border border-sky-200 px-4 py-1.5 text-xs font-bold text-[#0369A1] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Replay Tutorial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 02: Cinematic Camera Narration & Player Arrival */}
      {stage === 'cinematic' && (
        <div className="fixed inset-x-0 bottom-4 z-30 px-3 pointer-events-auto">
          {arrivalLineIdx === 0 ? (
            <div className="max-w-2xl mx-auto aero-glass-card rounded-[24px] border border-white/95 bg-white/90 px-5 py-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="relative z-10">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#0284C7]">
                  SCENE 02 · WELCOME TO DETECTIVE TOWN (SHOT {cinematicShotIdx + 1}/7)
                </p>
                <p className="text-sm sm:text-base font-bold text-[#0E3558] mt-0.5">
                  {CINEMATIC_SHOTS[cinematicShotIdx]?.caption}
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playSoftSelect();
                    if (cinematicShotIdx + 1 < CINEMATIC_SHOTS.length) {
                      setCinematicShotIdx((prev) => prev + 1);
                    } else {
                      setCinematicShotIdx(CINEMATIC_SHOTS.length);
                      setArrivalLineIdx(1);
                    }
                  }}
                  className="min-h-[38px] rounded-full bg-sky-100 hover:bg-sky-200 px-3.5 py-1.5 text-xs font-bold text-[#0369A1] cursor-pointer"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSoftSelect();
                    setCinematicShotIdx(CINEMATIC_SHOTS.length);
                    setArrivalLineIdx(1);
                  }}
                  className="min-h-[38px] rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#475569] cursor-pointer"
                >
                  Skip Intro
                </button>
              </div>
            </div>
          ) : (
            <DialogueBox
              speaker="player"
              playerNickname={nickname}
              playerAvatar={avatarConfig}
              expression={arrivalLineIdx === 1 ? 'excited' : 'curious'}
              text={
                arrivalLineIdx === 1
                  ? 'WOW! What a beautiful place!'
                  : 'Where am I? Wait... did something just move behind that tree?'
              }
              settings={gameState.settings}
              onNext={() => {
                if (arrivalLineIdx === 1) {
                  setArrivalLineIdx(2);
                } else {
                  setWelcomeSubStep('peeking');
                  setWelcomeDialogueIdx(0);
                  setStage('welcome-dialogue');
                }
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 03: Welcome Conversation with Detective Pusheen */}
      {stage === 'welcome-dialogue' && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          {welcomeSubStep === 'peeking' ? (
            <DialogueBox
              speaker="pusheen"
              expression="curious"
              text="A friendly grey cat wearing a detective hat peeks out from behind the tree with a magnifying glass..."
              settings={gameState.settings}
              nextLabel="MEET PUSHEEN"
              onNext={() => setWelcomeSubStep('dialogue')}
            />
          ) : (
            currentWelcomeStep && (
              <DialogueBox
                speaker={currentWelcomeStep.speaker}
                speakerName={currentWelcomeStep.speakerName}
                playerNickname={nickname}
                playerAvatar={avatarConfig}
                expression={currentWelcomeStep.expression}
                text={currentWelcomeStep.text}
                choices={currentWelcomeStep.choices}
                settings={gameState.settings}
                onReplay={() => setWelcomeDialogueIdx(0)}
                onChoiceSelect={(_choice: DialogueChoice) => {
                  setWelcomeDialogueIdx((prev) => prev + 1);
                }}
                onNext={() => {
                  if (welcomeDialogueIdx + 1 < WELCOME_DIALOGUE_SCRIPT.length) {
                    setWelcomeDialogueIdx((prev) => prev + 1);
                  } else {
                    persistState({
                      ...gameStateRef.current,
                      tutorialProgress: {
                        ...gameStateRef.current.tutorialProgress,
                        welcomeConversationDone: true,
                      },
                    });
                    setStage('hud-intro');
                  }
                }}
              />
            )
          )}
        </div>
      )}

      {/* SCENE 04: Introducing the Game Interface */}
      {stage === 'hud-intro' && !activeModal && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          <DialogueBox
            speaker="pusheen"
            expression="happy"
            text="Look around Detective Town! You can click any of your Detective Tools at the top corners right now, or press NEXT so I can guide you through each one!"
            settings={gameState.settings}
            onNext={() => {
              setTutPhase('await-click');
              setStage('tut-profile');
            }}
          />
        </div>
      )}

      {/* SCENE 05: Tutorial 1 – Player Profile */}
      {stage === 'tut-profile' && !activeModal && (
        <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-auto">
          {tutPhase === 'await-click' ? (
            <DialogueBox
              speaker="pusheen"
              expression="encouraging"
              text={
                spotlightHintToast
                  ? 'Click the glowing avatar badge in the top-left corner to open your Player Profile!'
                  : "First, let's take a look at your detective profile! Click your little avatar picture!"
              }
              settings={gameState.settings}
              showNextButton={false}
              onReplay={() => setSpotlightHintToast(false)}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Great! You know where to find your detective information!"
              settings={gameState.settings}
              onNext={() => {
                setSpotlightHintToast(false);
                setTutPhase('intro');
                setTutSubIdx(0);
                setStage('tut-bag');
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 06: Tutorial 2 – Detective Bag */}
      {stage === 'tut-bag' && !activeModal && (
        <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-auto">
          {tutPhase === 'intro' && currentBagStep ? (
            <DialogueBox
              speaker={currentBagStep.speaker}
              playerNickname={nickname}
              playerAvatar={avatarConfig}
              expression={currentBagStep.expression}
              text={currentBagStep.text}
              settings={gameState.settings}
              onNext={() => {
                if (tutSubIdx + 1 < TUT_BAG_INTRO_SCRIPT.length) {
                  setTutSubIdx((prev) => prev + 1);
                } else {
                  setTutPhase('await-click');
                }
              }}
            />
          ) : tutPhase === 'await-click' ? (
            <DialogueBox
              speaker="pusheen"
              expression="encouraging"
              text="Click your glowing Detective Bag icon at the top right to open it!"
              settings={gameState.settings}
              showNextButton={false}
              onReplay={() => {
                setTutPhase('intro');
                setTutSubIdx(0);
              }}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Well done! You know where to keep your detective treasures!"
              settings={gameState.settings}
              onNext={() => {
                setSpotlightHintToast(false);
                setTutPhase('await-click');
                setStage('tut-mission');
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 07: Tutorial 3 – Mission Tracker */}
      {stage === 'tut-mission' && !activeModal && (
        <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-auto">
          {tutPhase === 'await-click' ? (
            <DialogueBox
              speaker="pusheen"
              expression="excited"
              text="Now, this is one of the most important tools! Your Mission Tracker tells you what you need to do next. Click the glowing Mission Tracker!"
              settings={gameState.settings}
              showNextButton={false}
              onReplay={() => setSpotlightHintToast(false)}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Excellent! You have discovered your Mission Tracker!"
              settings={gameState.settings}
              onNext={() => {
                setSpotlightHintToast(false);
                setTutPhase('await-click');
                setStage('tut-settings');
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 08: Tutorial 4 – Settings & Help */}
      {stage === 'tut-settings' && !activeModal && (
        <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-auto">
          {tutPhase === 'await-click' ? (
            <DialogueBox
              speaker="pusheen"
              expression="happy"
              text="One last thing before we explore! Let's check your settings. Click the glowing Settings icon at the top right!"
              settings={gameState.settings}
              showNextButton={false}
              onReplay={() => setSpotlightHintToast(false)}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Fantastic! Now you know where to find help if you need it."
              settings={gameState.settings}
              onNext={() => {
                setSpotlightHintToast(false);
                setTutSubIdx(0);
                setStage('explore-intro');
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 09: Introducing the Seven Buildings */}
      {stage === 'explore-intro' && currentExploreStep && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          <DialogueBox
            speaker={currentExploreStep.speaker}
            playerNickname={nickname}
            playerAvatar={avatarConfig}
            expression={currentExploreStep.expression}
            text={currentExploreStep.text}
            settings={gameState.settings}
            onReplay={() => setTutSubIdx(0)}
            onNext={() => {
              if (tutSubIdx + 1 < EXPLORE_INTRO_SCRIPT.length) {
                setTutSubIdx((prev) => prev + 1);
              } else {
                setStage('explore-buildings');
              }
            }}
          />
        </div>
      )}

      {/* SCENE 10: Click and Discover All Seven Buildings */}
      {stage === 'explore-buildings' && !selectedBuilding && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          {allBuildingsCheered ? (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Purr-fect! You discovered all seven buildings in Detective Town! Now let's learn how to walk around."
              settings={gameState.settings}
              onNext={() => {
                setTutPhase('intro');
                setTutSubIdx(0);
                setMovementSucceeded(false);
                setOffPathWarning(false);
                setStage('tut-movement');
              }}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="curious"
              text={`Click each building in town to read its card! (${gameState.tutorialProgress.buildingsDiscovered.length} of 7 discovered)`}
              settings={gameState.settings}
              showNextButton={
                gameState.tutorialProgress.buildingsDiscovered.length >= TOWN_BUILDINGS.length
              }
              onNext={() => setAllBuildingsCheered(true)}
            />
          )}
        </div>
      )}

      {/* SCENE 11: Avatar Movement Tutorial */}
      {stage === 'tut-movement' && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          {tutPhase === 'intro' && currentMovementStep ? (
            <DialogueBox
              speaker={currentMovementStep.speaker}
              playerNickname={nickname}
              playerAvatar={avatarConfig}
              expression={currentMovementStep.expression}
              text={currentMovementStep.text}
              settings={gameState.settings}
              onNext={() => {
                if (tutSubIdx + 1 < TUT_MOVEMENT_INTRO_SCRIPT.length) {
                  setTutSubIdx((prev) => prev + 1);
                } else {
                  setTutPhase('await-click');
                }
              }}
            />
          ) : movementSucceeded ? (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="That's it! You're moving!"
              settings={gameState.settings}
              onNext={() => {
                setOffPathWarning(false);
                setHqDialogueStep('prompt');
                setStage('tut-hq');
              }}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression={offPathWarning ? 'thinking' : 'encouraging'}
              text={
                offPathWarning
                  ? "Hmm, that isn't a pathway! Try clicking the stone path instead."
                  : 'Click or tap any section of the glowing stone pathway (or use WASD / Arrow keys) to walk!'
              }
              settings={gameState.settings}
              showNextButton={false}
              onReplay={() => setOffPathWarning(false)}
            />
          )}
        </div>
      )}

      {/* SCENE 12: Building Selection Tutorial (Find Detective HQ) */}
      {stage === 'tut-hq' && !selectedBuilding && (
        <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
          {hqDialogueStep === 'prompt' ? (
            <DialogueBox
              speaker="pusheen"
              expression="excited"
              text="Great! Now let's practise choosing a building. Can you find our first mission location? Click DETECTIVE HQ!"
              settings={gameState.settings}
              showNextButton={false}
            />
          ) : (
            <DialogueBox
              speaker="pusheen"
              expression="celebrating"
              text="Wonderful! You've found it! Are you ready for your first mystery?"
              choices={[{ id: 'solve-it', label: "Yes! Let's solve it!" }]}
              settings={gameState.settings}
              onChoiceSelect={() => {
                setTutSubIdx(0);
                setTutCompleteCardShown(false);
                setStage('tut-complete');
              }}
            />
          )}
        </div>
      )}

      {/* SCENE 13: Tutorial Completion */}
      {stage === 'tut-complete' && (
        <>
          {!tutCompleteCardShown && currentCompleteStep ? (
            <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-auto">
              <DialogueBox
                speaker={currentCompleteStep.speaker}
                playerNickname={nickname}
                playerAvatar={avatarConfig}
                expression={currentCompleteStep.expression}
                text={currentCompleteStep.text}
                settings={gameState.settings}
                onNext={() => {
                  if (tutSubIdx + 1 < TUT_COMPLETE_SCRIPT.length) {
                    setTutSubIdx((prev) => prev + 1);
                  } else {
                    playLoginSuccess();
                    persistState({
                      ...gameStateRef.current,
                      tutorialProgress: {
                        ...gameStateRef.current.tutorialProgress,
                        tutorialCompleted: true,
                      },
                    });
                    setTutCompleteCardShown(true);
                  }
                }}
              />
            </div>
          ) : (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Tutorial Completed"
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#0B2945]/45 backdrop-blur-xs"
            >
              <div
                style={{
                  background:
                    'linear-gradient(155deg, rgba(255,255,255,0.96) 0%, rgba(226,248,255,0.94) 55%, rgba(237,233,254,0.94) 100%)',
                }}
                className="aero-glass-card w-full max-w-lg rounded-[32px] border border-white p-6 sm:p-7 text-center space-y-4 shadow-[0_24px_60px_-10px_rgba(16,55,92,0.42)]"
              >
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#15803D]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>TUTORIAL COMPLETED!</span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-[#18466E]">
                    You are officially ready to begin your adventure.
                  </p>

                  <div className="mx-auto w-32 h-42">
                    <DetectiveAvatar config={avatarConfig} view="front" pose="wave" />
                  </div>

                  <p className="font-[var(--font-display)] text-xl font-bold text-[#6D28D9]">
                    {nickname}
                  </p>

                  <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-left space-y-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                      FIRST MISSION
                    </p>
                    <p className="text-sm font-bold text-[#0E3558]">
                      MISSION 01: THE MYSTERY OF THE UNEXPECTED PRIZE
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playPortalOpen();
                      setStage('hq-entrance');
                    }}
                    className="aero-glossy-btn w-full min-h-[48px] rounded-full bg-gradient-to-b from-[#34D399] to-[#16A34A] hover:from-[#4ADE80] hover:to-[#15803D] px-6 py-2.5 text-sm sm:text-base font-bold text-white inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DoorOpen className="h-5 w-5" aria-hidden="true" />
                    <span>ENTER DETECTIVE HQ</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SCENE 14: Entering Detective HQ Animation + Fade */}
      {stage === 'hq-entrance' && (
        <>
          <div className="fixed inset-x-0 bottom-4 z-30 pointer-events-none">
            <DialogueBox
              speaker="pusheen"
              expression="excited"
              text="Our first mystery is waiting inside Detective HQ!"
              settings={gameState.settings}
              showNextButton={false}
            />
          </div>
          {entranceFading && (
            <div
              aria-hidden="true"
              className="fixed inset-0 z-50 bg-sky-50 transition-opacity duration-700 opacity-100"
            />
          )}
        </>
      )}

      {/* FREE TOWN EXPLORATION */}
      {stage === 'town-free' && !selectedBuilding && (
        <div className="fixed inset-x-0 bottom-3 z-20 px-3 pointer-events-none">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 aero-glass-card rounded-2xl border border-white/95 bg-white/88 px-4 py-2.5 shadow-md pointer-events-auto">
            <p className="relative z-10 text-xs sm:text-sm font-semibold text-[#0E3558]">
              {offPathWarning ? (
                <span className="text-[#6D28D9]">
                  <strong>Pusheen:</strong> &ldquo;Hmm, that isn&apos;t a pathway! Try clicking the
                  stone path instead.&rdquo;
                </span>
              ) : (
                <span>
                  Click the <strong>stone pathway</strong> (or WASD/Arrows) to walk, or click{' '}
                  <strong>Detective HQ</strong> to begin Mission 01!
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                playPortalOpen();
                setStage('hq-entrance');
              }}
              className="relative z-10 aero-glossy-btn min-h-[38px] rounded-full bg-gradient-to-b from-[#34D399] to-[#16A34A] px-4 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>ENTER DETECTIVE HQ</span>
            </button>
          </div>
        </div>
      )}

      {/* HUD MODALS */}
      <HudModals
        activeModal={activeModal}
        gameState={gameState}
        canEditCharacter={gameState.tutorialProgress.tutorialCompleted || isReturningOnStart}
        requireSettingChangeBeforeClose={stage === 'tut-settings'}
        customMapMedia={customMapMedia}
        onUploadCustomMap={handleUploadCustomMap}
        onResetCustomMap={handleResetCustomMap}
        onUpdateSettings={handleUpdateSettings}
        onCloseModal={handleCloseHudModal}
        onEditCharacter={() => {
          setActiveModal(null);
          setIsEditingExistingCharacter(true);
          setStage('customisation');
        }}
        onReplayTutorial={handleReplayTutorial}
      />
    </div>
  );
};
