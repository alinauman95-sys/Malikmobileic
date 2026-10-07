import React, { useState, useEffect } from 'react';
import { X, Trash2, Eye, Calendar, User, FileText, Search, Clock, Repeat } from 'lucide-react';
import { BillRecord, formatCurrency } from '../types';


interface BillHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedBills: BillRecord[];
  onLoadBill: (bill: BillRecord) => void;
  onRepeatOrder: (bill: BillRecord) => void;
  onDeleteBill: (id: string) => void;
  onClearAll: () => void;
  initialSearchQuery?: string;
}

export const BillHistoryModal: React.FC<BillHistoryModalProps> = ({
  isOpen,
  onClose,
  savedBills,
  onLoadBill,
  onRepeatOrder,
  onDeleteBill,
  onClearAll,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialSearchQuery);
    }
  }, [isOpen, initialSearchQuery]);

  if (!isOpen) return null;

  const query = searchQuery.trim().toLowerCase();

  // Sort saved bills time-wise (newest first)
  const sortedBills = [...savedBills].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  const filteredBills = sortedBills.filter((record) => {
    if (!query) return true;
    const matchesCustomer = record.customerName.toLowerCase().includes(query);
    const matchesDate = record.date.toLowerCase().includes(query);
    const matchesBillNo = record.billNo.toLowerCase().includes(query);
    const matchesItem = record.items.some((item) =>
      item.name.toLowerCase().includes(query)
    );
    return matchesCustomer || matchesDate || matchesBillNo || matchesItem;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Saved Bills History (سابقہ بل ریکارڈ)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Bar */}
        {savedBills.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2 transition-colors">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, date, or bill #..."
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                <span>
                  Filtering for: <strong className="text-blue-700 dark:text-blue-400">{searchQuery}</strong> ({filteredBills.length} found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Show All Bills
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {savedBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-600">
              <p className="font-urdu text-base text-slate-600 dark:text-slate-400 mb-1">
                کوئی سابقہ بل ریکارڈ موجود نہیں
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                جب بھی آپ کوئی بل مکمل کر کے نیا بل بنائیں گے، پرانا بل یہاں ریکارڈ ہو جائے گا۔
              </p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-600">
              <p className="font-urdu text-base text-slate-600 dark:text-slate-400 mb-1">
                کوئی نتائج نہیں ملے (No matching bills found)
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                براہ کرم دوبارہ سرچ کریں۔ Try searching by another customer name or date.
              </p>
            </div>
          ) : (
            filteredBills.map((record) => (
              <div
                key={record.id}
                className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition flex flex-col gap-2 shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      Bill #{record.billNo}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{record.date}</span>
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 ml-1" />
                      <span>{record.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Grand Total</span>
                    <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                      RS {formatCurrency(record.grandTotal)}
                    </p>
                    <div className="text-[10px] flex flex-col gap-0.5 mt-0.5">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 dark:text-slate-500">Paid:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rs {formatCurrency(record.paidAmount || 0)}</span>
                      </div>
                      {record.balance > 0 && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 dark:text-slate-500">Bal:</span>
                          <span className="text-red-600 dark:text-red-400 font-bold">Rs {formatCurrency(record.balance)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clickable Customer Name */}
                <div className="flex items-center justify-between gap-1 text-xs text-slate-700 font-medium bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Customer:</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery(record.customerName)}
                      className="font-urdu font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer truncate"
                      title="Click to view all bills for this customer time-wise"
                    >
                      {record.customerName}
                    </button>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] shrink-0 font-sans">
                    {record.items.length} items
                  </span>
                </div>

                {/* Item List Clear Table Breakdown */}
                {record.items && record.items.length > 0 && (
                  <div className="mt-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="py-1 px-2.5 font-urdu text-right">آئٹم کا نام (Item)</th>
                          <th className="py-1 px-2 text-center">وزن/تعداد (Qty)</th>
                          <th className="py-1 px-2 text-center">ریٹ (Rate)</th>
                          <th className="py-1 px-2.5 text-right">کل رقم (Total)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {record.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                            <td className="py-1.5 px-2.5 font-urdu text-right text-slate-800 dark:text-slate-200 font-bold">
                              {it.name}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-700 dark:text-slate-400 font-mono">
                              {it.qty}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-700 dark:text-slate-400 font-mono">
                              Rs {it.rate}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                              Rs {formatCurrency(it.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end items-center mt-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onRepeatOrder(record);
                      onClose();
                    }}
                    className="bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                    title="Load items and customer into a new bill for quick re-billing"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Repeat Order (دوبارہ آرڈر)</span>
                  </button>
                  <button
                    onClick={() => {
                      onLoadBill(record);
                      onClose();
                    }}
                    className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer transition"
                    title="View or edit this exact original bill"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View / Load</span>
                  </button>
                  <button
                    onClick={() => onDeleteBill(record.id)}
                    className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-1.5 rounded flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {savedBills.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

