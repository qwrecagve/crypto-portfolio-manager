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
  const [portfolio, setPortfolio] = useState<any>({
    total_value: 0,
    assets_count: 0,
    assets: []
  });

  // Backend'dan ma'lumotlarni olish (Hozircha mock ma'lumotlar bilan boyitilgan)
  useEffect(() => {
    setTimeout(() => {
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
    }, 1000);
  }, []);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Crypto Portfolio</h1>
          <p className="text-gray-400 mt-2">Xush kelibsiz, aktivlaringiz nazorat ostida.</p>
        </div>
        <button className="gradient-bg px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-indigo-500/20">
          <PlusCircle size={20} />
          Tranzaksiya Qo'shish
        </button>
      </header>

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
