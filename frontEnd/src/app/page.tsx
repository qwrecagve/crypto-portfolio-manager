'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Activity,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ symbol: '', amount: '', price: '', type: 'buy' });
  const [portfolio, setPortfolio] = useState<any>({
    total_value: 0,
    assets_count: 0,
    assets: []
  });

  const fetchPortfolio = async () => {
    try {
      // Real API ulanishi (agar backend ishlayotgan bo'lsa)
      // const res = await fetch('https://crypto-api-v3-oybek.azurewebsites.net/portfolio/summary');
      // const data = await res.json();
      // setPortfolio(data);
      
      // Mock data for demo
      setPortfolio({
        total_value: 45230.50,
        assets_count: 3,
        assets: [
          { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, current_price: 65000, total_value: 32500 },
          { symbol: 'ETH', name: 'Ethereum', amount: 4.2, current_price: 3500, total_value: 14700 },
          { symbol: 'SOL', name: 'Solana', amount: 15, current_price: 145, total_value: 2175 }
        ]
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Yangi aktivni yaratish
    const newAsset = {
      symbol: formData.symbol,
      name: formData.symbol === 'BTC' ? 'Bitcoin' : formData.symbol === 'ETH' ? 'Ethereum' : formData.symbol,
      amount: parseFloat(formData.amount),
      current_price: parseFloat(formData.price),
      total_value: parseFloat(formData.amount) * parseFloat(formData.price)
    };

    // Portfelni yangilash (Mavjud bo'lsa qo'shish, bo'lmasa yangi yaratish)
    setPortfolio((prev: any) => {
      const existingAssetIndex = prev.assets.findIndex((a: any) => a.symbol === newAsset.symbol);
      let updatedAssets = [...prev.assets];

      if (existingAssetIndex !== -1) {
        // Mavjud aktivni yangilash
        updatedAssets[existingAssetIndex] = {
          ...updatedAssets[existingAssetIndex],
          amount: updatedAssets[existingAssetIndex].amount + newAsset.amount,
          total_value: (updatedAssets[existingAssetIndex].amount + newAsset.amount) * newAsset.current_price
        };
      } else {
        // Yangi aktiv qo'shish
        updatedAssets.push(newAsset);
      }

      return {
        ...prev,
        total_value: updatedAssets.reduce((sum, a) => sum + a.total_value, 0),
        assets_count: updatedAssets.length,
        assets: updatedAssets
      };
    });

    setIsModalOpen(false);
    setFormData({ symbol: '', amount: '', price: '', type: 'buy' });
    alert(`${formData.symbol} muvaffaqiyatli qo'shildi!`);
  };

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
          Tranzaksiya Qo'shish
        </button>
      </header>

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
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Miqdor</label>
                  <input 
                    type="number" 
                    step="any"
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
            <h2 className="text-3xl font-bold text-white">${portfolio.total_value.toLocaleString()}</h2>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">24s Foyda/Zarar</p>
            <div className="flex items-center gap-1">
              <h2 className="text-2xl font-bold text-amber-400">+12.5%</h2>
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

      {/* Table Section */}
      <section className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="text-indigo-400" />
            Sizning Aktivlaringiz
          </h3>
        </div>
        <div className="overflow-x-auto">
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
              {portfolio.assets.map((asset: any) => (
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
                  <td className="p-4 font-bold text-amber-400">${asset.total_value.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button className="text-gray-500 hover:text-white transition">Tahlil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer / Status */}
      <footer className="text-center text-gray-500 text-sm">
        <p>© 2026 Crypto Portfolio Manager • Azure SQL & NumPy Tizimi</p>
      </footer>
    </main>
  );
}
