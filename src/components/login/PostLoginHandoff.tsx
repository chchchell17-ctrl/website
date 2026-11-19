import React from 'react';
import { CheckCircle2, LogOut, ShieldCheck } from 'lucide-react';
import type { AuthenticatedSession } from '../../types/auth.ts';

interface PostLoginHandoffProps {
  session: AuthenticatedSession;
  welcomeMessage: string;
  onSignOut: () => void;
}

export const PostLoginHandoff: React.FC<PostLoginHandoffProps> = ({
  session,
  welcomeMessage,
  onSignOut,
}) => {
  return (
    <section
      aria-labelledby="handoff-title"
      style={{
        background:
          'linear-gradient(155deg, rgba(242, 252, 255, 0.92) 0%, rgba(212, 244, 248, 0.86) 100%)',
      }}
      className="aero-glass-card w-full max-w-[480px] mx-auto rounded-[28px] border border-white/95 p-6 sm:p-8 text-center"
    >
      <div className="relative z-10 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-emerald-50 border border-white shadow-[0_8px_18px_-4px_rgba(22,101,52,0.25)] text-[#1F6E43]">
          <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} aria-hidden="true" />
        </div>

        <span className="block text-[11px] font-bold tracking-[0.16em] uppercase text-[#0E5D7E]">
          {session.role === 'student'
            ? 'STUDENT SESSION ACTIVE'
            : session.role === 'teacher'
              ? 'TEACHER SESSION ACTIVE'
              : 'PARENT SESSION ACTIVE'}
        </span>

        <h2
          id="handoff-title"
          className="font-[var(--font-display)] text-2xl font-bold text-[#0D385E]"
        >
          {session.role === 'student'
            ? welcomeMessage || 'Welcome back, Detective! Your adventure is waiting!'
            : `Welcome, ${session.displayName}!`}
        </h2>

        {session.role === 'student' && (
          <div className="rounded-2xl bg-white/80 border border-white px-4 py-3.5 text-left text-sm text-[#18466E] space-y-1.5">
            <p className="font-bold text-[#0D385E]">
              {session.displayName} · Class {session.classCode}
            </p>
            {session.isFirstTime ? (
              <p className="text-xs sm:text-[13px] leading-relaxed">
                First-time Detective profile ready. Next stage destination: Avatar Creation Screen,
                followed by Screen 02.
              </p>
            ) : (
              <div className="text-xs sm:text-[13px] space-y-1">
                <p>
                  Saved progress restored: <span className="font-semibold tabular-nums">{session.progress.xp} XP</span>{' '}
                  · <span className="font-semibold tabular-nums">{session.progress.stars} Stars</span> ·{' '}
                  <span className="font-semibold tabular-nums">{session.progress.badges.length} Badges</span>
                </p>
                <p className="text-[#2D5E87]">
                  Next stage destination: {session.progress.lastPosition}
                </p>
              </div>
            )}
          </div>
        )}

        {session.role === 'teacher' && (
          <div className="rounded-2xl bg-white/80 border border-white px-4 py-3.5 text-left text-sm text-[#18466E] space-y-1">
            <p className="font-bold text-[#0D385E]">{session.schoolName}</p>
            <p className="text-xs sm:text-[13px]">
              Verified teacher role. Assigned classes:{' '}
              {session.assignedClasses.length > 0 ? session.assignedClasses.join(', ') : 'None assigned yet'}.
            </p>
            <p className="text-xs text-[#2D5E87]">
              Next stage destination: Teacher Control Centre.
            </p>
          </div>
        )}

        {session.role === 'parent' && (
          <div className="rounded-2xl bg-white/80 border border-white px-4 py-3.5 text-left text-sm text-[#18466E] space-y-1">
            <p className="font-bold text-[#0D385E] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#5B3A8C]" aria-hidden="true" />
              <span>Verified Linked Child Profile</span>
            </p>
            <ul className="text-xs sm:text-[13px] space-y-0.5">
              {session.linkedChildren.map((child) => (
                <li key={child.studentId}>
                  {child.displayName} ({child.classCode || child.className})
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#2D5E87] pt-0.5">
              Next stage destination: Parent Dashboard (read-only child progress).
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onSignOut}
          className="w-full min-h-[44px] rounded-full bg-white/80 hover:bg-white border border-white px-5 py-2 text-xs sm:text-[13px] font-bold tracking-wide text-[#10375C] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/50 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>SIGN OUT &amp; RETURN TO PORTALS</span>
        </button>
      </div>
    </section>
  );
};
