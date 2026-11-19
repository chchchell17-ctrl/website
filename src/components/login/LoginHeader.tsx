import React from 'react';

export const LoginHeader: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center px-4 pt-4 sm:pt-6">
      <h1
        className="font-[var(--font-display)] font-bold tracking-wide text-balance leading-[1.1] uppercase"
        style={{
          fontSize: 'clamp(1.95rem, 4.3vw, 3.35rem)',
        }}
      >
        <span className="casper-text-halo text-[#0369A1]">DIGITAL </span>
        <span className="casper-text-halo text-[#15803D]">DETECTIVE </span>
        <span className="casper-text-halo text-[#7E22CE]">WORLD</span>
      </h1>

      <p
        className="mt-2 sm:mt-2.5 font-[var(--font-display)] font-bold tracking-[0.1em] uppercase casper-sub-halo"
        style={{
          fontSize: 'clamp(1rem, 1.65vw, 1.28rem)',
        }}
      >
        <span className="text-[#D9467A]">THINK </span>
        <span className="text-[#EA580C]">BEFORE </span>
        <span className="text-[#0284C7]">YOU </span>
        <span className="text-[#16A34A]">CLICK!</span>
      </p>

      <div className="mt-2 inline-block rounded-full bg-white/75 backdrop-blur-md border border-white/90 px-4 py-1 shadow-sm">
        <p className="text-xs sm:text-sm font-bold text-[#0F4C81]">
          An exciting online safety adventure awaits you.
        </p>
      </div>
    </header>
  );
};
