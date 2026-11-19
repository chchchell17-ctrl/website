import React, { useState } from 'react';
import { ArrowLeft, GraduationCap, Loader2 } from 'lucide-react';
import { loginStudent } from '../../services/authApi.ts';
import type { AuthErrorCode, StudentSession } from '../../types/auth.ts';
import { playBackClick, playErrorTone, playLoginSuccess } from '../../utils/soundEffects.ts';
import { AuthFeedbackBanner } from './AuthFeedbackBanner.tsx';
import { GlassInput } from './GlassInput.tsx';

interface StudentLoginPanelProps {
  onBack: () => void;
  onSuccess: (session: StudentSession, message: string) => void;
}

export const StudentLoginPanel: React.FC<StudentLoginPanelProps> = ({
  onBack,
  onSuccess,
}) => {
  const [classCode, setClassCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'error' | 'success';
    message: string;
    code?: AuthErrorCode;
    missingEnv?: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedClass = classCode.trim();
    const trimmedStudent = studentId.trim();
    const trimmedPin = pin.trim();

    if (!trimmedClass || !trimmedStudent || !trimmedPin) {
      playErrorTone();
      setFeedback({
        tone: 'error',
        code: 'EMPTY_FIELDS',
        message: 'Oops! Please complete your login details.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = await loginStudent({
      classCode: trimmedClass,
      studentId: trimmedStudent,
      pin: trimmedPin,
    });

    setIsSubmitting(false);

    if (result.ok) {
      playLoginSuccess();
      setFeedback({
        tone: 'success',
        message: result.message,
      });
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

  return (
    <section
      aria-labelledby="student-panel-title"
      style={{
        background:
          'linear-gradient(155deg, rgba(232, 250, 255, 0.88) 0%, rgba(168, 221, 242, 0.78) 55%, rgba(141, 217, 223, 0.84) 100%)',
      }}
      className="aero-glass-card w-full max-w-[440px] mx-auto rounded-[28px] border border-white/90 p-6 sm:p-8"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-sky-100 border border-white shadow-[0_8px_18px_-4px_rgba(14,116,144,0.28)] text-[#0D6E96]">
            <GraduationCap className="h-7 w-7" strokeWidth={2.2} aria-hidden="true" />
          </div>

          <span className="mt-3 text-[11px] font-bold tracking-[0.16em] uppercase text-[#0E5D7E]">
            STUDENT PORTAL
          </span>

          <h2
            id="student-panel-title"
            className="mt-1 font-[var(--font-display)] text-2xl font-bold tracking-wide uppercase text-[#0369A1] casper-sub-halo"
          >
            WELCOME, JUNIOR DETECTIVE!
          </h2>

          <p className="mt-1 text-sm font-medium text-[#1D4C74]">
            Enter your detective details to begin your adventure.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <GlassInput
            label="Class Code"
            value={classCode}
            onChange={setClassCode}
            placeholder="Enter your class code"
            autoComplete="off"
            autoCapitalize="characters"
            disabled={isSubmitting}
            accentRingClass="focus-visible:ring-sky-500/60 focus-visible:border-sky-400"
          />

          <GlassInput
            label="Student ID"
            value={studentId}
            onChange={setStudentId}
            placeholder="Enter your student ID"
            autoComplete="username"
            autoCapitalize="characters"
            disabled={isSubmitting}
            accentRingClass="focus-visible:ring-sky-500/60 focus-visible:border-sky-400"
          />

          <GlassInput
            label="Student PIN"
            value={pin}
            onChange={setPin}
            placeholder="Enter your PIN"
            isSecret
            secretToggleLabel="PIN"
            autoComplete="current-password"
            inputMode="numeric"
            disabled={isSubmitting}
            accentRingClass="focus-visible:ring-sky-500/60 focus-visible:border-sky-400"
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
              className="aero-glossy-btn w-full min-h-[46px] rounded-full bg-gradient-to-b from-[#2AB2DF] to-[#0E83B5] px-6 py-2.5 text-sm sm:text-[15px] font-bold tracking-wide text-white transition-all duration-150 hover:from-[#36BDE9] hover:to-[#1190C6] active:scale-[0.985] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/60 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                  <span>LOGGING IN...</span>
                </>
              ) : (
                <span>LOGIN</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playBackClick();
                onBack();
              }}
              disabled={isSubmitting}
              className="w-full min-h-[44px] rounded-full bg-white/75 hover:bg-white/95 border border-white px-5 py-2 text-xs sm:text-[13px] font-bold tracking-wide text-[#0E4A73] transition-colors duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>BACK TO PORTALS</span>
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs sm:text-[13px] font-medium text-[#1D4C74]">
          Don&apos;t have your login details? Ask your teacher for help.
        </p>
      </div>
    </section>
  );
};
