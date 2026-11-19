import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { fetchCurrentSession, logoutSession } from '../../services/authApi.ts';
import type { AuthenticatedSession, PortalType } from '../../types/auth.ts';
import {
  isSoundEnabled,
  playBackClick,
  playHoverTick,
  setSoundEnabled,
} from '../../utils/soundEffects.ts';
import { Screen02Experience } from '../game/Screen02Experience.tsx';
import { LoginBackground } from './LoginBackground.tsx';
import { LoginFooter } from './LoginFooter.tsx';
import { LoginHeader } from './LoginHeader.tsx';
import { ParentLoginPanel } from './ParentLoginPanel.tsx';
import { PortalSelection } from './PortalSelection.tsx';
import { PostLoginHandoff } from './PostLoginHandoff.tsx';
import { PusheenMascot } from './PusheenMascot.tsx';
import { StudentLoginPanel } from './StudentLoginPanel.tsx';
import { TeacherLoginPanel } from './TeacherLoginPanel.tsx';

export const LoginScreen: React.FC = () => {
  const [activePortal, setActivePortal] = useState<PortalType | null>(null);
  const [session, setSession] = useState<AuthenticatedSession | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  useEffect(() => {
    let mounted = true;
    fetchCurrentSession().then((existingSession) => {
      if (mounted && existingSession) {
        setSession(existingSession);
        if (existingSession.role === 'student') {
          setWelcomeMessage('Welcome back, Detective! Your adventure is waiting!');
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBackToPortals = () => {
    setActivePortal(null);
  };

  const handleAuthSuccess = (newSession: AuthenticatedSession, message: string) => {
    setSession(newSession);
    setWelcomeMessage(message);
    setActivePortal(null);
  };

  const handleSignOut = async () => {
    playBackClick();
    await logoutSession();
    setSession(null);
    setWelcomeMessage('');
    setActivePortal(null);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) {
      playHoverTick();
    }
  };

  if (session?.role === 'student') {
    return (
      <MotionConfig reducedMotion="user">
        <Screen02Experience session={session} onSignOut={handleSignOut} />
      </MotionConfig>
    );
  }

  const isOverlayActive = activePortal !== null || session !== null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh w-full overflow-x-hidden">
        <LoginBackground isPanelOpen={isOverlayActive} />

        {/* Sound Effects Toggle Control */}
        <div className="fixed top-3 right-3 sm:top-4 sm:right-5 z-20">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            aria-pressed={soundOn}
            className="min-h-[42px] rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-white/95 px-3.5 py-2 text-xs font-bold text-[#0369A1] shadow-[0_8px_20px_-6px_rgba(16,55,92,0.22)] transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/60 cursor-pointer inline-flex items-center gap-1.5"
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{soundOn ? 'Sound On' : 'Sound Off'}</span>
          </button>
        </div>

        <div className="relative z-10 min-h-dvh w-full flex flex-col justify-between">
          {/* Area A & B: Website Title, Tagline & Welcome Text */}
          <LoginHeader />

          {/* Area C: Three Portal Cards OR Active Login Panel */}
          <main className="flex-1 flex items-center justify-center py-4 sm:py-6">
            <AnimatePresence mode="wait">
              {session ? (
                <motion.div
                  key="handoff"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full px-4"
                >
                  <PostLoginHandoff
                    session={session}
                    welcomeMessage={welcomeMessage}
                    onSignOut={handleSignOut}
                  />
                </motion.div>
              ) : activePortal === null ? (
                <motion.div
                  key="portals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <PortalSelection onSelectPortal={setActivePortal} />
                </motion.div>
              ) : (
                <motion.div
                  key={activePortal}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full px-4"
                >
                  {activePortal === 'student' && (
                    <StudentLoginPanel
                      onBack={handleBackToPortals}
                      onSuccess={handleAuthSuccess}
                    />
                  )}
                  {activePortal === 'teacher' && (
                    <TeacherLoginPanel
                      onBack={handleBackToPortals}
                      onSuccess={handleAuthSuccess}
                    />
                  )}
                  {activePortal === 'parent' && (
                    <ParentLoginPanel
                      onBack={handleBackToPortals}
                      onSuccess={handleAuthSuccess}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Area D & E: Detective Pusheen Mascot + Footer (non-overlapping responsive bottom row) */}
          <div className="w-full max-w-6xl mx-auto px-4 pb-3 sm:pb-4 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-3">
            <div className="order-2 lg:order-1">
              <LoginFooter />
            </div>

            <div className="order-1 lg:order-2">
              <PusheenMascot compact={isOverlayActive} />
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
};
