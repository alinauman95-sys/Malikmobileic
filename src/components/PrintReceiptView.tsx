import React from 'react';
import { BillItem, formatCurrency, ShopConfig } from '../types';


interface PrintReceiptViewProps {
  billNo: string;
  billDate: string;
  billTime: string;
  customerName: string;
  items: BillItem[];
  paidAmount?: number;
  balance?: number;
  grandTotal: number; 
  shopConfig: ShopConfig;
}

export const PrintReceiptView: React.FC<PrintReceiptViewProps> = ({
  billNo,
  billDate,
  billTime,
  customerName,
  items,
  paidAmount = 0,
  balance = 0,
  grandTotal,
  shopConfig,
}) => {
  const displayCustomer = customerName.trim() || 'Cash / نقد';

  return (
    <div
      id="printableReceiptArea"
      className="bg-white p-6 max-w-lg mx-auto text-slate-900 border border-slate-300 shadow-none font-sans-custom print:border-none print:p-2"
      style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
    >
      {/* Header */}
      <div
        className="text-center border-b-2 border-slate-800 pb-3 mb-3"
        style={{ borderColor: '#1e293b' }}
      >
        <h1
          className="text-2xl font-black tracking-wider uppercase text-slate-900"
          style={{ color: '#0f172a' }}
        >
          {shopConfig.name.toUpperCase()}
        </h1>
        <p
          className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-0.5"
          style={{ color: '#475569' }}
        >
          {shopConfig.address} • {shopConfig.phone}
        </p>
        <p
          className="text-sm font-urdu text-slate-700 mt-1"
          style={{ color: '#334155' }}
        >
          {shopConfig.name} - کیش میمو
        </p>
      </div>

      {/* Bill Meta */}
      <div
        className="flex justify-between items-center text-xs font-semibold border-b border-slate-200 pb-2 mb-3"
        style={{ borderColor: '#e2e8f0' }}
      >
        <div>
          <span className="text-slate-500" style={{ color: '#64748b' }}>Bill No:</span>{' '}
          <span className="font-mono text-sm font-bold text-slate-900" style={{ color: '#0f172a' }}>#{billNo}</span>
        </div>
        <div className="text-right" style={{ color: '#475569' }}>
          <span className="text-slate-500" style={{ color: '#64748b' }}>Date:</span> {billDate} ({billTime})
        </div>
      </div>

      {/* Customer Tag */}
      <div
        className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold mb-3 flex justify-between items-center"
        style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
      >
        <span className="text-slate-600" style={{ color: '#475569' }}>Customer Name (گاہک کا نام):</span>
        <span className="font-urdu text-sm text-slate-900" style={{ color: '#0f172a' }}>{displayCustomer}</span>
      </div>

      {/* Items Table */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr
            className="bg-slate-100 border-y border-slate-300 font-bold uppercase"
            style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
          >
            <th className="py-2 px-2 text-right font-urdu text-xs" style={{ color: '#0f172a' }}>آئٹم (Item)</th>
            <th className="py-2 px-2 text-center" style={{ color: '#0f172a' }}>تعداد (Qty)</th>
            <th className="py-2 px-2 text-center" style={{ color: '#0f172a' }}>ریٹ (Rate)</th>
            <th className="py-2 px-2 text-right" style={{ color: '#0f172a' }}>کل (Total)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={index} style={{ borderBottomColor: '#e2e8f0' }}>
              <td className="py-2 px-2 text-right font-urdu text-sm font-semibold text-slate-900 dir-rtl" style={{ color: '#0f172a' }}>
                {item.name}
              </td>
              <td className="py-2 px-2 text-center font-bold text-slate-800" style={{ color: '#1e293b' }}>
                {item.qty}
              </td>
              <td className="py-2 px-2 text-center text-slate-700" style={{ color: '#334155' }}>
                {item.rate}
              </td>
              <td className="py-2 px-2 text-right font-bold text-slate-900" style={{ color: '#0f172a' }}>
                Rs {formatCurrency(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Details */}
      <div className="flex flex-col items-end gap-1 mb-2 px-2 text-[11px] font-bold text-slate-700">
        <div className="flex justify-between w-full max-w-[160px] border-b border-slate-200 pb-1">
          <span>Total Amount:</span>
          <span>Rs {formatCurrency(grandTotal)}</span>
        </div>
        <div className="flex justify-between w-full max-w-[160px] text-emerald-700">
          <span>Paid (وصول):</span>
          <span>Rs {formatCurrency(paidAmount)}</span>
        </div>
        {balance > 0 && (
          <div className="flex justify-between w-full max-w-[160px] text-red-600">
            <span>Balance (باقی):</span>
            <span>Rs {formatCurrency(balance)}</span>
          </div>
        )}
      </div>

      {/* Grand Total Box */}
      <div
        className="border-2 border-slate-900 bg-slate-50 rounded-lg p-3 flex justify-between items-center mb-6"
        style={{ borderColor: '#0f172a', backgroundColor: '#f8fafc' }}
      >
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800" style={{ color: '#1e293b' }}>
            GRAND TOTAL
          </span>
          <p className="text-xs font-urdu font-bold text-slate-700" style={{ color: '#334155' }}>کل قابل ادا رقم</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900" style={{ color: '#0f172a' }}>
            RS {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Footer Signatures */}
      <div
        className="pt-4 border-t border-dashed border-slate-300 text-center text-xs text-slate-500 flex flex-col gap-1"
        style={{ borderColor: '#cbd5e1' }}
      >
        <p className="font-urdu text-sm font-bold text-slate-800" style={{ color: '#1e293b' }}>
          شکریہ! دوبارہ تشریف لائیں۔
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          Thank you for your business! • Malik Rizwan Scrap Store
        </p>
      </div>
    </div>
  );
};
