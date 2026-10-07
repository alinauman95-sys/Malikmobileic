import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Download, Calendar, ArrowUpRight, ArrowDownRight, Wallet, Info, BarChart2 } from 'lucide-react';
import { BillRecord, Expense, formatCurrency } from '../types';

interface InsightsViewProps {
  savedBills: BillRecord[];
  expenses: Expense[];
  onExportCSV: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ savedBills, expenses, onExportCSV }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB');
    
    let totalRevenue = 0;
    let totalExpenses = 0;
    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;
    const itemMap: Record<string, number> = {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const chartDataMap: Record<string, { date: string; revenue: number; expense: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const ds = d.toLocaleDateString('en-GB');
      chartDataMap[ds] = {
        date: ds.split('/')[0] + '/' + ds.split('/')[1],
        revenue: 0,
        expense: 0
      };
    }

    savedBills.forEach(bill => {
      const billDate = new Date(bill.createdAt);
      const isToday = bill.date === todayStr;
      const isThisWeek = (now.getTime() - bill.createdAt) <= 7 * 24 * 60 * 60 * 1000;
      const isThisMonth = billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();

      const rev = bill.grandTotal;
      totalRevenue += rev;

      if (isToday) todaySales += rev;
      if (isThisWeek) weekSales += rev;
      if (isThisMonth) monthSales += rev;

      if (chartDataMap[bill.date]) {
        chartDataMap[bill.date].revenue += rev;
      }

      bill.items.forEach(it => {
        itemMap[it.name] = (itemMap[it.name] || 0) + it.qty;
      });
    });

    expenses.forEach(exp => {
      totalExpenses += exp.amount;
      const expDate = new Date(exp.createdAt).toLocaleDateString('en-GB');
      if (chartDataMap[expDate]) {
        chartDataMap[expDate].expense += exp.amount;
      }
    });

    const chartData = Object.values(chartDataMap);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const topItems = Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { todaySales, weekSales, monthSales, chartData, topItems, totalRevenue, totalExpenses, netProfit, profitMargin };
  }, [savedBills, expenses]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-6 pb-20 transition-colors duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" />
            <span>Financial Insights (رپورٹ)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Performance tracking & business health</p>
        </div>
        <button
          onClick={onExportCSV}
          className="bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between">
            <span>Total Sales</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            Rs {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Life-time revenue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between">
            <span>Total Expenses</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            Rs {formatCurrency(stats.totalExpenses)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Operating costs</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${stats.netProfit >= 0 ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'}`}>
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between">
            <span>Net Profit</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className={`text-xl font-black ${stats.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            Rs {formatCurrency(stats.netProfit)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stats.netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'}`}>
              {stats.profitMargin.toFixed(1)}% Margin
            </span>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex justify-between">
            <span>Today's Sales</span>
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white">
            Rs {formatCurrency(stats.todaySales)}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Daily snapshot</p>
        </div>
      </div>

      {/* Revenue vs Expense Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span>Sales vs Expenses (7-Day Trend)</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-500">Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-slate-500">Expense</span>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}}
                tickFormatter={(val) => `Rs ${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
              />
              <Tooltip 
                cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                contentStyle={{
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 800, fontSize: '11px', marginBottom: '8px', color: '#64748b' }}
                itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExp)" 
                name="Expense"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Items List */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            <span>Best Selling Categories (ٹاپ آئٹمز)</span>
          </h3>
          <div className="space-y-3">
            {stats.topItems.length > 0 ? (
              stats.topItems.map(([name, qty], idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-urdu font-bold text-slate-800 dark:text-slate-200">{name}</span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{qty} Units</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (qty / stats.topItems[0][1]) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                No data available yet
              </div>
            )}
          </div>
        </div>

        {/* Business Tips / AI Insights */}
        <div className="bg-indigo-600 dark:bg-indigo-700 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white font-black text-lg flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-200" />
              Business Pulse
            </h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Your current profit margin is <span className="font-black underline">{stats.profitMargin.toFixed(1)}%</span>. 
              {stats.netProfit > 0 
                ? " You are operating profitably. Consider reinvesting into high-margin scrap like Copper and Motors."
                : " Your expenses are exceeding revenue. Review your day-book and reduce operational costs."}
            </p>
            <div className="flex gap-2">
              <div className="bg-indigo-500/50 p-3 rounded-xl border border-indigo-400/30 flex-1">
                <span className="text-[10px] font-black text-indigo-200 uppercase block mb-1">Health</span>
                <span className="text-white font-bold text-sm">Good</span>
              </div>
              <div className="bg-indigo-500/50 p-3 rounded-xl border border-indigo-400/30 flex-1">
                <span className="text-[10px] font-black text-indigo-200 uppercase block mb-1">Efficiency</span>
                <span className="text-white font-bold text-sm">High</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>
      </div>
      
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-3 items-start">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          The analytics are generated based on your locally saved bills and expenses. 
          To get more accurate results, ensure you record all purchases and operational costs in the Day Book.
          (یہ رپورٹ آپ کے محفوظ کردہ بلز اور اخراجات کی بنیاد پر تیار کی گئی ہے۔)
        </p>
      </div>
    </div>
  );
};
