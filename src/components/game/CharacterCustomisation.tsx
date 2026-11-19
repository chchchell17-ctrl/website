import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Shuffle,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { DEFAULT_AVATAR_CONFIG } from '../../data/townData.ts';
import type {
  AccessoryId,
  AvatarConfig,
  BaseAppearanceId,
  HairColorId,
  HairStyleId,
  OutfitColorId,
  OutfitStyleId,
  ShoeColorId,
  ShoeStyleId,
  SkinToneId,
} from '../../types/game.ts';
import { playErrorTone, playLoginSuccess, playSoftSelect } from '../../utils/soundEffects.ts';
import {
  ACCESSORIES,
  BASE_APPEARANCES,
  DetectiveAvatar,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  OUTFIT_STYLES,
  SHOE_COLORS,
  SHOE_STYLES,
  SKIN_TONES,
} from './DetectiveAvatar.tsx';

interface CharacterCustomisationProps {
  initialConfig?: AvatarConfig | null;
  initialNickname?: string;
  isEditingExisting?: boolean;
  onConfirmAndContinue: (config: AvatarConfig, nickname: string) => Promise<void>;
  onCancelEdit?: () => void;
}

type CategoryTab = 'appearance' | 'skin' | 'hair' | 'clothing' | 'accessories' | 'shoes';
const VIEWS: Array<'front' | 'right' | 'back' | 'left'> = ['front', 'right', 'back', 'left'];
const EXAMPLE_NAMES = [
  'Detective Star',
  'Agent Spark',
  'Detective Blue',
  'Agent Shadow',
  'Detective Flash',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const CharacterCustomisation: React.FC<CharacterCustomisationProps> = ({
  initialConfig,
  initialNickname = '',
  isEditingExisting = false,
  onConfirmAndContinue,
  onCancelEdit,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig ?? { ...DEFAULT_AVATAR_CONFIG }
  );
  const [history, setHistory] = useState<AvatarConfig[]>([]);
  const [nickname, setNickname] = useState(initialNickname);
  const [activeTab, setActiveTab] = useState<CategoryTab>('appearance');
  const [viewIndex, setViewIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedStage, setConfirmedStage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (patch: Partial<AvatarConfig>) => {
    playSoftSelect();
    setHistory((prev) => [...prev.slice(-19), config]);
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleRandomise = () => {
    playSoftSelect();
    setHistory((prev) => [...prev.slice(-19), config]);
    setConfig({
      baseStyle: pickRandom(Object.keys(BASE_APPEARANCES) as BaseAppearanceId[]),
      skinTone: pickRandom(Object.keys(SKIN_TONES) as SkinToneId[]),
      hairStyle: pickRandom(Object.keys(HAIR_STYLES) as HairStyleId[]),
      hairColor: pickRandom(Object.keys(HAIR_COLORS) as HairColorId[]),
      outfitStyle: pickRandom(Object.keys(OUTFIT_STYLES) as OutfitStyleId[]),
      outfitColor: pickRandom(Object.keys(OUTFIT_COLORS) as OutfitColorId[]),
      accessory: pickRandom(Object.keys(ACCESSORIES) as AccessoryId[]),
      shoesStyle: pickRandom(Object.keys(SHOE_STYLES) as ShoeStyleId[]),
      shoesColor: pickRandom(Object.keys(SHOE_COLORS) as ShoeColorId[]),
    });
  };

  const handleReset = () => {
    playSoftSelect();
    setHistory((prev) => [...prev.slice(-19), config]);
    setConfig({ ...DEFAULT_AVATAR_CONFIG });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    playSoftSelect();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setConfig(previous);
  };

  const handleConfirm = () => {
    const clean = nickname.trim();
    if (clean.length < 2) {
      playErrorTone();
      setErrorMsg('Please choose a detective nickname (at least 2 characters)!');
      return;
    }
    if (clean.length > 20) {
      playErrorTone();
      setErrorMsg('Please keep your detective nickname under 20 characters.');
      return;
    }
    setErrorMsg('');
    playLoginSuccess();
    setConfirmedStage(true);
  };

  const handleFinalStart = async () => {
    if (isSaving) return;
    setIsSaving(true);
    playSoftSelect();
    await onConfirmAndContinue(config, nickname.trim());
    setIsSaving(false);
  };

  if (confirmedStage) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center p-4">
        <div
          style={{
            background:
              'linear-gradient(155deg, rgba(242,252,255,0.92) 0%, rgba(212,244,248,0.88) 52%, rgba(220,204,245,0.88) 100%)',
          }}
          className="aero-glass-card w-full max-w-lg rounded-[32px] border border-white/95 p-6 sm:p-8 text-center"
        >
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.16em] uppercase text-[#0369A1]">
              <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span>CHARACTER CONFIRMED</span>
            </div>

            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold uppercase text-[#0369A1] casper-sub-halo">
              YOUR DETECTIVE IS READY!
            </h1>

            <p className="text-sm sm:text-base font-semibold text-[#18466E]">
              Your adventure is about to begin.
            </p>

            {/* Glowing Circular Glass Platform */}
            <div className="relative mx-auto w-52 h-60 flex flex-col items-center justify-end pb-3">
              <div
                aria-hidden="true"
                className="absolute bottom-2 h-14 w-48 rounded-[100%] bg-gradient-to-b from-cyan-200/80 to-sky-400/50 border-2 border-white shadow-[0_0_32px_rgba(56,189,248,0.6)]"
              />
              <Sparkles
                aria-hidden="true"
                className="absolute top-3 left-4 h-6 w-6 text-amber-400 animate-pulse"
              />
              <Sparkles
                aria-hidden="true"
                className="absolute top-8 right-3 h-5 w-5 text-pink-400 animate-pulse"
              />
              <div className="relative z-10 w-40 h-52">
                <DetectiveAvatar config={config} view="front" pose="wave" />
              </div>
            </div>

            <div className="inline-block rounded-full bg-white/85 border border-white px-5 py-1.5 shadow-sm">
              <span className="font-[var(--font-display)] text-base font-bold text-[#6D28D9]">
                {nickname.trim()}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => {
                  playSoftSelect();
                  setConfirmedStage(false);
                }}
                disabled={isSaving}
                className="min-h-[46px] rounded-full bg-white/80 hover:bg-white border border-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#10375C] cursor-pointer"
              >
                EDIT MORE
              </button>
              <button
                type="button"
                onClick={handleFinalStart}
                disabled={isSaving}
                className="aero-glossy-btn min-h-[46px] rounded-full bg-gradient-to-b from-[#34D399] to-[#16A34A] hover:from-[#4ADE80] hover:to-[#15803D] px-8 py-2.5 text-sm sm:text-base font-bold tracking-wide text-white cursor-pointer transition-transform active:scale-95 disabled:opacity-70"
              >
                {isSaving ? 'SAVING...' : "LET'S GO!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between gap-4">
      {/* Header */}
      <header className="text-center space-y-1">
        <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0369A1] bg-white/75 rounded-full px-3 py-0.5 border border-white">
          SCENE 01 · DETECTIVE DRESSING STATION
        </span>
        <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#0369A1] casper-sub-halo">
          CREATE YOUR DETECTIVE!
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[#10375C]">
          Mix and match your style, then choose a fun detective nickname!
        </p>
      </header>

      {/* Main Two-Column Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1">
        {/* LEFT: Circular Glass Platform & Full-Body Preview */}
        <div
          style={{
            background:
              'linear-gradient(155deg, rgba(235,250,255,0.84) 0%, rgba(186,230,253,0.72) 55%, rgba(220,204,245,0.74) 100%)',
          }}
          className="aero-glass-card lg:col-span-5 rounded-[28px] border border-white/90 p-5 flex flex-col items-center justify-between"
        >
          <div className="relative z-10 w-full flex items-center justify-between text-xs font-bold text-[#0E5D7E]">
            <span>WARDROBE PREVIEW</span>
            <span className="uppercase">{VIEWS[viewIndex]} VIEW</span>
          </div>

          {/* Clothing & Accessory Display Badges */}
          <div className="relative z-10 w-full flex flex-wrap justify-center gap-1.5 mt-2">
            <span className="rounded-lg bg-white/75 border border-white px-2.5 py-1 text-[11px] font-bold text-[#075985]">
              {OUTFIT_STYLES[config.outfitStyle]}
            </span>
            <span className="rounded-lg bg-white/75 border border-white px-2.5 py-1 text-[11px] font-bold text-[#6D28D9]">
              {ACCESSORIES[config.accessory]}
            </span>
            <span className="rounded-lg bg-white/75 border border-white px-2.5 py-1 text-[11px] font-bold text-[#15803D]">
              {SHOE_STYLES[config.shoesStyle]}
            </span>
          </div>

          {/* Avatar on Circular Glass Platform */}
          <div className="relative z-10 my-2 w-52 h-64 sm:w-56 sm:h-72 flex flex-col items-center justify-end pb-3">
            <div
              aria-hidden="true"
              className="absolute bottom-2 h-14 w-48 rounded-[100%] bg-gradient-to-b from-white/90 to-sky-300/60 border-2 border-white shadow-[0_12px_28px_rgba(14,116,144,0.3)]"
            />
            <div className="relative z-10 w-44 h-60">
              <DetectiveAvatar config={config} view={VIEWS[viewIndex]} pose="idle" />
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="relative z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSoftSelect();
                setViewIndex((prev) => (prev + 3) % 4);
              }}
              aria-label="Rotate character left"
              className="min-h-[42px] rounded-full bg-white/85 hover:bg-white border border-white px-4 py-1.5 text-xs font-bold text-[#0369A1] inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Rotate Left</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSoftSelect();
                setViewIndex((prev) => (prev + 1) % 4);
              }}
              aria-label="Rotate character right"
              className="min-h-[42px] rounded-full bg-white/85 hover:bg-white border border-white px-4 py-1.5 text-xs font-bold text-[#0369A1] inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Rotate Right</span>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* RIGHT: Customisation Categories & Nickname */}
        <div
          style={{
            background:
              'linear-gradient(155deg, rgba(255,255,255,0.88) 0%, rgba(232,248,255,0.84) 100%)',
          }}
          className="aero-glass-card lg:col-span-7 rounded-[28px] border border-white/95 p-4 sm:p-6 flex flex-col justify-between gap-4"
        >
          <div className="relative z-10 space-y-4">
            {/* Category Tabs */}
            <div role="tablist" aria-label="Customisation categories" className="flex flex-wrap gap-1.5">
              {(
                [
                  ['appearance', 'Appearance'],
                  ['skin', 'Skin Tone'],
                  ['hair', 'Hair'],
                  ['clothing', 'Clothing'],
                  ['accessories', 'Accessories'],
                  ['shoes', 'Shoes'],
                ] as Array<[CategoryTab, string]>
              ).map(([tabId, label]) => (
                <button
                  key={tabId}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tabId}
                  onClick={() => {
                    playSoftSelect();
                    setActiveTab(tabId);
                  }}
                  className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tabId
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-white/75 text-[#0F4C81] hover:bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category Options */}
            <div className="min-h-[185px] space-y-3">
              {activeTab === 'appearance' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E]">
                    Expression &amp; Style
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(BASE_APPEARANCES) as Array<[BaseAppearanceId, string]>).map(
                      ([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ baseStyle: id })}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs sm:text-sm font-bold text-left cursor-pointer transition-all ${
                            config.baseStyle === id
                              ? 'bg-sky-100 border-sky-400 text-[#0369A1] shadow-sm'
                              : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'skin' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E]">
                    Skin Tone
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(SKIN_TONES) as Array<[SkinToneId, { label: string; fill: string }]>).map(
                      ([id, tone]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ skinTone: id })}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer ${
                            config.skinTone === id
                              ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                              : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                          }`}
                        >
                          <span
                            className="h-5 w-5 rounded-full border border-slate-400/50 shrink-0"
                            style={{ backgroundColor: tone.fill }}
                          />
                          <span>{tone.label}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'hair' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Hairstyle
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.entries(HAIR_STYLES) as Array<[HairStyleId, string]>).map(
                        ([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => updateConfig({ hairStyle: id })}
                            className={`min-h-[40px] rounded-xl border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                              config.hairStyle === id
                                ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                                : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Hair Colour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(HAIR_COLORS) as Array<[HairColorId, { label: string; fill: string }]>
                      ).map(([id, c]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ hairColor: id })}
                          aria-label={c.label}
                          title={c.label}
                          className={`min-h-[38px] rounded-full border px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                            config.hairColor === id
                              ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                              : 'bg-white/80 border-white text-[#10375C]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-slate-400/50"
                            style={{ backgroundColor: c.fill }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'clothing' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Outfit
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.entries(OUTFIT_STYLES) as Array<[OutfitStyleId, string]>).map(
                        ([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => updateConfig({ outfitStyle: id })}
                            className={`min-h-[40px] rounded-xl border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                              config.outfitStyle === id
                                ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                                : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Outfit Colour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(OUTFIT_COLORS) as Array<[OutfitColorId, { label: string; main: string }]>
                      ).map(([id, c]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ outfitColor: id })}
                          className={`min-h-[38px] rounded-full border px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                            config.outfitColor === id
                              ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                              : 'bg-white/80 border-white text-[#10375C]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: c.main }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accessories' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E]">
                    Accessories &amp; Detective Gear
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(ACCESSORIES) as Array<[AccessoryId, string]>).map(
                      ([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ accessory: id })}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer ${
                            config.accessory === id
                              ? 'bg-purple-100 border-purple-400 text-[#6D28D9]'
                              : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shoes' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Shoe Style
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(SHOE_STYLES) as Array<[ShoeStyleId, string]>).map(
                        ([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => updateConfig({ shoesStyle: id })}
                            className={`min-h-[40px] rounded-xl border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                              config.shoesStyle === id
                                ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                                : 'bg-white/80 border-white text-[#10375C] hover:bg-white'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E5D7E] mb-1.5">
                      Shoe Colour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(SHOE_COLORS) as Array<[ShoeColorId, { label: string; main: string }]>
                      ).map(([id, c]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateConfig({ shoesColor: id })}
                          className={`min-h-[38px] rounded-full border px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                            config.shoesColor === id
                              ? 'bg-sky-100 border-sky-400 text-[#0369A1]'
                              : 'bg-white/80 border-white text-[#10375C]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: c.main }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detective Nickname Section */}
            <div className="pt-3 border-t border-sky-100 space-y-2">
              <label
                htmlFor="detective-nickname-input"
                className="block font-[var(--font-display)] text-sm font-bold uppercase tracking-wide text-[#6D28D9]"
              >
                CHOOSE YOUR DETECTIVE NAME
              </label>

              <input
                id="detective-nickname-input"
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your detective nickname"
                className="w-full min-h-[44px] rounded-xl bg-white/95 border border-sky-200 px-3.5 py-2 text-sm sm:text-base font-bold text-[#0E3558] placeholder:text-[#64748B] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50"
              />

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[#475569]">Try an example:</span>
                {EXAMPLE_NAMES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      playSoftSelect();
                      setNickname(ex);
                      setErrorMsg('');
                    }}
                    className="rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 font-semibold text-[#6D28D9] cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-medium text-[#475569]">
                Online safety tip: Use a fun nickname instead of your full real name, home address, or phone number!
              </p>

              {errorMsg && (
                <p role="alert" className="text-xs font-bold text-[#B91C1C]">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR: Randomise, Reset, Undo & Confirm Character */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/75 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRandomise}
            className="min-h-[42px] rounded-full bg-white hover:bg-sky-50 border border-sky-200 px-4 py-2 text-xs font-bold text-[#0369A1] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>RANDOMISE</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="min-h-[42px] rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold text-[#334155] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="min-h-[42px] rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold text-[#334155] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>UNDO</span>
          </button>

          {isEditingExisting && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="min-h-[42px] rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold text-[#334155] cursor-pointer"
            >
              CANCEL
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="aero-glossy-btn min-h-[44px] rounded-full bg-gradient-to-b from-[#2AB2DF] to-[#0E83B5] hover:from-[#36BDE9] hover:to-[#1190C6] px-6 py-2 text-xs sm:text-sm font-bold tracking-wide text-white inline-flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>CONFIRM CHARACTER</span>
        </button>
      </div>
    </div>
  );
};
