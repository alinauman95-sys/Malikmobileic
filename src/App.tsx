import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { BillTable } from './components/BillTable';
import { FooterSection } from './components/FooterSection';
import { PrintReceiptView } from './components/PrintReceiptView';
import { BillHistoryModal } from './components/BillHistoryModal';
import { InsightsView } from './components/InsightsView';
import { ProductManager } from './components/ProductManager';
import { ICDecoder } from './components/ICDecoder';
import { ExpenseManager } from './components/ExpenseManager';
import { CustomerLedger } from './components/CustomerLedger';
import { SettingsView } from './components/SettingsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BillItem, BillRecord, Product, Expense, CustomerProfile, ShopConfig, formatCurrency, roundAmount } from './types';
import { ShoppingCart, BarChart2, Package, History, Cpu, Wallet, Users, Settings } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('malik_rizwan_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'billing' | 'insights' | 'products' | 'decoder' | 'expenses' | 'ledger' | 'settings'>('billing');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('malik_rizwan_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...newExp,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const [savedBills, setSavedBills] = useState<BillRecord[]>(() => {
    try {
      const history = localStorage.getItem('malik_rizwan_saved_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  });

  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_customer_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autoLedgerEnabled, setAutoLedgerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_auto_ledger');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [shopConfig, setShopConfig] = useState<ShopConfig>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_shop_config');
      return saved ? JSON.parse(saved) : {
        name: 'Malik Rizwan Scrap Store',
        address: 'Main Market, City',
        phone: '0300-1234567'
      };
    } catch {
      return {
        name: 'Malik Rizwan Scrap Store',
        address: 'Main Market, City',
        phone: '0300-1234567'
      };
    }
  });

  const todayStr = new Date().toLocaleDateString('en-GB');
  const totalSalesToday = savedBills
    .filter(b => b.date === todayStr)
    .reduce((acc, curr) => acc + curr.grandTotal, 0);
  
  const totalCollectedToday = savedBills
    .filter(b => b.date === todayStr)
    .reduce((acc, curr) => acc + curr.paidAmount, 0);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [items, setItems] = useState<BillItem[]>(() => {
    try {
      const saved = localStorage.getItem('malik_rizwan_active_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    try {
      return localStorage.getItem('malik_rizwan_cust_name') || '';
    } catch {
      return '';
    }
  });

  const [billNo, setBillNo] = useState<string>(() => {
    try {
      let num = localStorage.getItem('malik_rizwan_bill_no');
      if (!num) {
        num = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('malik_rizwan_bill_no', num);
      }
      return num;
    } catch {
      return Math.floor(1000 + Math.random() * 9000).toString();
    }
  });

  const [billDate, setBillDate] = useState<string>('');
  const [billTime, setBillTime] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setBillDate(now.toLocaleDateString('en-GB'));
    setBillTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_active_items', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_cust_name', customerName);
    } catch (e) {
      console.error(e);
    }
  }, [customerName]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_saved_history', JSON.stringify(savedBills));
    } catch (e) {
      console.error(e);
    }
  }, [savedBills]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_customer_profiles', JSON.stringify(customerProfiles));
    } catch (e) {
      console.error(e);
    }
  }, [customerProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_auto_ledger', JSON.stringify(autoLedgerEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [autoLedgerEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_shop_config', JSON.stringify(shopConfig));
    } catch (e) {
      console.error(e);
    }
  }, [shopConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('malik_rizwan_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  const handleOpenCustomerHistory = (custName: string) => {
    setHistorySearchQuery(custName);
    setIsHistoryOpen(true);
  };

  const handleOpenGeneralHistory = () => {
    setHistorySearchQuery('');
    setIsHistoryOpen(true);
  };

  const handleAddItem = (name: string, qty: number, rate: number) => {
    const computedTotal = roundAmount(qty * rate);
    const newItem: BillItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name,
      qty,
      rate,
      total: computedTotal,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updatedQty: number, updatedRate: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const computedTotal = roundAmount(updatedQty * updatedRate);
          return {
            ...item,
            qty: updatedQty,
            rate: updatedRate,
            total: computedTotal,
          };
        }
        return item;
      })
    );
  };

  const grandTotal = roundAmount(items.reduce((acc, curr) => acc + curr.total, 0));


  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const updateCustomerProfile = (name: string, billed: number, paid: number) => {
    if (!autoLedgerEnabled || !name || name.trim() === '' || name === 'Cash / نقد') return;
    
    setCustomerProfiles(prev => {
      const trimmedName = name.trim();
      const existingIdx = prev.findIndex(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      const now = Date.now();
      
      if (existingIdx > -1) {
        const updated = [...prev];
        const p = updated[existingIdx];
        updated[existingIdx] = {
          ...p,
          totalBilled: roundAmount(p.totalBilled + billed),
          totalPaid: roundAmount(p.totalPaid + paid),
          totalBalance: roundAmount(p.totalBalance + (billed - paid)),
          lastUpdated: now,
        };
        return updated;
      } else {
        const newProfile: CustomerProfile = {
          id: now.toString(),
          name: trimmedName,
          totalBilled: roundAmount(billed),
          totalPaid: roundAmount(paid),
          totalBalance: roundAmount(billed - paid),
          lastUpdated: now,
        };
        return [newProfile, ...prev];
      }
    });
  };

  const handleNewBill = () => {
    let savedMsg = '';
    // Auto-save current bill to history if items exist
    if (items.length > 0) {
      const now = new Date();
      const record: BillRecord = {
        id: Date.now().toString(),
        billNo,
        date: billDate || now.toLocaleDateString('en-GB'),
        time:
          billTime ||
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerName: customerName.trim() || 'Cash / نقد',
        items: [...items],
        grandTotal,
        paidAmount,
        balance: roundAmount(grandTotal - paidAmount),
        createdAt: Date.now(),
      };
      setSavedBills((prev) => [record, ...prev]);
      updateCustomerProfile(record.customerName, record.grandTotal, record.paidAmount);
      savedMsg = `بل #${billNo} ہسٹری میں محفوظ کر دیا گیا! (Bill #${billNo} Saved)`;
    } else {
      savedMsg = 'نیا بل شروع کر دیا گیا ہے! (New bill started)';
    }

    // Reset bill state
    setItems([]);
    setCustomerName('');
    setPaidAmount(0);
    const now = new Date();
    setBillDate(now.toLocaleDateString('en-GB'));
    setBillTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    const newNo = Math.floor(1000 + Math.random() * 9000).toString();
    setBillNo(newNo);
    try {
      localStorage.setItem('malik_rizwan_bill_no', newNo);
    } catch (e) {
      console.error(e);
    }

    showToast(savedMsg);
  };

  const sanitizeColorString = (str: string, ctx: CanvasRenderingContext2D | null): string => {
    if (!str) return str;
    return str.replace(/(oklch|oklab|color)\([^)]+\)/gi, (match) => {
      if (!ctx) return 'rgb(15, 23, 42)';
      try {
        ctx.fillStyle = '#0f172a';
        ctx.fillStyle = match.trim();
        const res = ctx.fillStyle;
        if (res && res !== '#0f172a') return res;
        return 'rgb(15, 23, 42)';
      } catch {
        return 'rgb(15, 23, 42)';
      }
    });
  };

  const executeWithCleanCanvasStyles = async <T,>(action: () => Promise<T>): Promise<T> => {
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d');

    // 1. Temporarily sanitize all <style> tags in document
    const styleRestores: Array<() => void> = [];
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleEl) => {
      const origText = styleEl.textContent;
      if (origText && (origText.includes('oklch') || origText.includes('oklab') || origText.includes('color('))) {
        styleEl.textContent = sanitizeColorString(origText, ctx);
        styleRestores.push(() => {
          styleEl.textContent = origText;
        });
      }
    });

    // 2. Temporarily proxy window.getComputedStyle
    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
      const style = origGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === 'getPropertyValue') {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                return sanitizeColorString(val, ctx);
              }
              return val;
            };
          }
          const val = target[prop as keyof CSSStyleDeclaration];
          if (typeof val === 'function') {
            return (val as Function).bind(target);
          }
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
            return sanitizeColorString(val, ctx);
          }
          return val;
        },
      });
    };

    try {
      return await action();
    } finally {
      window.getComputedStyle = origGetComputedStyle;
      styleRestores.forEach((restore) => restore());
    }
  };

  const handleSaveImage = async () => {
    if (items.length === 0) {
      alert('براہ کرم پہلے آئٹم شامل کریں! (Please add items first to save image)');
      return;
    }

    try {
      setIsExporting(true);
      const receiptElement = document.getElementById('printableReceiptArea');
      if (!receiptElement) return;

      const image = await executeWithCleanCanvasStyles(async () => {
        const canvas = await html2canvas(receiptElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          onclone: (clonedDoc) => {
            const clonedWin = clonedDoc.defaultView;
            if (clonedWin) {
              const origCS = clonedWin.getComputedStyle;
              clonedWin.getComputedStyle = function (e: Element, p?: string | null) {
                const s = origCS.call(clonedWin, e, p);
                return new Proxy(s, {
                  get(target, prop, receiver) {
                    if (prop === 'getPropertyValue') {
                      return (propertyName: string) => {
                        const val = target.getPropertyValue(propertyName);
                        if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                          return 'rgb(15, 23, 42)';
                        }
                        return val;
                      };
                    }
                    const val = target[prop as keyof CSSStyleDeclaration];
                    if (typeof val === 'function') {
                      return (val as Function).bind(target);
                    }
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                      return 'rgb(15, 23, 42)';
                    }
                    return val;
                  },
                });
              };
            }

            clonedDoc.querySelectorAll('style').forEach((st) => {
              if (st.textContent && (st.textContent.includes('oklch') || st.textContent.includes('oklab'))) {
                st.textContent = st.textContent.replace(/(oklch|oklab|color)\([^)]+\)/gi, 'rgb(15, 23, 42)');
              }
            });
          },
        });
        return canvas.toDataURL('image/png', 1.0);
      });

      const fileName = `Bill_${billNo}_${customerName ? customerName.replace(/\s+/g, '_') : 'Customer'}_${billDate.replace(/\//g, '-')}.png`;
      const link = document.createElement('a');
      link.href = image;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export bill image:', error);
      alert(`تصویر نہیں بن سکی: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (items.length === 0) {
      alert('پرنٹ کرنے کے لیے پہلے آئٹم شامل کریں۔ (Please add items to print)');
      return;
    }
    window.print();
  };

  const handleLoadBill = (record: BillRecord) => {
    setBillNo(record.billNo);
    setBillDate(record.date);
    setBillTime(record.time);
    setCustomerName(record.customerName === 'Cash / نقد' ? '' : record.customerName);
    setItems(record.items);
    showToast(`بل #${record.billNo} لوڈ کر دیا گیا! (Bill #${record.billNo} loaded)`);
  };

  const handleRepeatOrder = (record: BillRecord) => {
    // If current active bill has items, auto save it to history first
    if (items.length > 0) {
      const now = new Date();
      const currentRecord: BillRecord = {
        id: Date.now().toString(),
        billNo,
        date: billDate || now.toLocaleDateString('en-GB'),
        time: billTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerName: customerName.trim() || 'Cash / نقد',
        items: [...items],
        grandTotal,
        paidAmount,
        balance: roundAmount(grandTotal - paidAmount),
        createdAt: Date.now(),
      };
      setSavedBills((prev) => [currentRecord, ...prev]);
      updateCustomerProfile(currentRecord.customerName, currentRecord.grandTotal, currentRecord.paidAmount);
    }

    // Prepare fresh bill metadata for repeated order
    const now = new Date();
    const newNo = Math.floor(1000 + Math.random() * 9000).toString();
    setBillNo(newNo);
    try {
      localStorage.setItem('malik_rizwan_bill_no', newNo);
    } catch (e) {
      console.error(e);
    }

    setBillDate(now.toLocaleDateString('en-GB'));
    setBillTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCustomerName(record.customerName === 'Cash / نقد' ? '' : record.customerName);
    setPaidAmount(record.paidAmount || 0);

    // Clone items with fresh unique IDs
    const clonedItems: BillItem[] = record.items.map((it) => ({
      ...it,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
    }));
    setItems(clonedItems);

    showToast(`سابقہ بل #${record.billNo} کے تمام آئٹمز نئے بل #${newNo} میں شامِل کر دیے گئے! (Repeat Order Loaded)`);
  };

  const handleDeleteBillRecord = (id: string) => {
    setSavedBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('کیا آپ تمام سابقہ ہسٹری ڈیلیٹ کرنا چاہتے ہیں؟')) {
      setSavedBills([]);
    }
  };

  const handleExportCSV = () => {
    if (savedBills.length === 0) return;
    
    let csv = 'Bill No,Date,Time,Customer,Total,Items\n';
    savedBills.forEach(b => {
      const itemsStr = b.items.map(it => `${it.name}(${it.qty}x${it.rate})`).join(' | ');
      csv += `${b.billNo},${b.date},${b.time},"${b.customerName}",${b.grandTotal},"${itemsStr}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Malik_Rizwan_Sales_History_${new Date().toLocaleDateString()}.csv`;
    link.click();
    showToast('سی ایس وی فائل ڈاؤن لوڈ ہو گئی! (CSV Exported)');
  };

  const handleAddProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...p,
      id: Date.now().toString()
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`${p.name} لسٹ میں شامل ہو گیا! (Product Added)`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={`min-h-dvh ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'} flex flex-col justify-center items-center sm:p-4 transition-colors duration-500`}>
      {/* Interactive App Container */}
      <div className="no-print bg-white dark:bg-slate-950 w-full max-w-lg min-h-dvh sm:min-h-[90vh] sm:rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-300 dark:border-slate-800 relative transition-colors duration-500">
        <Header
          billNo={billNo}
          billDate={billDate}
          billTime={billTime}
          onOpenHistory={handleOpenGeneralHistory}
          savedBillsCount={savedBills.length}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-3 text-center shadow-md animate-fade-in flex justify-between items-center z-50">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'billing' && (
          <>
            <InputSection
              customerName={customerName}
              setCustomerName={setCustomerName}
              onAddItem={handleAddItem}
              savedBills={savedBills}
              products={products}
              onOpenCustomerHistory={handleOpenCustomerHistory}
            />

            <BillTable
              items={items}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-500">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Total Amount (کل رقم):</span>
                    <span className="text-slate-900 dark:text-slate-100 font-black">Rs {formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">Paid (وصول):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 dark:text-slate-600 text-[10px]">Rs</span>
                        <input
                          type="number"
                          value={paidAmount || ''}
                          onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                          className="w-20 sm:w-24 p-1 text-right border border-emerald-300 dark:border-emerald-800 rounded font-bold text-emerald-700 dark:text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-900 text-xs sm:text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    {/* Quick Pay Buttons */}
                    <div className="flex flex-wrap gap-1 items-center">
                      {[500, 1000, 5000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setPaidAmount(amt)}
                          className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded transition font-bold"
                        >
                          {amt}
                        </button>
                      ))}
                      <button
                        onClick={() => setPaidAmount(grandTotal)}
                        className="text-[10px] bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white px-1.5 py-0.5 rounded transition font-bold shadow-sm"
                      >
                        Full Pay
                      </button>
                    </div>

                    <div className="text-right ml-auto sm:ml-0">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Balance (باقی):</span>
                      <span className={`ml-2 font-black ${grandTotal - paidAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        Rs {formatCurrency(grandTotal - paidAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            <FooterSection
              grandTotal={grandTotal}
              onNewBill={handleNewBill}
              onSaveImage={handleSaveImage}
              onPrint={handlePrint}
              isExporting={isExporting}
            />
          </>
        )}

        {activeTab === 'insights' && (
          <InsightsView 
            savedBills={savedBills} 
            expenses={expenses}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'decoder' && (
          <ICDecoder />
        )}
        
        {activeTab === 'expenses' && (
          <ExpenseManager 
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            totalSalesToday={totalSalesToday}
            totalCollectedToday={totalCollectedToday}
          />
        )}

        {activeTab === 'ledger' && (
          <CustomerLedger bills={savedBills} profiles={customerProfiles} />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            autoLedgerEnabled={autoLedgerEnabled} 
            onToggleAutoLedger={() => setAutoLedgerEnabled(!autoLedgerEnabled)} 
            shopConfig={shopConfig}
            onUpdateShopConfig={setShopConfig}
          />
        )}

        {/* Bottom Navigation */}
        <div className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-1.5 sm:p-2 z-40 mt-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'billing' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Billing</span>
          </button>
          <button 
            onClick={() => setActiveTab('decoder')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'decoder' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Cpu className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Decoder</span>
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'expenses' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Day Book</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'ledger' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Ledger</span>
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'insights' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Insights</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'products' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Inventory</span>
          </button>
          <button 
            onClick={handleOpenGeneralHistory}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">History</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-w-[60px] py-1 rounded-lg transition ${activeTab === 'settings' ? 'text-slate-900 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </div>

      {/* Off-screen/Print Rendered Receipt View */}
      <div className="hidden print:block fixed inset-0 bg-white z-50">
        <PrintReceiptView
          billNo={billNo}
          billDate={billDate}
          billTime={billTime}
          customerName={customerName}
          items={items}
          paidAmount={paidAmount}
          balance={grandTotal - paidAmount}
          grandTotal={grandTotal}
          shopConfig={shopConfig}
        />
      </div>

      {/* Hidden element for clean image snapshot capture */}
      <div className="fixed -left-[9999px] top-0 opacity-100 pointer-events-none">
        <PrintReceiptView
          billNo={billNo}
          billDate={billDate}
          billTime={billTime}
          customerName={customerName}
          items={items}
          paidAmount={paidAmount}
          balance={grandTotal - paidAmount}
          grandTotal={grandTotal}
          shopConfig={shopConfig}
        />
      </div>

      {/* Bill History Modal */}
      <BillHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedBills={savedBills}
        onLoadBill={handleLoadBill}
        onRepeatOrder={handleRepeatOrder}
        onDeleteBill={handleDeleteBillRecord}
        onClearAll={handleClearHistory}
        initialSearchQuery={historySearchQuery}
      />
      
      <OfflineIndicator />
    </div>
  );
}
