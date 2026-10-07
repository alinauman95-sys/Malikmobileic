import React, { useMemo, useState } from 'react';
import { Users, Search, ArrowRight, UserPlus, Phone, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';
import { BillRecord, CustomerProfile, formatCurrency } from '../types';

interface CustomerLedgerProps {
  bills: BillRecord[];
  profiles: CustomerProfile[];
}

interface CustomerSummary {
  name: string;
  totalOrders: number;
  totalBilled: number;
  totalPaid: number;
  totalBalance: number;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({ bills, profiles }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const customerSummaries = useMemo(() => {
    const map = new Map<string, CustomerSummary & { isSynced: boolean }>();

    bills.forEach(bill => {
      const name = bill.customerName.trim();
      if (name === 'Cash / نقد' || !name) return;

      const existing = map.get(name) || {
        name,
        totalOrders: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalBalance: 0,
        isSynced: profiles.some(p => p.name.toLowerCase() === name.toLowerCase()),
      };

      existing.totalOrders += 1;
      existing.totalBilled += bill.grandTotal;
      existing.totalPaid += (bill.paidAmount || 0);
      existing.totalBalance += (bill.balance || 0);

      map.set(name, existing);
    });

    return Array.from(map.values())
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }, [bills, searchTerm, profiles]);

  const totalOutstanding = customerSummaries.reduce((acc, curr) => acc + curr.totalBalance, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-6 pb-24 transition-colors duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 dark:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 dark:shadow-none">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Customer Ledger</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khata Book (کھاتہ بک)</p>
          </div>
        </div>
      </div>

      {/* Total Balance Summary Card */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-colors border border-transparent dark:border-slate-800">
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Outstanding (کل باقی رقم)</p>
          <p className="text-3xl font-black">Rs {formatCurrency(totalOutstanding)}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span>Across {customerSummaries.length} active khata accounts</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <CreditCard className="w-32 h-32 rotate-12" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search customer name... (نام تلاش کریں)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-3">
          {customerSummaries.length > 0 ? (
            customerSummaries.map((customer) => (
              <div 
                key={customer.name}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{customer.name}</h4>
                        {customer.isSynced && (
                          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-[8px] font-black text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/50 uppercase tracking-tighter">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Auto-Synced</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {customer.totalOrders} Bills
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Balance (باقی)</span>
                    <span className={`text-lg font-black ${customer.totalBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      Rs {formatCurrency(customer.totalBalance)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Total Business</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rs {formatCurrency(customer.totalBilled)}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Total Paid</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Rs {formatCurrency(customer.totalPaid)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Users className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
