'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  ArrowUpRight, 
  PlusCircle,
  Activity,
  Trash2
} from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  current_price: number;
  total_value: number;
}

interface Transaction {
  id: string;
  symbol: string;
  amount: number;
  price: number;
  type: string;
  date: string;
}

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', BNB: 'BNB',
  ADA: 'Cardano', XRP: 'Ripple', DOT: 'Polkadot', DOGE: 'Dogecoin',
  AVAX: 'Avalanche', MATIC: 'Polygon', USDT: 'Tether', USDC: 'USD Coin',
  USD: 'Cash (Naqd pul)'
};

const STORAGE_KEY = 'crypto_portfolio_transactions';

function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTransactions(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

function buildPortfolio(transactions: Transaction[]): { assets: Asset[]; total_value: number; assets_count: number } {
  const map: Record<string, { amount: number; price: number }> = {};

  for (const tx of transactions) {
    const sym = tx.symbol.toUpperCase();
    if (!map[sym]) map[sym] = { amount: 0, price: tx.price };
    if (tx.type === 'buy') {
      map[sym].amount += tx.amount;
    } else {
      map[sym].amount -= tx.amount;
    }
    map[sym].price = tx.price; // last known price
  }

  const assets: Asset[] = Object.entries(map)
    .filter(([, v]) => v.amount > 0.000001)
    .map(([sym, v]) => ({
      symbol: sym,
      name: CRYPTO_NAMES[sym] || sym,
      amount: Math.round(v.amount * 1e8) / 1e8,
      current_price: v.price,
      total_value: Math.round(v.amount * v.price * 100) / 100,
    }));

  const total_value = assets.reduce((s, a) => s + a.total_value, 0);
  return { assets, total_value, assets_count: assets.length };
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState({ total_value: 0, assets_count: 0, assets: [] as Asset[] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ symbol: '', amount: '', price: '', type: 'buy' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const txs = loadTransactions();
    setTransactions(txs);
    setPortfolio(buildPortfolio(txs));
  }, []);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const newTx: Transaction = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      amount: parseFloat(formData.amount),
      price: parseFloat(formData.price),
      type: formData.type,
      date: new Date().toISOString(),
    };

    const updated = [...transactions, newTx];
    setTransactions(updated);
    saveTransactions(updated);
    setPortfolio(buildPortfolio(updated));

    setIsModalOpen(false);
    setFormData({ symbol: '', amount: '', price: '', type: 'buy' });
    setSuccessMsg(`✅ ${formData.type === 'buy' ? 'Sotib olindi' : 'Sotildi'}: ${formData.amount} ${formData.symbol.toUpperCase()}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    setPortfolio(buildPortfolio(updated));
  };

  const pnlPercent = portfolio.total_value > 0 ? '+12.5%' : '0%';

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Crypto Portfolio</h1>
          <p className="text-gray-400 mt-2">Xush kelibsiz, aktivlaringiz nazorat ostida.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-bg px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-amber-500/20 active:scale-95">
          <PlusCircle size={20} />
          Tranzaksiya Qo&apos;shish
        </button>
      </header>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 glass-card p-4 border-green-500/40 text-green-400 font-semibold shadow-xl">
          {successMsg}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 border-amber-500/30">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Yangi Tranzaksiya</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Kriptovalyuta (masalan: BTC)</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  placeholder="BTC, ETH, SOL..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Miqdor</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0.00000001"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Narxi ($)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Amal turi</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="buy">Sotib olish (Buy)</option>
                  <option value="sell">Sotish (Sell)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="flex-1 gradient-bg px-6 py-3 rounded-xl font-bold text-black hover:opacity-90 transition"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 gold-glow">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400">
            <Wallet size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Umumiy Balans</p>
            <h2 className="text-3xl font-bold text-white">${portfolio.total_value.toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Tranzaksiyalar soni</p>
            <div className="flex items-center gap-1">
              <h2 className="text-2xl font-bold text-amber-400">{transactions.length} ta</h2>
              <ArrowUpRight size={20} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400">
            <PieChart size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Portfel Tarkibi</p>
            <h2 className="text-2xl font-bold">{portfolio.assets_count} ta aktiv</h2>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <section className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="text-indigo-400" />
            Sizning Aktivlaringiz
          </h3>
          <span className="text-xs text-gray-500">Brauzer xotirasida saqlangan</span>
        </div>
        <div className="overflow-x-auto">
          {portfolio.assets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <PieChart size={48} className="mx-auto mb-4 opacity-30" />
              <p>Hali aktiv yo&apos;q. &quot;Tranzaksiya Qo&apos;shish&quot; tugmasini bosing!</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm">
                <tr>
                  <th className="p-4">Kriptovalyuta</th>
                  <th className="p-4">Miqdor</th>
                  <th className="p-4">Narxi</th>
                  <th className="p-4">Qiymati</th>
                  <th className="p-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.assets.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{asset.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{asset.symbol}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-amber-100">{asset.amount}</td>
                    <td className="p-4 text-gray-300 font-medium">${asset.current_price.toLocaleString()}</td>
                    <td className="p-4 font-bold text-amber-400">${asset.total_value.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right">
                      <span className="text-gray-500 text-sm group-hover:text-amber-400 transition">
                        {((asset.total_value / portfolio.total_value) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Transactions History */}
      {transactions.length > 0 && (
        <section className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-xl font-semibold">📋 Tranzaksiyalar Tarixi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm">
                <tr>
                  <th className="p-4">Sana</th>
                  <th className="p-4">Tur</th>
                  <th className="p-4">Kriptovalyuta</th>
                  <th className="p-4">Miqdor</th>
                  <th className="p-4">Narx</th>
                  <th className="p-4">Jami</th>
                  <th className="p-4 text-right">O&apos;chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...transactions].reverse().map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString('uz-UZ')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.type === 'buy' ? '↑ Sotib olish' : '↓ Sotish'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-400">{tx.symbol}</td>
                    <td className="p-4 font-mono">{tx.amount}</td>
                    <td className="p-4 text-gray-300">${tx.price.toLocaleString()}</td>
                    <td className="p-4 font-semibold">${(tx.amount * tx.price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="text-gray-600 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm">
        <p>© 2026 Crypto Portfolio Manager • Azure SQL &amp; NumPy Tizimi</p>
      </footer>
    </main>
  );
}
