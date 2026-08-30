export interface MorseSettings {
  wpm: number; // Words per minute (5 to 40)
  frequency: number; // Audio pitch in Hz (400 to 1000)
  volume: number; // 0 to 1
  vibrationEnabled: boolean;
  audioEnabled: boolean;
  flashEnabled: boolean;
  loopPlayback: boolean;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused';

export interface SmartwatchState {
  isConnected: boolean;
  deviceName: string;
  batteryLevel: number;
  hapticStrength: 'light' | 'medium' | 'strong';
  screenAlwaysOn: boolean;
  lastSyncedText: string;
  lastSyncedMorse: string;
}

export interface MockAppScreen {
  id: string;
  title: string;
  appIcon: string;
  appName: string;
  contentSnippet: string;
  fullText: string;
}

export interface MorseSymbol {
  char: string;
  morse: string;
  category: 'letter' | 'number' | 'symbol' | 'prosign';
}
