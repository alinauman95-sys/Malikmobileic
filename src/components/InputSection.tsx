import React, { useState, useRef, useMemo } from 'react';
import { PlusCircle, Tag, User, Hash, DollarSign, Lightbulb, History, Scale, Calculator } from 'lucide-react';
import { QUICK_ITEM_SUGGESTIONS, BillRecord, Product } from '../types';

interface InputSectionProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  onAddItem: (name: string, qty: number, rate: number) => void;
  savedBills: BillRecord[];
  products: Product[];
  onOpenCustomerHistory: (custName: string) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  customerName,
  setCustomerName,
  onAddItem,
  savedBills,
  products,
  onOpenCustomerHistory,
}) => {
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [isWeightCalcOpen, setIsWeightCalcOpen] = useState(false);
  const [weightInKg, setWeightInKg] = useState('');

  const itemInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  // Weight Calculation (Maunds/Mann)
  const maundsResult = useMemo(() => {
    const kg = parseFloat(weightInKg) || 0;
    if (kg <= 0) return null;
    const mann = Math.floor(kg / 40);
    const remainderKg = kg % 40;
    return { mann, remainderKg };
  }, [weightInKg]);

  const applyWeightToQty = () => {
    if (weightInKg) {
      setQty(weightInKg);
      setIsWeightCalcOpen(false);
      setWeightInKg('');
    }
  };

  // Helper to find rate hint for a given item string
  const findRateHintForItem = (searchItem: string) => {
    const trimmedItem = searchItem.trim().toLowerCase();
    if (!trimmedItem) return null;

    // 1st Priority: Match from custom product inventory
    const inventoryMatch = products.find(p => p.name.toLowerCase() === trimmedItem);
    if (inventoryMatch) {
      return {
        rate: inventoryMatch.defaultRate,
        customerName: 'Inventory (اسٹاک)',
        date: 'Current',
        time: '',
        isSpecificCustomer: false,
        isInventory: true
      };
    }

    const trimmedCust = customerName.trim().toLowerCase();

    // 1st Priority: Match exact or partial customer name + matching item name in saved bills
    if (trimmedCust) {
      for (const bill of savedBills) {
        const billCust = bill.customerName.toLowerCase();
        if (billCust.includes(trimmedCust) || trimmedCust.includes(billCust)) {
          const matchedItem = bill.items.find((i) =>
            i.name.toLowerCase().includes(trimmedItem) || trimmedItem.includes(i.name.toLowerCase())
          );
          if (matchedItem) {
            return {
              rate: matchedItem.rate,
              customerName: bill.customerName,
              date: bill.date,
              time: bill.time,
              isSpecificCustomer: true,
            };
          }
        }
      }
    }

    // 2nd Priority: Match item name across any customer's saved bills
    for (const bill of savedBills) {
      const matchedItem = bill.items.find((i) =>
        i.name.toLowerCase().includes(trimmedItem) || trimmedItem.includes(i.name.toLowerCase())
      );
      if (matchedItem) {
        return {
          rate: matchedItem.rate,
          customerName: bill.customerName,
          date: bill.date,
          time: bill.time,
          isSpecificCustomer: false,
        };
      }
    }

    return null;
  };

  // Calculate last rate given for the current item name
  const lastRateHint = useMemo(() => {
    return findRateHintForItem(itemName);
  }, [itemName, customerName, savedBills]);

  // Count total saved bills for this customer
  const customerBillsCount = useMemo(() => {
    const trimmed = customerName.trim().toLowerCase();
    if (!trimmed) return 0;
    return savedBills.filter((b) =>
      b.customerName.toLowerCase().includes(trimmed)
    ).length;
  }, [customerName, savedBills]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = itemName.trim();
    const parsedQty = parseFloat(qty);
    const parsedRate = parseFloat(rate);

    if (!trimmedName) {
      alert('براہ کرم آئٹم کا نام لکھیں! (Please enter item name)');
      itemInputRef.current?.focus();
      return;
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('براہ کرم صحیح تعداد درج کریں! (Please enter valid quantity)');
      qtyInputRef.current?.focus();
      return;
    }

    if (isNaN(parsedRate) || parsedRate <= 0) {
      alert('براہ کرم صحیح ریٹ درج کریں! (Please enter valid rate)');
      return;
    }

    onAddItem(trimmedName, parsedQty, parsedRate);

    // Reset item specific inputs and keep focus on item input
    setItemName('');
    setQty('');
    setRate('');
    itemInputRef.current?.focus();
  };

  const handleSelectPreset = (suggestion: string) => {
    setItemName(suggestion);
    setShowPresets(false);
    
    // Auto fill rate if a hint exists for this preset
    const hint = findRateHintForItem(suggestion);
    if (hint) {
      setRate(hint.rate.toString());
    }
    
    qtyInputRef.current?.focus();
  };

  const applyLastRate = () => {
    if (lastRateHint) {
      setRate(lastRateHint.rate.toString());
    }
  };

  return (
    <div className="no-print p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 shadow-inner flex flex-col gap-2.5 transition-colors duration-500">
      {/* Customer Name Input + Customer History Button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name (گاہک کا نام)"
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {customerName.trim() !== '' && (
          <button
            type="button"
            onClick={() => onOpenCustomerHistory(customerName.trim())}
            className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center gap-1 shadow-xs transition cursor-pointer whitespace-nowrap"
            title="Click to view all bills for this customer"
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
            <span>
              Bills ({customerBillsCount})
            </span>
          </button>
        )}
      </div>

      {/* Item Name Input with Datalist & Quick Chips */}
      <div className="flex flex-col gap-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Tag className="w-4 h-4" />
          </div>
          <input
            ref={itemInputRef}
            type="text"
            list="itemSuggestionsList"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onFocus={() => setShowPresets(true)}
            placeholder="Item Name (آئٹم کا نام - type or choose)"
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm font-urdu dir-rtl text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <datalist id="itemSuggestionsList">
            {products.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
            {QUICK_ITEM_SUGGESTIONS.map((item, idx) => (
              <option key={`q-${idx}`} value={item} />
            ))}
          </datalist>
        </div>

        {/* Quick Item Preset Chips */}
        {showPresets && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg shadow-sm flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {products.length > 0 && (
              <>
                <span className="text-[11px] font-semibold text-blue-500 w-full mb-0.5">
                  Your Products (آپ کے آئٹمز):
                </span>
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.name)}
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 transition font-urdu cursor-pointer font-bold"
                  >
                    {p.name}
                  </button>
                ))}
                <div className="w-full border-t border-slate-100 dark:border-slate-800 my-1"></div>
              </>
            )}
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-full mb-0.5">
              General Suggestions (عام آئٹمز):
            </span>
            {QUICK_ITEM_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition font-urdu cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Last Rate Hint Badge */}
      {lastRateHint && (
        <div
          onClick={applyLastRate}
          className={`${lastRateHint.isInventory ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'} border rounded-lg p-2 text-xs flex justify-between items-center cursor-pointer transition shadow-xs`}
          title="Click to apply this rate automatically"
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb className={`w-4 h-4 ${lastRateHint.isInventory ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'} animate-pulse shrink-0`} />
            <div>
              <span className="font-bold">
                {lastRateHint.isInventory ? 'Inventory Rate' : `Last Rate (${lastRateHint.isSpecificCustomer ? 'For Customer' : lastRateHint.customerName})`}:
              </span>{' '}
              <span className={`font-mono font-bold text-sm ${lastRateHint.isInventory ? 'text-blue-800 dark:text-blue-300' : 'text-amber-800 dark:text-amber-300'}`}>
                Rs {lastRateHint.rate}
              </span>{' '}
              <span className="text-[10px] opacity-75 font-normal">
                ({lastRateHint.date})
              </span>
            </div>
          </div>
          <span className={`${lastRateHint.isInventory ? 'bg-blue-600 dark:bg-blue-700' : 'bg-amber-600 dark:bg-amber-700'} text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs ml-1`}>
            Apply Rate ⚡
          </span>
        </div>
      )}

      {/* Quantity, Rate & Add Button Form */}
      <div className="flex justify-between items-center px-1">
        <button 
          type="button"
          onClick={() => setIsWeightCalcOpen(!isWeightCalcOpen)}
          className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded transition ${isWeightCalcOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'}`}
        >
          <Scale className="w-3 h-3" />
          <span>Maunds Calculator (وزن کنورٹر)</span>
        </button>
      </div>

      {isWeightCalcOpen && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2.5 rounded-lg shadow-sm animate-fade-in flex flex-col gap-2 transition-colors duration-500">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-400 dark:text-blue-600">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <input
                type="number"
                value={weightInKg}
                onChange={(e) => setWeightInKg(e.target.value)}
                placeholder="Enter Weight in KG..."
                className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={applyWeightToQty}
              disabled={!weightInKg}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 text-white text-[10px] font-bold px-3 py-2 rounded-md transition"
            >
              APPLY WEIGHT
            </button>
          </div>
          {maundsResult && (
            <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded border border-blue-100 dark:border-blue-900/50 flex justify-around items-center">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mann (من)</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-400">{maundsResult.mann}</span>
              </div>
              <div className="w-px h-6 bg-blue-200 dark:bg-blue-800"></div>
              <div className="text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Kg (کلو)</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-400">{maundsResult.remainderKg}</span>
              </div>
              <div className="w-px h-6 bg-blue-200 dark:bg-blue-800"></div>
              <div className="text-[10px] font-urdu font-bold text-slate-700 dark:text-slate-300">
                {maundsResult.mann} من {maundsResult.remainderKg} کلو
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAdd} className="grid grid-cols-12 gap-2">
        <div className="col-span-5 sm:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Hash className="w-3.5 h-3.5" />
          </div>
          <input
            ref={qtyInputRef}
            type="number"
            step="any"
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Qty (تعداد)"
            className="w-full pl-8 pr-2 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="col-span-4 sm:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Rate (ریٹ)"
            className="w-full pl-8 pr-2 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <button
          type="submit"
          className="col-span-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-lg shadow transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ADD</span>
        </button>
      </form>
    </div>
  );
};

