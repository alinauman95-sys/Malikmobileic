import React, { useState, useRef, useEffect } from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
import { BillItem, formatCurrency } from '../types';

interface BillTableProps {
  items: BillItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, qty: number, rate: number) => void;
}

interface SwipeableRowProps {
  item: BillItem;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, qty: number, rate: number) => void;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({ item, onRemoveItem, onUpdateItem }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  const [qtyStr, setQtyStr] = useState(item.qty.toString());
  const [rateStr, setRateStr] = useState(item.rate.toString());

  useEffect(() => {
    setQtyStr(item.qty.toString());
  }, [item.qty]);

  useEffect(() => {
    setRateStr(item.rate.toString());
  }, [item.rate]);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQtyStr(val);
    const parsedQty = parseFloat(val);
    if (!isNaN(parsedQty) && parsedQty >= 0) {
      onUpdateItem(item.id, parsedQty, item.rate);
    }
  };

  const handleQtyBlur = () => {
    const parsed = parseFloat(qtyStr);
    if (isNaN(parsed) || parsed < 0) {
      setQtyStr(item.qty.toString());
    } else {
      setQtyStr(parsed.toString());
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRateStr(val);
    const parsedRate = parseFloat(val);
    if (!isNaN(parsedRate) && parsedRate >= 0) {
      onUpdateItem(item.id, item.qty, parsedRate);
    }
  };

  const handleRateBlur = () => {
    const parsed = parseFloat(rateStr);
    if (isNaN(parsed) || parsed < 0) {
      setRateStr(item.rate.toString());
    } else {
      setRateStr(parsed.toString());
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const targetTag = (e.target as HTMLElement)?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'BUTTON') return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff < 0) {
      currentXRef.current = Math.max(diff, -140);
      setTranslateX(currentXRef.current);
    } else if (diff > 0 && currentXRef.current < 0) {
      currentXRef.current = Math.min(0, currentXRef.current + diff);
      setTranslateX(currentXRef.current);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentXRef.current < -70) {
      setTranslateX(-300);
      setTimeout(() => {
        onRemoveItem(item.id);
      }, 150);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <tr
      className="relative hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Red Swipe Area */}
      <td
        colSpan={5}
        className="absolute inset-0 bg-red-600 text-white flex items-center justify-end px-4 pointer-events-none z-0 transition-opacity"
        style={{ opacity: translateX < -15 ? 1 : 0 }}
      >
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
          <Trash2 className="w-4 h-4 animate-pulse" />
          <span>حذف (Swipe to Delete)</span>
        </div>
      </td>

      {/* Row content */}
      <td
        className="py-2 px-3 text-right font-urdu text-slate-900 dark:text-slate-100 font-medium text-base dir-rtl bg-white dark:bg-slate-950 relative z-10 transition-transform duration-75"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {item.name}
      </td>
      <td
        className="py-1.5 px-1 text-center bg-white dark:bg-slate-950 relative z-10 transition-transform duration-75"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <input
          type="number"
          step="any"
          min="0"
          value={qtyStr}
          onChange={handleQtyChange}
          onBlur={handleQtyBlur}
          onFocus={(e) => e.target.select()}
          className="w-14 sm:w-16 text-center font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded py-1 px-1 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition"
          title="Edit Quantity"
        />
      </td>
      <td
        className="py-1.5 px-1 text-center bg-white dark:bg-slate-950 relative z-10 transition-transform duration-75"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <input
          type="number"
          step="any"
          min="0"
          value={rateStr}
          onChange={handleRateChange}
          onBlur={handleRateBlur}
          onFocus={(e) => e.target.select()}
          className="w-16 sm:w-20 text-center text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded py-1 px-1 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition"
          title="Edit Rate"
        />
      </td>
      <td
        className="py-2 px-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-950 relative z-10 transition-transform duration-75"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        Rs {formatCurrency(item.total)}
      </td>
      <td
        className="py-2 px-2 text-center no-print bg-white dark:bg-slate-950 relative z-10 transition-transform duration-75"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <button
          onClick={() => onRemoveItem(item.id)}
          className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-400 transition cursor-pointer"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export const BillTable: React.FC<BillTableProps> = ({ items, onRemoveItem, onUpdateItem }) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-[180px] bg-white dark:bg-slate-950 transition-colors duration-500">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th scope="col" className="py-2.5 px-3 text-right font-urdu text-sm">
              Item (آئٹم)
            </th>
            <th scope="col" className="py-2.5 px-2 text-center">
              Qty (تعداد)
            </th>
            <th scope="col" className="py-2.5 px-2 text-center">
              Rate
            </th>
            <th scope="col" className="py-2.5 px-3 text-right">
              Total (کل)
            </th>
            <th scope="col" className="py-2.5 px-2 text-center no-print w-10">
              ❌
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-600">
                <div className="flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-800" />
                  <p className="font-urdu text-base text-slate-500 dark:text-slate-400">
                    کوئی آئٹم شامل نہیں (No items added)
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-600">
                    آئٹم کا نام، تعداد اور ریٹ درج کر کے ADD بٹن دبائیں۔
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <SwipeableRow
                key={item.id}
                item={item}
                onRemoveItem={onRemoveItem}
                onUpdateItem={onUpdateItem}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

