import React from 'react';

interface LoginBackgroundProps {
  isPanelOpen: boolean;
}

export const LoginBackground: React.FC<LoginBackgroundProps> = ({ isPanelOpen }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Softly Blurred Uploaded Frutiger Aero Wallpaper so it stays calm and readable */}
      <img
        src="/assets/aistudio/frutiger_aero__1__6f630077.jpg"
        alt=""
        referrerPolicy="no-referrer"
        className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 ${
          isPanelOpen
            ? 'blur-[10px] scale-[1.06] brightness-105'
            : 'blur-[5px] scale-[1.03] brightness-105'
        }`}
      />

      {/* Subtle Atmospheric Sky Veil to keep background calm & non-overwhelming */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isPanelOpen ? 'bg-sky-100/42' : 'bg-sky-50/18'
        }`}
      />

      {/* Subtle Animated SVG Sun Rays Radiating from Top-Right */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        className="animate-sun-rays absolute inset-0 h-full w-full"
        style={{ transformOrigin: '88% 6%' }}
      >
        <defs>
          <linearGradient id="sunRayGrad" x1="100%" y1="0%" x2="25%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.46" />
            <stop offset="48%" stopColor="#FFFDE8" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
            <stop offset="45%" stopColor="#FFF9D6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="1275" cy="54" r="210" fill="url(#sunCoreGrad)" />

        <g fill="url(#sunRayGrad)">
          <polygon points="1275,54 740,0 910,0" />
          <polygon points="1275,54 440,260 610,130" />
          <polygon points="1275,54 320,560 470,410" />
          <polygon points="1275,54 580,860 760,760" />
          <polygon points="1275,54 980,900 1130,900" />
        </g>
      </svg>

      {/* Series of Animated SVG Clouds Drifting Gently Across the Sky */}
      <svg
        viewBox="0 0 1440 380"
        preserveAspectRatio="none"
        className="animate-cloud-slow absolute top-0 left-[-4%] w-[108%] h-[40vh] min-h-[210px]"
      >
        <defs>
          <linearGradient id="cloudSoftA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#E1F5FE" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Cloud 1 — Upper Left */}
        <g fill="url(#cloudSoftA)">
          <ellipse cx="195" cy="96" rx="98" ry="30" />
          <circle cx="145" cy="82" r="34" />
          <circle cx="195" cy="68" r="44" />
          <circle cx="248" cy="84" r="30" />
        </g>

        {/* Cloud 2 — Mid Upper */}
        <g fill="url(#cloudSoftA)" opacity="0.85">
          <ellipse cx="690" cy="62" rx="82" ry="22" />
          <circle cx="655" cy="52" r="26" />
          <circle cx="695" cy="44" r="32" />
          <circle cx="734" cy="54" r="24" />
        </g>

        {/* Cloud 3 — Upper Right */}
        <g fill="url(#cloudSoftA)">
          <ellipse cx="1160" cy="112" rx="105" ry="32" />
          <circle cx="1105" cy="96" r="36" />
          <circle cx="1162" cy="82" r="46" />
          <circle cx="1218" cy="98" r="32" />
        </g>
      </svg>

      <svg
        viewBox="0 0 1440 340"
        preserveAspectRatio="none"
        className="animate-cloud-wide absolute top-[14vh] left-[-5%] w-[110%] h-[34vh] opacity-75 hidden sm:block"
      >
        <defs>
          <linearGradient id="cloudSoftB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D8F3FD" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Cloud 4 — Drifting Mid-Left */}
        <g fill="url(#cloudSoftB)">
          <ellipse cx="420" cy="96" rx="78" ry="22" />
          <circle cx="388" cy="85" r="26" />
          <circle cx="424" cy="78" r="32" />
          <circle cx="460" cy="88" r="22" />
        </g>

        {/* Cloud 5 — Drifting Mid-Right */}
        <g fill="url(#cloudSoftB)">
          <ellipse cx="970" cy="84" rx="86" ry="24" />
          <circle cx="934" cy="74" r="28" />
          <circle cx="974" cy="66" r="34" />
          <circle cx="1014" cy="76" r="24" />
        </g>
      </svg>

      {/* Glossy Frutiger Aero Floating Glass Bubbles */}
      <div className="hidden sm:block">
        {[
          { left: '10%', top: '24%', size: 40, delay: '0s' },
          { left: '22%', top: '54%', size: 26, delay: '2.4s' },
          { left: '78%', top: '22%', size: 44, delay: '1.2s' },
          { left: '89%', top: '48%', size: 28, delay: '3.2s' },
        ].map((bubble, i) => (
          <div
            key={i}
            className="animate-bubble-rise absolute rounded-full"
            style={{
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.delay,
              background:
                'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.86) 0%, rgba(168,221,242,0.22) 52%, rgba(255,255,255,0.6) 100%)',
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.85), 0 8px 18px rgba(16,55,92,0.08)',
            }}
          />
        ))}
      </div>

      {/* Gentle Animated Butterfly */}
      <div className="animate-butterfly-a absolute left-[16%] top-[20%] hidden md:block">
        <svg width="32" height="26" viewBox="0 0 34 28">
          <g className="animate-wing-flutter">
            <ellipse cx="10" cy="11" rx="8" ry="6" fill="#A8E8FF" stroke="#4FA9D8" strokeWidth="1" />
            <ellipse cx="24" cy="11" rx="8" ry="6" fill="#A8E8FF" stroke="#4FA9D8" strokeWidth="1" />
            <ellipse cx="12" cy="19" rx="5" ry="4.5" fill="#F5D5E6" stroke="#C88EB0" strokeWidth="1" />
            <ellipse cx="22" cy="19" rx="5" ry="4.5" fill="#F5D5E6" stroke="#C88EB0" strokeWidth="1" />
          </g>
          <rect x="16" y="7" width="2.2" height="15" rx="1.1" fill="#1E4D75" />
        </svg>
      </div>
    </div>
  );
};
