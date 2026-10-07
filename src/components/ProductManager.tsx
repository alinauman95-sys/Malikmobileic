import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Package, Search } from 'lucide-react';
import { Product } from '../types';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [category, setCategory] = useState('');

  const handleSaveNew = () => {
    if (!name || !rate) return;
    onAddProduct({
      name,
      defaultRate: parseFloat(rate),
      category: category || undefined
    });
    setName('');
    setRate('');
    setCategory('');
    setIsAdding(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setRate(p.defaultRate.toString());
    setCategory(p.category || '');
  };

  const handleUpdate = () => {
    if (!editingId || !name || !rate) return;
    onUpdateProduct({
      id: editingId,
      name,
      defaultRate: parseFloat(rate),
      category: category || undefined
    });
    setEditingId(null);
    setName('');
    setRate('');
    setCategory('');
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-4 pb-20 transition-colors duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Package className="text-orange-500" />
          <span>Manage Products (آئٹمز لسٹ)</span>
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white p-2 rounded-full shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">Add New Item</h3>
          <div className="space-y-2">
            <input
              placeholder="Product Name (Urdu or English)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-urdu font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Rate (Rs)"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-1/2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <input
                placeholder="Category (Opt)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-1/2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-slate-500 dark:text-slate-400 text-sm">Cancel</button>
            <button 
              onClick={handleSaveNew}
              className="px-4 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm"
            >
              Save Product
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
            {editingId === p.id ? (
              <div className="flex-1 space-y-2 mr-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-1 bg-slate-50 dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded text-sm font-urdu font-bold text-slate-900 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-1/2 p-1 bg-slate-50 dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded text-sm text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex gap-1">
                    <button onClick={handleUpdate} className="p-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-urdu font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Rate: Rs {p.defaultRate}</span>
                    {p.category && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{p.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600 italic text-sm">
            No products found. Add some items to manage them easily.
          </div>
        )}
      </div>
    </div>
  );
};
