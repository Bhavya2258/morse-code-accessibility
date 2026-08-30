import React, { useState } from 'react';
import { Search, Play, Zap, BookOpen, Volume2 } from 'lucide-react';
import { MORSE_DICTIONARY_LIST, playSingleBeep, triggerHaptic, buildPlaybackTimeline } from '../utils/morse';
import { MorseSettings } from '../types';

interface MorseDictionaryProps {
  settings: MorseSettings;
}

export const MorseDictionary: React.FC<MorseDictionaryProps> = ({ settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'letter' | 'number' | 'symbol' | 'prosign'>('all');
  const [playingChar, setPlayingChar] = useState<string | null>(null);

  const filteredSymbols = MORSE_DICTIONARY_LIST.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.char.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.morse.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handlePlaySymbol = async (char: string) => {
    setPlayingChar(char);

    const timeline = buildPlaybackTimeline(char, settings.wpm);

    for (const event of timeline) {
      if (event.type === 'dot' || event.type === 'dash') {
        if (settings.vibrationEnabled) {
          triggerHaptic(event.durationMs);
        }
        if (settings.audioEnabled) {
          playSingleBeep(event.durationMs, settings.frequency, settings.volume);
        }
        await new Promise((r) => setTimeout(r, event.durationMs));
      } else {
        await new Promise((r) => setTimeout(r, event.durationMs));
      }
    }

    setPlayingChar(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Morse Code Reference Chart</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Search letters, numbers & prosigns. Tap to hear & feel.</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 'A' or '.-'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 font-bold placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800 text-xs">
          {(['all', 'letter', 'number', 'symbol', 'prosign'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Symbol Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSymbols.map((item) => {
          const isPlaying = playingChar === item.char;
          return (
            <button
              key={item.char}
              onClick={() => handlePlaySymbol(item.char)}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-105 active:scale-95 flex flex-col justify-between space-y-2 ${
                isPlaying
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 ring-2 ring-amber-500/50 shadow-md'
                  : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-zinc-100">{item.char}</span>
                <Play className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-zinc-600'}`} />
              </div>

              <div className="font-mono text-base font-black text-amber-500 tracking-wider">
                {item.morse}
              </div>

              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                {item.category}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
