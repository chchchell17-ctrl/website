import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, School } from 'lucide-react';
import { loginTeacher, requestPasswordReset } from '../../services/authApi.ts';
import type { AuthErrorCode, TeacherSession } from '../../types/auth.ts';
import { playBackClick, playErrorTone, playLoginSuccess } from '../../utils/soundEffects.ts';
import { AuthFeedbackBanner } from './AuthFeedbackBanner.tsx';
import { GlassInput } from './GlassInput.tsx';

interface TeacherLoginPanelProps {
  onBack: () => void;
  onSuccess: (session: TeacherSession, message: string) => void;
}

export const TeacherLoginPanel: React.FC<TeacherLoginPanelProps> = ({
  onBack,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'error' | 'success';
    message: string;
    code?: AuthErrorCode;
    missingEnv?: string[];
  } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      playErrorTone();
      setFeedback({
        tone: 'error',
        code: 'EMPTY_FIELDS',
        message: 'Unable to sign in. Please check your login details and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = await loginTeacher({
      identifier: cleanIdentifier,
      password,
    });

    setIsSubmitting(false);

    if (result.ok) {
      playLoginSuccess();
      setFeedback({ tone: 'success', message: result.message });
      onSuccess(result.session, result.message);
      return;
    }

    playErrorTone();
    setFeedback({
      tone: 'error',
      code: result.code,
      message: result.message,
      missingEnv: result.missingEnv,
    });
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      playErrorTone();
      setFeedback({
        tone: 'error',
        code: 'EMPTY_FIELDS',
        message: 'Please enter your registered email address.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = await requestPasswordReset({
      email: cleanEmail,
      portal: 'teacher',
    });

    setIsSubmitting(false);
    if (result.ok) {
      playLoginSuccess();
    } else {
      playErrorTone();
    }

    setFeedback({
      tone: result.ok ? 'success' : 'error',
      code: result.code,
      message: result.message,
      missingEnv: result.missingEnv,
    });
  };

  return (
    <section
      aria-labelledby="teacher-panel-title"
      style={{
        background:
          'linear-gradient(155deg, rgba(240, 254, 234, 0.9) 0%, rgba(197, 233, 139, 0.78) 54%, rgba(154, 216, 138, 0.84) 100%)',
      }}
      className="aero-glass-card w-full max-w-[440px] mx-auto rounded-[28px] border border-white/90 p-6 sm:p-8"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-emerald-50 border border-white shadow-[0_8px_18px_-4px_rgba(22,101,52,0.25)] text-[#1F6E43]">
            {mode === 'login' ? (
              <School className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <KeyRound className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
            )}
          </div>

          <span className="mt-3 text-[11px] font-bold tracking-[0.16em] uppercase text-[#1E633C]">
            TEACHER PORTAL
          </span>

          <h2
            id="teacher-panel-title"
            className="mt-1 font-[var(--font-display)] text-2xl font-bold tracking-wide uppercase text-[#15803D] casper-sub-halo"
          >
            {mode === 'login' ? 'WELCOME BACK, TEACHER!' : 'RESET TEACHER PASSWORD'}
          </h2>

          <p className="mt-1 text-sm font-medium text-[#1D5439]">
            {mode === 'login'
              ? 'Sign in to access your Teacher Control Centre.'
              : 'Enter your registered email address to receive reset instructions.'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate className="mt-5 space-y-4">
            <GlassInput
              label="Registered Email / Username"
              value={identifier}
              onChange={setIdentifier}
              placeholder="Enter your registered email or username"
              autoComplete="username"
              disabled={isSubmitting}
              accentRingClass="focus-visible:ring-emerald-500/60 focus-visible:border-emerald-400"
            />

            <GlassInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              isSecret
              secretToggleLabel="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              accentRingClass="focus-visible:ring-emerald-500/60 focus-visible:border-emerald-400"
            />

            {feedback && (
              <AuthFeedbackBanner
                tone={feedback.tone}
                message={feedback.message}
                code={feedback.code}
                missingEnv={feedback.missingEnv}
              />
            )}

            <div className="pt-1 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="aero-glossy-btn w-full min-h-[46px] rounded-full bg-gradient-to-b from-[#3BB96E] to-[#1F8A4D] px-6 py-2.5 text-sm sm:text-[15px] font-bold tracking-wide text-white transition-all duration-150 hover:from-[#47C77A] hover:to-[#239956] active:scale-[0.985] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/60 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setResetEmail(identifier.includes('@') ? identifier : '');
                    setMode('forgot');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[44px] rounded-full bg-white/70 hover:bg-white/95 border border-white px-4 py-2 text-xs font-bold tracking-wide text-[#1A5837] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 cursor-pointer disabled:opacity-60"
                >
                  FORGOT PASSWORD?
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBackClick();
                    onBack();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[44px] rounded-full bg-white/75 hover:bg-white/95 border border-white px-4 py-2 text-xs font-bold tracking-wide text-[#10375C] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>BACK TO PORTALS</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} noValidate className="mt-5 space-y-4">
            <GlassInput
              label="Registered Email"
              type="email"
              value={resetEmail}
              onChange={setResetEmail}
              placeholder="Enter your registered email"
              autoComplete="email"
              disabled={isSubmitting}
              accentRingClass="focus-visible:ring-emerald-500/60 focus-visible:border-emerald-400"
            />

            {feedback && (
              <AuthFeedbackBanner
                tone={feedback.tone}
                message={feedback.message}
                code={feedback.code}
                missingEnv={feedback.missingEnv}
              />
            )}

            <div className="pt-1 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="aero-glossy-btn w-full min-h-[46px] rounded-full bg-gradient-to-b from-[#3BB96E] to-[#1F8A4D] px-6 py-2.5 text-sm sm:text-[15px] font-bold tracking-wide text-white transition-all duration-150 hover:from-[#47C77A] hover:to-[#239956] active:scale-[0.985] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/60 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                    <span>SENDING LINK...</span>
                  </>
                ) : (
                  <span>SEND RESET LINK</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setMode('login');
                }}
                disabled={isSubmitting}
                className="w-full min-h-[44px] rounded-full bg-white/75 hover:bg-white/95 border border-white px-5 py-2 text-xs font-bold tracking-wide text-[#10375C] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>BACK TO TEACHER LOGIN</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
