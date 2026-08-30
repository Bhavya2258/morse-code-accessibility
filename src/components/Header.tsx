import React from 'react';
import { Volume2, VolumeX, Radio, Smartphone, Watch, Zap, Sparkles } from 'lucide-react';
import { MorseSettings, SmartwatchState } from '../types';

interface HeaderProps {
  settings: MorseSettings;
  onUpdateSettings: (newSettings: Partial<MorseSettings>) => void;
  watchState: SmartwatchState;
  onToggleWatchConnect: () => void;
  overlayActive: boolean;
  onToggleOverlay: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  watchState,
  onToggleWatchConnect,
  overlayActive,
  onToggleOverlay,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Bento Header Logo & Title */}
          <div className="flex items-center space-x-3.5 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Radio className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black tracking-tighter text-amber-500 uppercase italic leading-none">
                    Tapper Pro
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-500">
                    Android + Wear OS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono mt-1 uppercase tracking-widest hidden sm:block">
                  Morse Translation & Haptic Engine v4.2
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  settings.vibrationEnabled
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-300">Haptic Engine Active</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => onUpdateSettings({ audioEnabled: !settings.audioEnabled })}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                settings.audioEnabled
                  ? 'bg-zinc-900 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
              }`}
            >
              {settings.audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{settings.audioEnabled ? 'Audio On' : 'Audio Off'}</span>
            </button>

            {/* Vibration Toggle */}
            <button
              onClick={() => onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                settings.vibrationEnabled
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${settings.vibrationEnabled ? 'text-amber-500 fill-amber-500' : ''}`} />
              <span>{settings.vibrationEnabled ? 'Vibe On' : 'Vibe Off'}</span>
            </button>

            {/* Smartwatch Sync */}
            <button
              onClick={onToggleWatchConnect}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                watchState.isConnected
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              <span>{watchState.isConnected ? 'Wear OS Synced' : 'Sync Watch'}</span>
            </button>
          </div>

          {/* Navigation Tabs - Bento Pill Style */}
          <div className="flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'converter'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Converter
            </button>
            <button
              onClick={() => setActiveTab('overlay')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1 ${
                activeTab === 'overlay'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Overlay</span>
              <Sparkles className="w-3 h-3 text-zinc-950 fill-zinc-950 inline" />
            </button>
            <button
              onClick={() => setActiveTab('watch')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'watch'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Smartwatch
            </button>
            <button
              onClick={() => setActiveTab('keyer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'keyer'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Keyer
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Dictionary
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Android Setup
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
