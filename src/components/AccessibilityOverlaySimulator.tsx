import React, { useState } from 'react';
import { 
  Smartphone, Eye, Layers, Zap, MessageSquare, Newspaper, 
  Camera, Bell, Play, Square, Settings, ChevronRight, Check,
  Volume2, ShieldCheck, Sparkles, Move
} from 'lucide-react';
import { MorseSettings } from '../types';
import { textToMorse, buildPlaybackTimeline, playSingleBeep, triggerHaptic } from '../utils/morse';

interface AccessibilityOverlaySimulatorProps {
  settings: MorseSettings;
  onUpdateSettings: (newSettings: Partial<MorseSettings>) => void;
}

export const AccessibilityOverlaySimulator: React.FC<AccessibilityOverlaySimulatorProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [selectedApp, setSelectedApp] = useState<'chat' | 'news' | 'ocr' | 'notifications'>('chat');
  const [overlayPosition, setOverlayPosition] = useState({ x: 80, y: 35 }); // percentage position
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const [selectedScreenText, setSelectedScreenText] = useState('Hey, dinner is ready! Call me when you get this.');
  const [isVibrating, setIsVibrating] = useState(false);
  const [activeMorseSymbol, setActiveMorseSymbol] = useState<string | null>(null);
  const [autoReadClipboard, setAutoReadClipboard] = useState(true);

  // Mock app contents
  const mockChatMessages = [
    { sender: 'Mom', text: 'Hey, dinner is ready! Call me when you get this.', time: '7:12 PM' },
    { sender: 'Alex', text: 'Meeting moved to 3 PM tomorrow.', time: '6:45 PM' },
    { sender: 'Transit Alert', text: 'Train Line 4 delayed by 10 mins.', time: '6:30 PM' }
  ];

  const mockNewsArticle = {
    title: 'New Tactile Interface Standard Enables Deaf-Blind Communication',
    body: 'Accessibility engineers have introduced a standardized haptic Morse protocol that converts on-screen typography into gentle wrist and finger vibrations in real time.'
  };

  const mockOcrText = 'WARNING: EMERGENCY EXIT DO NOT BLOCK DOORWAY';

  const mockNotifications = [
    { app: 'Banking', title: 'Payment Received', body: '$45.00 from Sarah' },
    { app: 'Weather', title: 'Severe Storm Warning', body: 'Heavy rainfall expected at 8:00 PM.' }
  ];

  // Trigger vibration playback of highlighted text
  const handleVibrateSelectedText = async (text: string) => {
    setSelectedScreenText(text);
    setIsVibrating(true);

    const timeline = buildPlaybackTimeline(text, settings.wpm);

    for (const event of timeline) {
      if (event.type === 'dot' || event.type === 'dash') {
        setActiveMorseSymbol(event.morseChar);

        if (settings.audioEnabled) {
          playSingleBeep(event.durationMs, settings.frequency, settings.volume);
        }
        if (settings.vibrationEnabled) {
          triggerHaptic(event.durationMs);
        }

        await new Promise((r) => setTimeout(r, event.durationMs));
        setActiveMorseSymbol(null);
      } else {
        await new Promise((r) => setTimeout(r, event.durationMs));
      }
    }

    setIsVibrating(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Android Haptic TalkBack Overlay</h2>
                <span className="px-2 py-0.5 rounded border border-amber-500/30 text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                  TalkBack via Morse
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Functions as a device TalkBack service — instead of speaking audio, it reads on-screen text and translates it directly into silent, tactile Morse vibration pulses.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-500 font-mono">Service:</span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[11px] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accessibility Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: App Selector & Controls */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Choose Android Screen Context</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedApp('chat')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  selectedApp === 'chat'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className={`w-4 h-4 ${selectedApp === 'chat' ? 'text-zinc-950' : 'text-emerald-400'}`} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Chat & Messages</div>
                    <div className={`text-[10px] ${selectedApp === 'chat' ? 'text-zinc-800 font-medium' : 'text-zinc-500'}`}>Tap incoming texts to vibrate</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedApp === 'chat' ? 'text-zinc-950' : 'text-zinc-600'}`} />
              </button>

              <button
                onClick={() => setSelectedApp('news')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  selectedApp === 'news'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Newspaper className={`w-4 h-4 ${selectedApp === 'news' ? 'text-zinc-950' : 'text-sky-400'}`} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Web Browser & News</div>
                    <div className={`text-[10px] ${selectedApp === 'news' ? 'text-zinc-800 font-medium' : 'text-zinc-500'}`}>Paragraph tactile reading</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedApp === 'news' ? 'text-zinc-950' : 'text-zinc-600'}`} />
              </button>

              <button
                onClick={() => setSelectedApp('ocr')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  selectedApp === 'ocr'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Camera className={`w-4 h-4 ${selectedApp === 'ocr' ? 'text-zinc-950' : 'text-rose-400'}`} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Camera OCR Reader</div>
                    <div className={`text-[10px] ${selectedApp === 'ocr' ? 'text-zinc-800 font-medium' : 'text-zinc-500'}`}>Signpost & image text reader</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedApp === 'ocr' ? 'text-zinc-950' : 'text-zinc-600'}`} />
              </button>

              <button
                onClick={() => setSelectedApp('notifications')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  selectedApp === 'notifications'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Bell className={`w-4 h-4 ${selectedApp === 'notifications' ? 'text-zinc-950' : 'text-purple-400'}`} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Push Notifications</div>
                    <div className={`text-[10px] ${selectedApp === 'notifications' ? 'text-zinc-800 font-medium' : 'text-zinc-500'}`}>Auto haptic alerts</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedApp === 'notifications' ? 'text-zinc-950' : 'text-zinc-600'}`} />
              </button>
            </div>
          </div>

          {/* Overlay Features Toggle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3.5 text-xs">
            <h4 className="font-black uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>Overlay Settings</span>
            </h4>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">Auto-Vibrate Copied Text</span>
              <button
                onClick={() => setAutoReadClipboard(!autoReadClipboard)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  autoReadClipboard ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-zinc-950 absolute top-0.75 transition-transform ${
                  autoReadClipboard ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Widget Position</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOverlayPosition({ x: 80, y: 20 })}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-zinc-800"
                >
                  Top Right
                </button>
                <button
                  onClick={() => setOverlayPosition({ x: 80, y: 70 })}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-zinc-800"
                >
                  Bottom Right
                </button>
                <button
                  onClick={() => setOverlayPosition({ x: 20, y: 50 })}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-zinc-800"
                >
                  Left Side
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2-Cols: Interactive Phone Screen Frame */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Simulated Android Device Frame */}
          <div className="w-full max-w-sm bg-zinc-950 border-4 border-zinc-800 rounded-[40px] p-4 shadow-2xl relative min-h-[520px] flex flex-col justify-between select-none">
            
            {/* Top Speaker & Camera Notch */}
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <span className="text-[10px] font-bold text-zinc-500 font-mono">9:41 AM</span>
              <div className="w-16 h-3 bg-zinc-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-950" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 font-mono">100%</span>
            </div>

            {/* SCREEN CONTENT AREA BASED ON SELECTED APP */}
            <div className="flex-1 bg-zinc-900 rounded-2xl p-3.5 border border-zinc-800 overflow-y-auto space-y-3 relative text-xs">
              
              {/* CHAT APP */}
              {selectedApp === 'chat' && (
                <div className="space-y-2.5">
                  <div className="pb-2 border-b border-zinc-800 flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px]">Messages</span>
                    <span className="text-[10px] text-amber-500 font-mono">Tap text to vibrate</span>
                  </div>

                  {mockChatMessages.map((msg, i) => (
                    <div
                      key={i}
                      onClick={() => handleVibrateSelectedText(msg.text)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:border-amber-500/50 ${
                        selectedScreenText === msg.text
                          ? 'bg-amber-500/10 border-amber-500 text-zinc-100 shadow-md'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                        <span className="font-bold text-amber-500">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-zinc-200 text-xs">{msg.text}</p>
                      <div className="mt-1.5 text-[9px] text-zinc-500 font-mono flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Morse: {textToMorse(msg.text).substring(0, 24)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NEWS APP */}
              {selectedApp === 'news' && (
                <div className="space-y-2.5">
                  <div className="pb-2 border-b border-zinc-800 font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-1.5 text-[11px]">
                    <Newspaper className="w-3.5 h-3.5 text-sky-400" />
                    <span>Tech Accessibility Daily</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-100 text-xs leading-snug">
                      {mockNewsArticle.title}
                    </h4>
                    <p
                      onClick={() => handleVibrateSelectedText(mockNewsArticle.body)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-zinc-300 text-xs leading-relaxed ${
                        selectedScreenText === mockNewsArticle.body
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      {mockNewsArticle.body}
                    </p>
                  </div>
                </div>
              )}

              {/* CAMERA OCR APP */}
              {selectedApp === 'ocr' && (
                <div className="space-y-2.5">
                  <div className="pb-2 border-b border-zinc-800 font-bold uppercase tracking-wider text-zinc-200 flex items-center justify-between text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span>Camera OCR Reader</span>
                    </span>
                    <span className="text-[10px] text-rose-400 font-mono font-bold animate-pulse">LIVE VIEW</span>
                  </div>

                  <div className="relative bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-4 text-center space-y-2">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Detected Sign Post Text</div>
                    <div
                      onClick={() => handleVibrateSelectedText(mockOcrText)}
                      className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-500 font-bold font-mono text-xs cursor-pointer hover:bg-amber-500/20 transition-all"
                    >
                      {mockOcrText}
                    </div>
                    <span className="text-[9px] text-zinc-400 block font-mono">Tap detected text to transmit tactile Morse</span>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {selectedApp === 'notifications' && (
                <div className="space-y-2.5">
                  <div className="pb-2 border-b border-zinc-800 font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-1.5 text-[11px]">
                    <Bell className="w-3.5 h-3.5 text-purple-400" />
                    <span>Notification Center</span>
                  </div>

                  {mockNotifications.map((notif, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleVibrateSelectedText(`${notif.title}: ${notif.body}`)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedScreenText.includes(notif.title)
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5 font-mono">
                        <span className="font-bold text-purple-400">{notif.app}</span>
                        <span>Just now</span>
                      </div>
                      <div className="font-bold text-zinc-100 text-xs">{notif.title}</div>
                      <div className="text-zinc-300 text-[11px]">{notif.body}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* FLOATING OVERLAY WIDGET BUTTON */}
            <div
              style={{
                position: 'absolute',
                left: `${overlayPosition.x}%`,
                top: `${overlayPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="z-30"
            >
              <div className="relative group">
                <button
                  onClick={() => setIsOverlayExpanded(!isOverlayExpanded)}
                  className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center font-black border-2 transition-all transform hover:scale-110 active:scale-95 ${
                    isVibrating
                      ? 'bg-amber-500 text-zinc-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce'
                      : 'bg-zinc-900 text-amber-500 border-amber-500/60 shadow-black'
                  }`}
                >
                  <Zap className={`w-6 h-6 ${isVibrating ? 'animate-spin' : ''}`} />
                </button>

                {/* Floating Widget Tooltip */}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-zinc-950 text-amber-500 border border-amber-500/30 rounded text-[9px] font-bold uppercase tracking-wider shadow-lg pointer-events-none">
                  Morse Overlay
                </span>

                {/* EXPANDED OVERLAY MENU */}
                {isOverlayExpanded && (
                  <div className="absolute right-0 top-14 w-60 bg-zinc-900 border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2.5 z-40">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                      <span className="font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> Accessibility Float
                      </span>
                      <button
                        onClick={() => setIsOverlayExpanded(false)}
                        className="text-zinc-500 hover:text-zinc-200 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-[11px] text-zinc-300">
                      Current Screen Text:
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[10px] text-amber-500 mt-1 line-clamp-2">
                        {selectedScreenText || 'No text selected on screen'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => handleVibrateSelectedText(selectedScreenText)}
                        className="w-full py-2 rounded-xl bg-amber-500 text-zinc-950 font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-1 hover:bg-amber-400 transition-all shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Vibrate Morse Now</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Home Bar */}
            <div className="w-32 h-1 bg-zinc-800 rounded-full mx-auto mt-3" />

          </div>

          {/* Real-time Overlay Status Indicator below Phone Frame */}
          <div className="mt-4 w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isVibrating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-bold uppercase tracking-tight text-zinc-300 text-[11px]">
                {isVibrating ? `Vibrating Morse (${activeMorseSymbol || ''})...` : 'Overlay Active & Listening'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">{settings.wpm} WPM</span>
          </div>

        </div>

      </div>

    </div>
  );
};
