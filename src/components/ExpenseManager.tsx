import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Calendar, TrendingDown, Receipt, PieChart } from 'lucide-react';
import { Expense, formatCurrency } from '../types';

interface ExpenseManagerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  totalSalesToday: number;
  totalCollectedToday: number;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  totalSalesToday,
  totalCollectedToday,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');

  const categories = ['General', 'Tea/Food', 'Utility', 'Rent', 'Transport', 'Wages', 'Misc'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAddExpense({
      category,
      description,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('en-GB'),
    });
    setDescription('');
    setAmount('');
  };

  const todayStr = new Date().toLocaleDateString('en-GB');
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const totalExpensesToday = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-6 pb-24 transition-colors duration-500">
      {/* Daily Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <PieChart className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Today's Sales</span>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">Rs {formatCurrency(totalSalesToday)}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total billing value</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingDown className="w-4 h-4 rotate-180" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cash Collected</span>
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">Rs {formatCurrency(totalCollectedToday)}</p>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-600 mt-1">Actual cash in hand</p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Expenses</span>
          </div>
          <p className="text-xl font-black text-rose-700 dark:text-rose-400">Rs {formatCurrency(totalExpensesToday)}</p>
          <p className="text-[10px] text-rose-500 dark:text-rose-600 mt-1">Spent today</p>
        </div>
      </div>

      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100 dark:shadow-none flex justify-between items-center transition-colors">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-80">Net Cash Today (باقی نقد)</p>
          <p className="text-2xl font-black">Rs {formatCurrency(totalCollectedToday - totalExpensesToday)}</p>
        </div>
        <Wallet className="w-10 h-10 opacity-20" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Add New Expense (خرچہ درج کریں)
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Amount (رقم)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Description (تفصیل)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Tea for staff, Electricity bill..."
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl font-bold text-xs uppercase shadow-lg shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save Expense (محفوظ کریں)
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            Today's Expenses
          </h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{todayExpenses.length} entries</span>
        </div>

        {todayExpenses.length > 0 ? (
          <div className="space-y-2">
            {todayExpenses.map((exp) => (
              <div key={exp.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{exp.description}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{exp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">Rs {formatCurrency(exp.amount)}</span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Calendar className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase">No expenses recorded today</p>
          </div>
        )}
      </div>
    </div>
  );
};
