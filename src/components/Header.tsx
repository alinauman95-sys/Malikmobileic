import React from 'react';
import { History, FileText, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  billNo: string;
  billDate: string;
  billTime: string;
  onOpenHistory?: () => void;
  savedBillsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  billNo,
  billDate,
  billTime,
  onOpenHistory,
  savedBillsCount = 0,
  theme,
  onToggleTheme,
}) => {
  return (
    <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 border-b-2 border-slate-700 dark:border-slate-800 shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              MALIK RIZWAN
            </h1>
            <span className="bg-emerald-600 dark:bg-emerald-700 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Scrap Store
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 text-xs font-urdu">
              کیش میمو / بل رسید • Cash Memo
            </p>
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-xs font-semibold text-slate-300">
            {billDate} <span className="text-slate-400 font-normal">({billTime})</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-slate-800 dark:bg-slate-900 text-blue-400 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-700 dark:border-slate-800">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Bill #{billNo}</span>
          </div>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="no-print mt-1 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded transition"
              title="View saved bill history"
            >
              <History className="w-3 h-3 text-amber-400" />
              <span>History ({savedBillsCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
