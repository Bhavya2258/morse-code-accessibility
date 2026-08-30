import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Copy, Check, Sliders, Zap, 
  Volume2, Repeat, Watch, ArrowRightLeft, AlertTriangle, 
  Sparkles, RefreshCw, Smartphone
} from 'lucide-react';
import { MorseSettings, PlaybackStatus, SmartwatchState } from '../types';
import { 
  textToMorse, morseToText, buildPlaybackTimeline, 
  playSingleBeep, triggerHaptic, getMorseTimings 
} from '../utils/morse';

interface TextToMorseConverterProps {
  settings: MorseSettings;
  onUpdateSettings: (newSettings: Partial<MorseSettings>) => void;
  watchState: SmartwatchState;
  onSendToWatch: (text: string, morse: string) => void;
  overlayActive: boolean;
  onToggleOverlayWidget: () => void;
  onLaunchOverlayTab: () => void;
  onOpenSetupWizard?: () => void;
  initialText?: string;
}

export const TextToMorseConverter: React.FC<TextToMorseConverterProps> = ({
  settings,
  onUpdateSettings,
  watchState,
  onSendToWatch,
  overlayActive,
  onToggleOverlayWidget,
  onLaunchOverlayTab,
  onOpenSetupWizard,
  initialText = 'HELLO WORLD MORSE ACCESSIBILITY'
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [mode, setMode] = useState<'textToMorse' | 'morseToText'>('textToMorse');
  const [morseCode, setMorseCode] = useState('');
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [isVibratingNow, setIsVibratingNow] = useState(false);
  const [copiedMorse, setCopiedMorse] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // References for playback loop control
  const playbackCancelledRef = useRef(false);
  const playbackPausedRef = useRef(false);

  // Calculate Morse code whenever text changes
  useEffect(() => {
    if (mode === 'textToMorse') {
      setMorseCode(textToMorse(inputText));
    } else {
      setMorseCode(inputText);
    }
  }, [inputText, mode]);

  // Quick emergency presets
  const presets = [
    { label: 'SOS Emergency', text: 'SOS' },
    { label: 'Help Needed', text: 'HELP NEEDED' },
    { label: 'Medical Alert', text: 'MEDICAL EMERGENCY' },
    { label: 'Yes', text: 'YES' },
    { label: 'No', text: 'NO' },
    { label: 'Water Please', text: 'I NEED WATER' }
  ];

  // Handle Playback Loop
  const handleStartPlayback = async () => {
    if (playbackStatus === 'playing') return;

    setPlaybackStatus('playing');
    playbackCancelledRef.current = false;
    playbackPausedRef.current = false;

    const sourceText = mode === 'textToMorse' ? inputText : morseToText(inputText);
    if (!sourceText.trim()) {
      setPlaybackStatus('idle');
      return;
    }

    // Auto sync to smartwatch if connected
    if (watchState.isConnected) {
      onSendToWatch(sourceText, textToMorse(sourceText));
    }

    const timeline = buildPlaybackTimeline(sourceText, settings.wpm);

    let loopAgain = true;

    while (loopAgain && !playbackCancelledRef.current) {
      for (let i = 0; i < timeline.length; i++) {
        if (playbackCancelledRef.current) break;

        const event = timeline[i];

        // Highlight character
        setActiveCharIndex(event.charIndex);
        setActiveSymbol(event.morseChar);

        if (event.type === 'dot' || event.type === 'dash') {
          setIsVibratingNow(true);

          // Audio
          if (settings.audioEnabled) {
            playSingleBeep(event.durationMs, settings.frequency, settings.volume);
          }

          // Device Haptics
          if (settings.vibrationEnabled) {
            triggerHaptic(event.durationMs);
          }

          await new Promise(r => setTimeout(r, event.durationMs));
          setIsVibratingNow(false);
        } else {
          // Pause / Space
          await new Promise(r => setTimeout(r, event.durationMs));
        }
      }

      if (!settings.loopPlayback) {
        loopAgain = false;
      }
    }

    setPlaybackStatus('idle');
    setActiveCharIndex(null);
    setActiveSymbol(null);
    setIsVibratingNow(false);
  };

  const handleStopPlayback = () => {
    playbackCancelledRef.current = true;
    setPlaybackStatus('idle');
    setActiveCharIndex(null);
    setActiveSymbol(null);
    setIsVibratingNow(false);
  };

  const handleCopyMorse = () => {
    navigator.clipboard.writeText(morseCode);
    setCopiedMorse(true);
    setTimeout(() => setCopiedMorse(false), 2000);
  };

  const handleCopyText = () => {
    const textToCopy = mode === 'textToMorse' ? inputText : morseToText(inputText);
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const timings = getMorseTimings(settings.wpm);

  return (
    <div className="space-y-6">
      
      {/* Visual Haptic Pulse & Active Transmitting Banner */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        isVibratingNow
          ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] scale-[1.01]'
          : 'bg-zinc-900 border-zinc-800'
      }`}>
        {/* Animated vibration ripples */}
        {isVibratingNow && (
          <div className="absolute inset-0 bg-amber-500/10 animate-ping pointer-events-none rounded-3xl" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
              isVibratingNow 
                ? 'bg-amber-500 text-zinc-950 scale-110 shadow-lg shadow-amber-500/50' 
                : 'bg-zinc-950 border border-zinc-800 text-amber-500'
            }`}>
              <Zap className={`w-6 h-6 ${isVibratingNow ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                  {playbackStatus === 'playing' ? 'Transmitting Haptic Morse...' : 'Tactile Haptic Engine Ready'}
                </span>
                {isVibratingNow && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-zinc-950 animate-pulse">
                    VIBRATING ({activeSymbol === '.' ? 'DIT •' : activeSymbol === '-' ? 'DAH —' : 'PAUSE'})
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Speed: <span className="text-amber-500 font-bold">{settings.wpm} WPM</span> ({timings.dotMs}ms dot) • 
                Pitch: <span className="text-emerald-400 font-bold">{settings.frequency}Hz</span>
              </p>
            </div>
          </div>

          {/* Action Buttons & Widget Switch */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Widget Toggle Switch */}
            <div className="flex items-center space-x-2 bg-zinc-950 px-3.5 py-2 rounded-2xl border border-zinc-800">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
                  Floating Overlay
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${overlayActive ? 'text-amber-500' : 'text-zinc-500'}`}>
                  {overlayActive ? 'WIDGET ON' : 'WIDGET OFF'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleOverlayWidget}
                className={`w-9 h-5 rounded-full transition-colors relative ml-1 ${
                  overlayActive ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-zinc-950 absolute top-0.75 transition-transform ${
                  overlayActive ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Vibrate & Play Button */}
            {playbackStatus === 'playing' ? (
              <button
                onClick={handleStopPlayback}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider shadow-lg transition-all text-xs"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleStartPlayback}
                className="flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 text-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Vibrate & Play</span>
              </button>
            )}

            {/* Quick Setup Wizard Reconfigure Button */}
            {onOpenSetupWizard && (
              <button
                onClick={onOpenSetupWizard}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50 transition-all"
                title="Open Initial Setup Wizard"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              className={`p-3 rounded-2xl border transition-all ${
                showSettingsPanel
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              title="Tune Speed & Pitch"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Speed & Audio Settings Panel */}
        {showSettingsPanel && (
          <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            {/* Speed WPM */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between font-bold uppercase tracking-wider">
                <span className="text-zinc-400">Transmission Speed</span>
                <span className="text-amber-500 font-mono">{settings.wpm} WPM</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={settings.wpm}
                onChange={(e) => onUpdateSettings({ wpm: parseInt(e.target.value) })}
                className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>5 WPM (Beginner)</span>
                <span>35 WPM (Pro)</span>
              </div>
            </div>

            {/* Pitch Frequency */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between font-bold uppercase tracking-wider">
                <span className="text-zinc-400">Audio Tone Frequency</span>
                <span className="text-emerald-400 font-mono">{settings.frequency} Hz</span>
              </div>
              <input
                type="range"
                min="400"
                max="1000"
                step="25"
                value={settings.frequency}
                onChange={(e) => onUpdateSettings({ frequency: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>400 Hz (Bass)</span>
                <span>1000 Hz (Treble)</span>
              </div>
            </div>

            {/* Loop & Haptic Toggles */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 text-amber-500" /> Continuous Loop
                </span>
                <button
                  onClick={() => onUpdateSettings({ loopPlayback: !settings.loopPlayback })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    settings.loopPlayback ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-zinc-950 absolute top-0.75 transition-transform ${
                    settings.loopPlayback ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Audio Beeps
                </span>
                <button
                  onClick={() => onUpdateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    settings.audioEnabled ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-zinc-950 absolute top-0.75 transition-transform ${
                    settings.audioEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Converter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                <span>{mode === 'textToMorse' ? 'Normal Text Input' : 'Morse Code Input'}</span>
                <span className="text-[10px] text-zinc-500 font-mono">(Real-time Translation)</span>
              </label>

              {/* Mode Switcher */}
              <button
                onClick={() => {
                  setMode(mode === 'textToMorse' ? 'morseToText' : 'textToMorse');
                  setInputText(mode === 'textToMorse' ? morseCode : textToMorse(inputText));
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-500 text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-all"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{mode === 'textToMorse' ? 'Switch to Morse' : 'Switch to Text'}</span>
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'textToMorse' ? 'Type anything to convert into Morse code...' : 'Type Morse code e.g. "... --- ... / .-- --- .-. .-.. -.."' }
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono text-base resize-none"
            />
          </div>

          {/* Quick Emergency Presets */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Quick Preset Signals:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setMode('textToMorse');
                    setInputText(preset.text);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-500 text-xs font-bold transition-all uppercase tracking-tight"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                {mode === 'textToMorse' ? 'Morse Code Output' : 'Translated English Text'}
              </label>

              <div className="flex items-center space-x-2">
                {mode === 'textToMorse' ? (
                  <button
                    onClick={handleCopyMorse}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-all"
                  >
                    {copiedMorse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMorse ? 'Copied' : 'Copy Morse'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCopyText}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-all"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Output Display with Active Character Highlighting */}
            <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-[140px] font-mono text-lg text-amber-500 tracking-widest break-words overflow-y-auto max-h-[180px]">
              {mode === 'textToMorse' ? (
                morseCode ? (
                  morseCode
                ) : (
                  <span className="text-zinc-600 text-sm font-sans italic">
                    Morse code will appear here in real-time...
                  </span>
                )
              ) : (
                morseToText(inputText) ? (
                  <span className="text-zinc-100 font-sans">{morseToText(inputText)}</span>
                ) : (
                  <span className="text-zinc-600 text-sm font-sans italic">
                    English translation will appear here...
                  </span>
                )
              )}
            </div>
          </div>

          {/* Interactive Character Highlight Stream */}
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
              Character Stream & Tactile Sync:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-sm max-h-20 overflow-y-auto">
              {inputText.toUpperCase().split('').map((char, idx) => {
                const isActive = activeCharIndex === idx;
                const charMorse = textToMorse(char);
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-black scale-110 shadow-lg'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    <span>{char === ' ' ? '␣' : char}</span>
                    <span className="ml-1 opacity-75 text-[10px]">{charMorse}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Integration Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800 text-xs">
            
            {/* Smartwatch Quick Sync button */}
            <button
              onClick={() => onSendToWatch(inputText, morseCode)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all w-full sm:w-auto justify-center font-bold uppercase tracking-wider text-xs ${
                watchState.isConnected
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Watch className="w-4 h-4" />
              <span>{watchState.isConnected ? 'Send to Watch' : 'Connect Smartwatch'}</span>
            </button>

            {/* Launch Accessibility Overlay Simulator button */}
            <button
              onClick={onLaunchOverlayTab}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-amber-500 border border-amber-500/30 transition-all w-full sm:w-auto justify-center font-bold uppercase tracking-wider text-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>Accessibility Overlay Simulator</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
