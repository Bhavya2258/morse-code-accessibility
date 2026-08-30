import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, RotateCcw, Volume2, Zap, Award, Sparkles, 
  HelpCircle, CheckCircle2, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { MorseSettings } from '../types';
import { REVERSE_MORSE_MAP, playSingleBeep, triggerHaptic } from '../utils/morse';

interface MorseKeyerProps {
  settings: MorseSettings;
}

export const MorseKeyer: React.FC<MorseKeyerProps> = ({ settings }) => {
  const [tappedMorse, setTappedMorse] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [practiceWord, setPracticeWord] = useState('SOS');
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Single Morse Keyer tap handler
  const handleTapSymbol = (symbol: '.' | '-') => {
    const updatedMorse = tappedMorse + symbol;
    setTappedMorse(updatedMorse);

    // Audio & Haptic
    const duration = symbol === '.' ? 100 : 300;
    if (settings.vibrationEnabled) {
      triggerHaptic(duration);
    }
    if (settings.audioEnabled) {
      playSingleBeep(duration, settings.frequency, settings.volume);
    }
  };

  const handleAddSpace = () => {
    setTappedMorse(prev => prev + ' / ');
  };

  const handleClear = () => {
    setTappedMorse('');
    setDecodedText('');
    setPracticeSuccess(false);
  };

  // Auto-decode whenever tappedMorse changes
  useEffect(() => {
    if (!tappedMorse) {
      setDecodedText('');
      return;
    }

    const words = tappedMorse.trim().split(' / ');
    const translatedWords = words.map(word => {
      const letters = word.split(' ');
      return letters.map(code => REVERSE_MORSE_MAP[code] || '?').join('');
    });

    const result = translatedWords.join(' ');
    setDecodedText(result);

    // Check practice match
    if (result.trim().toUpperCase() === practiceWord) {
      setPracticeSuccess(true);
      setPracticeScore(prev => prev + 10);
    }
  }, [tappedMorse, practiceWord]);

  // Next random practice target
  const handleNextPractice = () => {
    const targets = ['SOS', 'HELP', 'OK', 'AM', 'YES', 'NO', 'CAT', 'DOG', 'AIR', 'WAVE'];
    const random = targets[Math.floor(Math.random() * targets.length)];
    setPracticeWord(random);
    setTappedMorse('');
    setDecodedText('');
    setPracticeSuccess(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Radio className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Interactive Morse Tapper / Keyer</h2>
                <span className="px-2 py-0.5 rounded border border-amber-500/30 text-[10px] font-bold bg-amber-500/10 text-amber-500">
                  TACTILE INPUT KEYPAD
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tap Morse dots and dashes to type text manually with real-time audio and haptic feedback.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-mono">Score:</span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold text-xs uppercase tracking-wider">
              🏆 {practiceScore} PTS
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Tapper Pad & Live Translation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase tracking-wider text-zinc-300 text-xs">Manual Telegraph Keyer</h3>
            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 text-zinc-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Tapped Morse Code Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-[90px] font-mono text-xl text-amber-500 tracking-widest break-words flex items-center justify-between">
            <span>{tappedMorse || '... --- ...'}</span>
          </div>

          {/* Decoded English Output Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Decoded Text:</span>
              <span className="font-bold text-zinc-100 text-base">{decodedText || '—'}</span>
            </div>
          </div>

          {/* BIG TAP BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTapSymbol('.')}
              className="py-8 rounded-3xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span>DIT ( • )</span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950/80">Short Vibration</span>
            </button>

            <button
              onClick={() => handleTapSymbol('-')}
              className="py-8 rounded-3xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <span>DAH ( — )</span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950/80">Long Vibration</span>
            </button>
          </div>

          {/* Space / Letter Break Control */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTappedMorse(prev => prev + ' ')}
              className="py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-all"
            >
              Space Letter (Break)
            </button>
            <button
              onClick={handleAddSpace}
              className="py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-all"
            >
              Space Word ( / )
            </button>
          </div>
        </div>

        {/* Right Col: Interactive Practice Game */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-black uppercase tracking-wider text-zinc-300 text-xs">Practice Trainer Game</h3>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
              <span className="text-xs text-zinc-500 block uppercase tracking-widest font-bold">
                Target Word to Tap:
              </span>
              <div className="text-4xl font-black text-amber-500 font-mono tracking-widest">
                {practiceWord}
              </div>

              {practiceSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2 animate-bounce uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Morse Tapped! +10 Pts</span>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 font-mono">
                  Tap Dits & Dahs to spell <span className="text-zinc-200 font-bold">{practiceWord}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={handleNextPractice}
              className="w-full py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-amber-500 border border-zinc-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
            >
              <span>Next Practice Target</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
