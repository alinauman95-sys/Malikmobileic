export interface BillItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  total: number;
}

export interface BillRecord {
  id: string;
  billNo: string;
  date: string;
  time: string;
  customerName: string;
  items: BillItem[];
  grandTotal: number;
  paidAmount: number;
  balance: number;
  createdAt: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone?: string;
  totalBalance: number;
  totalPaid: number;
  totalBilled: number;
  lastUpdated: number;
}

export interface ShopConfig {
  name: string;
  address: string;
  phone: string;
}

export interface AppSettings {
  autoLedgerEnabled: boolean;
  theme: 'light' | 'dark';
  shopConfig: ShopConfig;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  defaultRate: number;
  category?: string;
}

export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-IN');
};

export const roundAmount = (amount: number): number => {
  if (amount === undefined || amount === null || isNaN(amount)) return 0;
  return Math.round(amount * 100) / 100;
};

export const QUICK_ITEM_SUGGESTIONS = [
  "آرمیچر (Armature)",
  "دیسی تانبا (Desi Tamba)",
  "کورا تانبا (Kora Tamba)",
  "پیتل (Brass)",
  "سلور (Aluminium)",
  "بیٹری (Battery)",
  "موٹریں (Motors)",
  "کمپریسر (Compressor)",
  "لوہا (Iron)",
  "ردی (Raddi)",
  "گتہ (Cardboard)",
  "پلاسٹک (Plastic)",
  "کاپیاں (Copies)",
  "اخبار (Newspaper)",
] as const;

