import React from 'react';
import { 
  ShieldCheck, Layers, Watch, Download, Smartphone, 
  CheckCircle, ArrowUpRight, HelpCircle, AlertCircle
} from 'lucide-react';

export const AccessibilitySettingsGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">Android Accessibility & Wear OS Setup Guide</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure system alert windows, accessibility services, and smartwatch Bluetooth pairing for seamless screen vibration conversion.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Required Android Permissions Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-black uppercase tracking-wider text-zinc-300 text-xs flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-amber-500" />
            <span>Android Manifest Permissions</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px] block">SYSTEM_ALERT_WINDOW</span>
                <span className="text-zinc-400 text-[11px]">
                  Allows the floating Morse overlay widget to draw above all installed Android applications (WhatsApp, Chrome, Camera).
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px] block">BIND_ACCESSIBILITY_SERVICE</span>
                <span className="text-zinc-400 text-[11px]">
                  Listens to on-screen text selection and focus events to automatically translate highlighted text into tactile vibrations.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px] block">android.permission.VIBRATE</span>
                <span className="text-zinc-400 text-[11px]">
                  Grants low-latency access to the device linear resonant actuator (haptic engine) for precise dit and dah timing.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px] block">BLUETOOTH_SCAN & CONNECT</span>
                <span className="text-zinc-400 text-[11px]">
                  Syncs vibration patterns live with Wear OS smartwatches (Galaxy Watch, Pixel Watch, Garmin).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-black uppercase tracking-wider text-zinc-300 text-xs flex items-center space-x-2">
            <Watch className="w-4 h-4 text-amber-500" />
            <span>Wear OS Companion Setup</span>
          </h3>

          <ol className="space-y-3 text-xs list-decimal list-inside text-zinc-300">
            <li className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <strong className="text-zinc-100 font-bold uppercase tracking-wide">Install Mobile & Watch App:</strong> <span className="text-zinc-400">Install companion Wear OS app from Google Play or sideload APK.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <strong className="text-zinc-100 font-bold uppercase tracking-wide">Pair via Bluetooth:</strong> <span className="text-zinc-400">Open TactileMorse and tap <span className="text-amber-500 font-bold">"Pair Wear OS Device"</span>.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <strong className="text-zinc-100 font-bold uppercase tracking-wide">Enable Accessibility Overlay:</strong> <span className="text-zinc-400">Go to <span className="text-amber-500 font-bold">Android Settings &gt; Accessibility &gt; TactileMorse Service</span> and toggle ON.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <strong className="text-zinc-100 font-bold uppercase tracking-wide">Test Screen Conversion:</strong> <span className="text-zinc-400">Tap text in any app, or drag floating ball over text to feel instant vibration.</span>
            </li>
          </ol>
        </div>

      </div>

    </div>
  );
};
