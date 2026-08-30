import { MorseSettings, MorseSymbol } from '../types';

export const MORSE_MAP: Record<string, string> = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/'
};

export const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [char, morse]) => {
    acc[morse] = char;
    return acc;
  },
  {} as Record<string, string>
);

export const MORSE_DICTIONARY_LIST: MorseSymbol[] = [
  // Letters
  ...('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => ({
    char,
    morse: MORSE_MAP[char],
    category: 'letter' as const
  }))),
  // Numbers
  ...('0123456789'.split('').map(char => ({
    char,
    morse: MORSE_MAP[char],
    category: 'number' as const
  }))),
  // Symbols
  ...['.', ',', '?', '!', '@', '/', '(', ')', '+', '-', '=', '$'].map(char => ({
    char,
    morse: MORSE_MAP[char],
    category: 'symbol' as const
  })),
  // Prosigns
  { char: 'SOS', morse: '...---...', category: 'prosign' },
  { char: 'SK (End of Work)', morse: '...-.-', category: 'prosign' },
  { char: 'AR (End of Msg)', morse: '.-.-.', category: 'prosign' },
  { char: 'BT (Pause)', morse: '-...-', category: 'prosign' }
];

export function textToMorse(text: string): string {
  if (!text) return '';
  return text
    .toUpperCase()
    .trim()
    .split('')
    .map(char => {
      if (char === ' ' || char === '\n') return '/';
      return MORSE_MAP[char] || '?';
    })
    .join(' ');
}

export function morseToText(morse: string): string {
  if (!morse) return '';
  const words = morse.trim().split(' / ');
  return words
    .map(word => {
      const chars = word.split(' ');
      return chars
        .map(code => REVERSE_MORSE_MAP[code] || '?')
        .join('');
    })
    .join(' ');
}

/**
 * Calculates timings in milliseconds based on standard WPM formula
 */
export function getMorseTimings(wpm: number) {
  const dotUnitMs = Math.round(1200 / wpm);
  return {
    dotMs: dotUnitMs,
    dashMs: dotUnitMs * 3,
    intraSymbolPauseMs: dotUnitMs, // between dots/dashes of same letter
    interCharPauseMs: dotUnitMs * 3, // between letters
    interWordPauseMs: dotUnitMs * 7 // between words
  };
}

export interface PlaybackTimelineEvent {
  type: 'dot' | 'dash' | 'pause' | 'word-space';
  durationMs: number;
  charIndex: number;
  morseChar: string;
  originalChar: string;
}

export function buildPlaybackTimeline(text: string, wpm: number): PlaybackTimelineEvent[] {
  const { dotMs, dashMs, intraSymbolPauseMs, interCharPauseMs, interWordPauseMs } = getMorseTimings(wpm);
  const events: PlaybackTimelineEvent[] = [];
  const chars = text.toUpperCase().split('');

  chars.forEach((originalChar, charIdx) => {
    if (originalChar === ' ' || originalChar === '\n') {
      events.push({
        type: 'word-space',
        durationMs: interWordPauseMs,
        charIndex: charIdx,
        morseChar: '/',
        originalChar: ' '
      });
      return;
    }

    const morseCode = MORSE_MAP[originalChar];
    if (!morseCode) return;

    const symbols = morseCode.split('');
    symbols.forEach((symbol, symIdx) => {
      const isDot = symbol === '.';
      events.push({
        type: isDot ? 'dot' : 'dash',
        durationMs: isDot ? dotMs : dashMs,
        charIndex: charIdx,
        morseChar: symbol,
        originalChar
      });

      // Pause after symbol if not the last symbol in character
      if (symIdx < symbols.length - 1) {
        events.push({
          type: 'pause',
          durationMs: intraSymbolPauseMs,
          charIndex: charIdx,
          morseChar: symbol,
          originalChar
        });
      }
    });

    // Pause after character if not space and not last character
    if (charIdx < chars.length - 1 && chars[charIdx + 1] !== ' ') {
      events.push({
        type: 'pause',
        durationMs: interCharPauseMs,
        charIndex: charIdx,
        morseChar: '',
        originalChar
      });
    }
  });

  return events;
}

// Audio synthesizer singleton using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSingleBeep(durationMs: number, frequency: number, volume: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      const attack = 0.005;
      const release = 0.005;
      const now = ctx.currentTime;
      const durationSec = durationMs / 1000;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.4, now + attack);
      gain.gain.setValueAtTime(volume * 0.4, now + durationSec - release);
      gain.gain.linearRampToValueAtTime(0, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);

      setTimeout(() => {
        resolve();
      }, durationMs);
    } catch {
      setTimeout(resolve, durationMs);
    }
  });
}

export function triggerHaptic(durationMs: number) {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration error
    }
  }
}
