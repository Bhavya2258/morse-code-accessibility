import React, { useState } from 'react';
import { 
  Watch, Wifi, Bluetooth, Battery, Zap, Play, Square, 
  RotateCcw, Sliders, Shield, Smartphone, Sparkles, VolumeX, Check
} from 'lucide-react';
import { MorseSettings, SmartwatchState } from '../types';
import { textToMorse, buildPlaybackTimeline, playSingleBeep, triggerHaptic } from '../utils/morse';

interface SmartwatchSyncProps {
  settings: MorseSettings;
  watchState: SmartwatchState;
  onToggleConnect: () => void;
  onUpdateWatchState: (newState: Partial<SmartwatchState>) => void;
}

export const SmartwatchSync: React.FC<SmartwatchSyncProps> = ({
  settings,
  watchState,
  onToggleConnect,
  onUpdateWatchState
}) => {
  const [watchTapInput, setWatchTapInput] = useState('');
  const [isPlayingWatchMorse, setIsPlayingWatchMorse] = useState(false);
  const [activeWatchSymbol, setActiveWatchSymbol] = useState<string | null>(null);

  const handleWristTap = (symbol: '.' | '-') => {
    const updated = watchTapInput + symbol;
    setWatchTapInput(updated);

    // Haptic & Sound for watch tap
    const duration = symbol === '.' ? 100 : 300;
    triggerHaptic(duration);
    if (settings.audioEnabled) {
      playSingleBeep(duration, settings.frequency, settings.volume);
    }
  };

  const handlePlayWatchText = async () => {
    if (!watchState.lastSyncedText) return;
    setIsPlayingWatchMorse(true);

    const timeline = buildPlaybackTimeline(watchState.lastSyncedText, settings.wpm);

    for (const event of timeline) {
      if (event.type === 'dot' || event.type === 'dash') {
        setActiveWatchSymbol(event.morseChar);

        // Haptic strength adjustment
        const durationFactor = watchState.hapticStrength === 'strong' ? 1.3 : watchState.hapticStrength === 'light' ? 0.7 : 1;
        const duration = Math.round(event.durationMs * durationFactor);

        triggerHaptic(duration);
        if (settings.audioEnabled) {
          playSingleBeep(duration, settings.frequency, settings.volume);
        }

        await new Promise((r) => setTimeout(r, event.durationMs));
        setActiveWatchSymbol(null);
      } else {
        await new Promise((r) => setTimeout(r, event.durationMs));
      }
    }

    setIsPlayingWatchMorse(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Smartwatch Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Watch className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Wear OS Smartwatch Companion</h2>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                  watchState.isConnected
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                }`}>
                  {watchState.isConnected ? 'BLUETOOTH CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Receive silent tactile Morse vibrations directly on your wrist watch, or tap Morse responses stealthily.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleConnect}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-xs transition-all ${
              watchState.isConnected
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>{watchState.isConnected ? 'Disconnect Watch' : 'Pair Wear OS Device'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Device Settings & Controls */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 text-xs">
            <h3 className="font-black uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Watch Configuration</span>
            </h3>

            {/* Device Select */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Smartwatch Model</label>
              <select
                value={watchState.deviceName}
                onChange={(e) => onUpdateWatchState({ deviceName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-zinc-200 text-xs font-bold focus:outline-none focus:border-amber-500/60"
              >
                <option value="Galaxy Watch 6 Pro">Samsung Galaxy Watch 6 Pro</option>
                <option value="Google Pixel Watch 3">Google Pixel Watch 3</option>
                <option value="Garmin Tactix 7">Garmin Tactix 7</option>
                <option value="Apple Watch Series 9">Apple Watch Series 9</option>
              </select>
            </div>

            {/* Wrist Haptic Intensity */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Wrist Haptic Pulse Strength</span>
                <span className="text-amber-500 font-mono font-bold">{watchState.hapticStrength}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'medium', 'strong'] as const).map((strength) => (
                  <button
                    key={strength}
                    onClick={() => onUpdateWatchState({ hapticStrength: strength })}
                    className={`py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all border ${
                      watchState.hapticStrength === strength
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {strength}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Stealth Screen Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px] block">Silent Stealth Mode</span>
                <span className="text-[10px] text-zinc-500 font-mono">Wrist haptics only</span>
              </div>
              <button
                onClick={() => onUpdateWatchState({ screenAlwaysOn: !watchState.screenAlwaysOn })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  watchState.screenAlwaysOn ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-zinc-950 absolute top-0.75 transition-transform ${
                  watchState.screenAlwaysOn ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Watch Battery Indicator */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                <Battery className="w-4 h-4 text-emerald-400" /> Watch Battery
              </span>
              <span className="text-emerald-400 font-bold font-mono">{watchState.batteryLevel}%</span>
            </div>

          </div>
        </div>

        {/* Center & Right: Interactive Smartwatch Round Screen Simulation */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center space-y-6">
          
          {/* Round Smartwatch Frame */}
          <div className="relative group">
            
            {/* Outer Watch Casing */}
            <div className="w-72 h-72 rounded-full bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-8 border-zinc-700 shadow-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden ring-4 ring-zinc-900">
              
              {/* Watch Glass Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/5 to-white/10 pointer-events-none rounded-full" />

              {/* Watch Screen Content */}
              <div className={`w-full h-full rounded-full bg-zinc-950 border-2 border-zinc-800 p-4 flex flex-col items-center justify-between text-center transition-all ${
                isPlayingWatchMorse ? 'ring-4 ring-amber-500/50 bg-amber-950/20' : ''
              }`}>
                
                {/* Watch Top Status Bar */}
                <div className="flex items-center space-x-2 text-[10px] font-bold text-zinc-500 pt-1 font-mono">
                  <Wifi className="w-3 h-3 text-amber-500" />
                  <span>10:42 AM</span>
                  <Battery className="w-3 h-3 text-emerald-400" />
                </div>

                {/* Main Synced Message Display */}
                <div className="space-y-1 max-w-[190px]">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">
                    {isPlayingWatchMorse ? `Wrist Vibrate (${activeWatchSymbol || ''})` : 'Wear OS Synced'}
                  </span>
                  <div className="font-bold text-zinc-100 text-xs line-clamp-2">
                    {watchState.lastSyncedText || 'No synced text yet'}
                  </div>
                  <div className="font-mono text-[10px] text-amber-500 line-clamp-2 break-all">
                    {watchState.lastSyncedMorse || '... --- ...'}
                  </div>
                </div>

                {/* Watch Tap Morse Keyer Input */}
                <div className="pb-1 w-full space-y-1">
                  <div className="text-[9px] text-zinc-500 font-mono">
                    Tap Wrist Keyer: <span className="text-amber-500 font-bold">{watchTapInput || '_'}</span>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleWristTap('.')}
                      className="w-10 h-8 rounded-full bg-zinc-900 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 font-black text-sm transition-all border border-zinc-800 shadow-md active:scale-90"
                    >
                      •
                    </button>
                    <button
                      onClick={() => handleWristTap('-')}
                      className="w-10 h-8 rounded-full bg-zinc-900 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 font-black text-sm transition-all border border-zinc-800 shadow-md active:scale-90"
                    >
                      —
                    </button>
                    <button
                      onClick={() => setWatchTapInput('')}
                      className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-rose-400 text-xs flex items-center justify-center transition-all border border-zinc-800"
                      title="Clear Tap"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Watch Straps */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-12 bg-zinc-800 rounded-t-2xl -z-10 border-t-2 border-zinc-700" />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-12 bg-zinc-800 rounded-b-2xl -z-10 border-b-2 border-zinc-700" />
          </div>

          {/* Trigger Wrist Vibration Playback Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePlayWatchText}
              disabled={isPlayingWatchMorse}
              className="flex items-center space-x-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isPlayingWatchMorse ? 'Vibrating Smartwatch Wrist...' : 'Vibrate Text on Smartwatch'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
