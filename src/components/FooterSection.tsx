import React from 'react';
import { RotateCcw, Camera, Printer } from 'lucide-react';
import { formatCurrency } from '../types';


interface FooterSectionProps {
  grandTotal: number;
  onNewBill: () => void;
  onSaveImage: () => void;
  onPrint: () => void;
  isExporting?: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  grandTotal,
  onNewBill,
  onSaveImage,
  onPrint,
  isExporting = false,
}) => {
  return (
    <div className="no-print p-3 sm:p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-lg flex flex-col gap-3 transition-colors duration-500">
      {/* Grand Total Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Grand Total
          </span>
          <p className="text-xs text-emerald-700 dark:text-emerald-500 font-urdu">کل بل کی رقم</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mr-1">RS</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onNewBill}
          className="bg-slate-600 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 active:bg-slate-800 text-white font-bold py-2.5 px-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Bill</span>
        </button>

        <button
          onClick={onSaveImage}
          disabled={isExporting}
          className="bg-teal-600 dark:bg-teal-800 hover:bg-teal-700 dark:hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-2.5 px-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{isExporting ? 'Saving...' : 'Save Image'}</span>
        </button>

        <button
          onClick={onPrint}
          className="bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};
