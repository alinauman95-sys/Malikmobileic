import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Smartphone, Info } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Download className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm">Install App (ایپ انسٹال کریں)</h3>
            <p className="text-[10px] text-indigo-100">Install for offline use & faster access</p>
          </div>
        </div>
        <Smartphone className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Install on iPhone</h3>
              <p className="text-[10px] text-indigo-100">Add to Home Screen</p>
            </div>
          </div>
          <Smartphone className="w-5 h-5 text-indigo-200" />
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  Install on iOS
                </h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tap the <strong>Share</strong> button (the square with an arrow) in the Safari toolbar.
                  </p>
                </div>

                <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-blue-600 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition shadow-lg"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex gap-3 items-center">
      <Info className="w-5 h-5 text-slate-400 shrink-0" />
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
        App installation is available on Chrome, Edge, and Safari. Check your browser menu to "Install" or "Add to Home Screen".
      </p>
    </div>
  );
};
