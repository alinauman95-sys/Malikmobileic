import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-2xl animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Cached data active</span>
    </div>
  );
};
