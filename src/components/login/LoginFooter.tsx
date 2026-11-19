import React from 'react';

export const LoginFooter: React.FC = () => {
  return (
    <footer className="text-center lg:text-left px-4 py-1.5">
      <div className="inline-block rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 px-4 py-1.5 shadow-sm">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase">
          <span className="text-[#0369A1]">SJKC MING TAO</span>{' '}
          <span aria-hidden="true" className="text-[#7E22CE]">·</span>{' '}
          <span className="text-[#15803D]">YEAR 5 ENGLISH</span>
        </p>
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase text-[#7E22CE]">
          ONLINE SAFETY ADVENTURE
        </p>
      </div>
    </footer>
  );
};
