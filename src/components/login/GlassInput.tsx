import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface GlassInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  disabled?: boolean;
  accentRingClass?: string;
  isSecret?: boolean;
  secretToggleLabel?: string;
  autoCapitalize?: 'none' | 'characters' | 'words';
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
  disabled = false,
  accentRingClass = 'focus-visible:ring-sky-500/60 focus-visible:border-sky-400',
  isSecret = false,
  secretToggleLabel = 'secret',
  autoCapitalize = 'none',
}) => {
  const inputId = useId();
  const [revealed, setRevealed] = useState(false);

  const effectiveType = isSecret ? (revealed ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={inputId}
        className="block text-xs sm:text-[13px] font-bold tracking-wide text-[#10375C]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          autoCapitalize={autoCapitalize}
          spellCheck={false}
          className={`w-full min-h-[44px] rounded-xl bg-white/85 border border-white/95 px-3.5 py-2.5 text-sm sm:text-[15px] font-medium text-[#0E3558] placeholder:text-[#5B7A96] shadow-[inset_0_2px_5px_rgba(16,55,92,0.08)] transition-all duration-150 focus:outline-none focus:bg-white ${accentRingClass} disabled:opacity-65 disabled:cursor-not-allowed ${
            isSecret ? 'pr-12' : ''
          }`}
        />

        {isSecret && (
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            disabled={disabled}
            aria-label={revealed ? `Hide ${secretToggleLabel}` : `Show ${secretToggleLabel}`}
            aria-pressed={revealed}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[#2C587E] hover:bg-sky-100/70 hover:text-[#0D385E] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            {revealed ? (
              <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Eye className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
