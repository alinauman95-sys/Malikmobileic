import React from 'react';
import { Settings as SettingsIcon, ToggleLeft, ToggleRight, Info, UserCheck, ShieldCheck, MapPin, Phone, Store, Download } from 'lucide-react';
import { ShopConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  autoLedgerEnabled: boolean;
  onToggleAutoLedger: () => void;
  shopConfig: ShopConfig;
  onUpdateShopConfig: (config: ShopConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  autoLedgerEnabled, 
  onToggleAutoLedger,
  shopConfig,
  onUpdateShopConfig
}) => {
  const handleConfigChange = (key: keyof ShopConfig, value: string) => {
    onUpdateShopConfig({ ...shopConfig, [key]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-6 pb-24 transition-colors duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-800 dark:bg-slate-900 rounded-xl shadow-lg border border-slate-700">
          <SettingsIcon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">App Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure System (سیٹ اپ)</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* App Installation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-500" />
            App Installation (ایپ انسٹال کریں)
          </h3>
          <PWAInstallButton />
        </div>

        {/* Shop Configuration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-500" />
            Shop Details (دکان کی معلومات)
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 block">Shop Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={shopConfig.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-100"
                  placeholder="e.g. Malik Rizwan Scrap Store"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 block">Shop Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={shopConfig.address}
                  onChange={(e) => handleConfigChange('address', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-100"
                  placeholder="e.g. Main Market, City"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 block">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={shopConfig.phone}
                  onChange={(e) => handleConfigChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 0300-1234567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auto Ledger Setting */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Auto-Ledger (خودکار کھاتہ)</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Automatically sync bill balances to customer profiles</p>
              </div>
            </div>
            <button 
              onClick={onToggleAutoLedger}
              className="transition-all duration-300 transform active:scale-95"
            >
              {autoLedgerEnabled ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              )}
            </button>
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex gap-2 border border-slate-100 dark:border-slate-800">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
              جب یہ آن ہو گا، ہر بل بناتے وقت گاہک کا باقی بیلنس خود بخود اس کے کھاتے میں اپ ڈیٹ ہو جائے گا۔ 
              (When enabled, saving a bill will automatically update the customer's balance in their profile.)
            </p>
          </div>
        </div>

        {/* Data Security Info */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Data Security (ڈیٹا کی حفاظت)</h3>
          </div>
          <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/50 leading-relaxed">
            آپ کا تمام ڈیٹا صرف آپ کے اس براؤزر میں محفوظ ہے۔ ہم کوئی بھی معلومات آن لائن نہیں بھیجتے۔
            (All your data is stored locally in this browser. We do not transmit any information online.)
          </p>
        </div>
      </div>
    </div>
  );
};
