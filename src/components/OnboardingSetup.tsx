import React, { useState } from 'react';
import { Sliders, Volume2, Zap, CheckCircle2, Radio, Play, Sparkles } from 'lucide-react';
import { MorseSettings, SmartwatchState } from '../types';
import { playSingleBeep, triggerHaptic } from '../utils/morse';

interface OnboardingSetupProps {
  settings: MorseSettings;
  onUpdateSettings: (newSettings: Partial<MorseSettings>) => void;
  watchState: SmartwatchState;
  onUpdateWatchState: (newState: Partial<SmartwatchState>) => void;
  onComplete: () => void;
}

export const OnboardingSetup: React.FC<OnboardingSetupProps> = ({
  settings,
  onUpdateSettings,
  watchState,
  onUpdateWatchState,
  onComplete
}) => {
  const [wpm, setWpm] = useState(settings.wpm || 15);
  const [frequency, setFrequency] = useState(settings.frequency || 650);
  const [hapticIntensity, setHapticIntensity] = useState<'light' | 'medium' | 'strong'>(
    watchState.hapticStrength || 'medium'
  );

  const handleTestAudio = () => {
    playSingleBeep(200, frequency, 0.8);
  };

  const handleTestHaptic = () => {
    const duration = hapticIntensity === 'light' ? 100 : hapticIntensity === 'medium' ? 200 : 350;
    triggerHaptic(duration);
  };

  const handleFinish = () => {
    onUpdateSettings({
      wpm,
      frequency,
      hapticIntensity,
      firstTimeCompleted: true
    });
    onUpdateWatchState({
      hapticStrength: hapticIntensity
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-zinc-950 font-black mb-1 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Radio className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-zinc-100 tracking-tight">
            Welcome to Tapper Pro
          </h2>
          <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto">
            Configure your tactile Morse transmission speed, tone pitch, and haptic vibration intensity before launching your Haptic TalkBack reader.
          </p>
        </div>

        {/* Step 1: Transmission Speed WPM */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>1. Transmission Speed (WPM)</span>
            </label>
            <span className="text-amber-500 font-mono font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              {wpm} Words / Min
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={wpm}
            onChange={(e) => setWpm(parseInt(e.target.value))}
            className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Slow (8 WPM)', value: 8 },
              { label: 'Standard (15 WPM)', value: 15 },
              { label: 'Pro (25 WPM)', value: 25 }
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setWpm(preset.value)}
                className={`py-2 px-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border ${
                  wpm === preset.value
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Audio Pitch Frequency */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>2. Audio Pitch Tone Frequency (Hz)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestAudio}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Tone</span>
              </button>
              <span className="text-emerald-400 font-mono font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                {frequency} Hz
              </span>
            </div>
          </div>

          <input
            type="range"
            min="400"
            max="1000"
            step="25"
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Bass (500 Hz)', value: 500 },
              { label: 'Medium (650 Hz)', value: 650 },
              { label: 'Treble (850 Hz)', value: 850 }
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFrequency(preset.value)}
                className={`py-2 px-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border ${
                  frequency === preset.value
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Haptic Motor Intensity */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>3. Haptic Motor Pulse Intensity</span>
            </label>
            <button
              type="button"
              onClick={handleTestHaptic}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Test Pulse</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['light', 'medium', 'strong'] as const).map((intensity) => (
              <button
                key={intensity}
                type="button"
                onClick={() => setHapticIntensity(intensity)}
                className={`py-3 px-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all border ${
                  hapticIntensity === intensity
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {intensity} Pulse
              </button>
            ))}
          </div>
        </div>

        {/* TalkBack Feature Note */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-0.5">
            <strong className="text-amber-500 uppercase tracking-wider block font-bold">
              Haptic TalkBack Screen Reader Feature:
            </strong>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Your floating overlay widget acts like an Android TalkBack accessibility service. Instead of speaking words aloud, it translates highlighted screen text into silent, tactile Morse vibrations.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center space-x-2 active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Complete Setup & Launch Application</span>
        </button>

      </div>
    </div>
  );
};
