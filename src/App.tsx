import React, { useState } from 'react';
import { Header } from './components/Header';
import { TextToMorseConverter } from './components/TextToMorseConverter';
import { AccessibilityOverlaySimulator } from './components/AccessibilityOverlaySimulator';
import { SmartwatchSync } from './components/SmartwatchSync';
import { MorseKeyer } from './components/MorseKeyer';
import { MorseDictionary } from './components/MorseDictionary';
import { AccessibilitySettingsGuide } from './components/AccessibilitySettingsGuide';
import { OnboardingSetup } from './components/OnboardingSetup';
import { MorseSettings, SmartwatchState } from './types';
import { textToMorse } from './utils/morse';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('converter');
  const [overlayActive, setOverlayActive] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  // Global Morse Engine Settings
  const [settings, setSettings] = useState<MorseSettings>({
    wpm: 15,
    frequency: 650,
    volume: 0.8,
    vibrationEnabled: true,
    audioEnabled: true,
    flashEnabled: true,
    loopPlayback: false,
    hapticIntensity: 'medium',
    firstTimeCompleted: false
  });

  // Wear OS Smartwatch State
  const [watchState, setWatchState] = useState<SmartwatchState>({
    isConnected: true,
    deviceName: 'Galaxy Watch 6 Pro',
    batteryLevel: 88,
    hapticStrength: 'medium',
    screenAlwaysOn: true,
    lastSyncedText: 'HELLO WORLD MORSE ACCESSIBILITY',
    lastSyncedMorse: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
  });

  const handleUpdateSettings = (newSettings: Partial<MorseSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleUpdateWatchState = (newState: Partial<SmartwatchState>) => {
    setWatchState(prev => ({ ...prev, ...newState }));
  };

  const handleToggleWatchConnect = () => {
    setWatchState(prev => ({ ...prev, isConnected: !prev.isConnected }));
  };

  const handleSendToWatch = (text: string, morse?: string) => {
    const computedMorse = morse || textToMorse(text);
    setWatchState(prev => ({
      ...prev,
      lastSyncedText: text,
      lastSyncedMorse: computedMorse,
      isConnected: true
    }));
    setActiveTab('watch');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Onboarding First-Time Setup Modal */}
      {showOnboarding && (
        <OnboardingSetup
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          watchState={watchState}
          onUpdateWatchState={handleUpdateWatchState}
          onComplete={() => {
            setShowOnboarding(false);
            setActiveTab('converter');
          }}
        />
      )}

      {/* Accessible Header & Navigation */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        watchState={watchState}
        onToggleWatchConnect={handleToggleWatchConnect}
        overlayActive={overlayActive}
        onToggleOverlay={() => setOverlayActive(!overlayActive)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'converter' && (
          <TextToMorseConverter
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            watchState={watchState}
            onSendToWatch={handleSendToWatch}
            overlayActive={overlayActive}
            onToggleOverlayWidget={() => setOverlayActive(!overlayActive)}
            onLaunchOverlayTab={() => setActiveTab('overlay')}
            onOpenSetupWizard={() => setShowOnboarding(true)}
          />
        )}

        {activeTab === 'overlay' && (
          <AccessibilityOverlaySimulator
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'watch' && (
          <SmartwatchSync
            settings={settings}
            watchState={watchState}
            onToggleConnect={handleToggleWatchConnect}
            onUpdateWatchState={handleUpdateWatchState}
          />
        )}

        {activeTab === 'keyer' && (
          <MorseKeyer
            settings={settings}
          />
        )}

        {activeTab === 'dictionary' && (
          <MorseDictionary
            settings={settings}
          />
        )}

        {activeTab === 'guide' && (
          <AccessibilitySettingsGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500 font-mono uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="text-zinc-400 font-bold">
            TactileMorse Accessibility • Android & Wear OS Tactile Engine
          </p>
          <p className="text-zinc-600 text-[10px]">
            Powered by Web Audio API & Web Haptic Vibration Engine
          </p>
        </div>
      </footer>

    </div>
  );
}
