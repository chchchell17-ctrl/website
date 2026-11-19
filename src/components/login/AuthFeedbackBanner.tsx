import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import type { AuthErrorCode } from '../../types/auth.ts';

interface AuthFeedbackBannerProps {
  tone: 'error' | 'success';
  message: string;
  code?: AuthErrorCode;
  missingEnv?: string[];
  showAdminDetails?: boolean;
}

export const AuthFeedbackBanner: React.FC<AuthFeedbackBannerProps> = ({
  tone,
  message,
  code,
  missingEnv,
  showAdminDetails = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-2xl border px-3.5 py-3 text-left text-xs sm:text-[13px] font-medium shadow-sm ${
        isError
          ? 'bg-rose-50/92 border-rose-200 text-[#9B2232]'
          : 'bg-emerald-50/92 border-emerald-200 text-[#175B38]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isError ? (
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-[#C93B4B]" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-[#1F6E43]" aria-hidden="true" />
        )}
        <div className="flex-1 space-y-1.5">
          <p className="leading-snug">{message}</p>

          {code === 'BACKEND_NOT_CONFIGURED' &&
            showAdminDetails &&
            missingEnv &&
            missingEnv.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-2 text-[#7B1E2B] hover:text-[#57121C] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded cursor-pointer"
                >
                  <Wrench className="h-3 w-3" aria-hidden="true" />
                  <span>Setup details for school admin / developer</span>
                  {expanded ? (
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  )}
                </button>

                {expanded && (
                  <div className="mt-2 rounded-xl bg-white/85 border border-rose-200/80 p-2.5 text-[11px] text-[#3B4C5E] space-y-1">
                    <p className="font-semibold text-[#10375C]">
                      Supabase backend environment variables required:
                    </p>
                    <ul className="list-disc pl-4 font-[var(--font-mono)] space-y-0.5">
                      {missingEnv.map((envKey) => (
                        <li key={envKey}>{envKey}</li>
                      ))}
                    </ul>
                    <p className="pt-0.5 text-[#4A6075]">
                      Configure these in your server environment or Netlify dashboard and run the
                      schema in <code className="font-[var(--font-mono)]">supabase/migrations/</code>.
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
