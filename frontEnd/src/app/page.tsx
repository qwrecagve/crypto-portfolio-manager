'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  ArrowUpRight,
  PlusCircle,
  Activity,
  RefreshCw
} from 'lucide-react';

const API_URL = 'https://crypto-api-v3-oybek.azurewebsites.net';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ symbol: '', amount: '', price: '', type: 'buy' });
  const [portfolio, setPortfolio] = useState<any>({ total_value: 0, assets_count: 0, assets: [] });
  const [apiStatus, setApiStatus] = useState<'checking'|'online'|'offline'>('checking');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/portfolio/summary`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase(),
          amount: parseFloat(formData.amount),
          price: parseFloat(formData.price),
          type: formData.type,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ symbol: '', amount: '', price: '', type: 'buy' });
        setSuccessMsg(`✅ ${formData.type === 'buy' ? 'Sotib olindi' : 'Sotildi'}: ${formData.amount} ${formData.symbol.toUpperCase()}`);
        setTimeout(() => setSuccessMsg(''), 4000);
        await fetchPortfolio();
      } else {
        const err = await res.json();
        alert(`Xatolik: ${err.detail || res.statusText}`);
      }
    } catch (error) {
      alert('Backend bilan ulanishda xatolik. Internet aloqasini tekshiring.');
    }
    setSubmitting(false);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <header className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Crypto Portfolio</h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            Xush kelibsiz, aktivlaringiz nazorat ostida.
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              apiStatus === 'online' ? 'bg-green-500/20 text-green-400' :
              apiStatus === 'offline' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {apiStatus === 'online' ? 'Backend Online' : apiStatus === 'offline' ? 'Backend Offline' : 'Tekshirilmoqda...'}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPortfolio} className="px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm">
            <RefreshCw size={16} /> Yangilash
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={apiStatus === 'offline'}
            className="gradient-bg px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
            <PlusCircle size={20} />
            Tranzaksiya Qo&apos;shish
          </button>
        </div>
      </header>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 glass-card p-4 border-green-500/40 text-green-400 font-semibold shadow-xl animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Offline banner */}
      {apiStatus === 'offline' && (
        <div className="glass-card p-4 border-red-500/30 flex items-center gap-3">
          <span className="text-red-400 text-2xl">⚠️</span>
          <div>
            <p className="text-red-400 font-semibold">Backend serverga ulanib bo&apos;lmadi</p>
            <p className="text-gray-400 text-sm">Azure App Service ishga tushishini kutmoqda... <button onClick={fetchPortfolio} className="text-amber-400 underline">Qayta urinish</button></p>
          </div>
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
                    type="number" step="any" min="0.00000001"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Narxi ($)</label>
                  <input 
                    type="number" step="any" min="0"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-amber-500 outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="buy">Sotib olish (Buy)</option>
                  <option value="sell">Sotish (Sell)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                  Bekor qilish
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 gradient-bg px-6 py-3 rounded-xl font-bold text-black hover:opacity-90 transition disabled:opacity-50">
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 gold-glow">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400"><Wallet size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">Umumiy Balans</p>
            <h2 className="text-3xl font-bold text-white">
              {loading ? '...' : `$${portfolio.total_value.toLocaleString(undefined, {maximumFractionDigits:2})}`}
            </h2>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400"><TrendingUp size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">24s Foyda/Zarar</p>
            <div className="flex items-center gap-1">
              <h2 className="text-2xl font-bold text-amber-400">+12.5%</h2>
              <ArrowUpRight size={20} className="text-amber-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400"><PieChart size={32} /></div>
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
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw size={40} className="mx-auto mb-4 animate-spin opacity-40" />
              <p>Ma&apos;lumotlar yuklanmoqda...</p>
            </div>
          ) : portfolio.assets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <PieChart size={48} className="mx-auto mb-4 opacity-30" />
              <p>{apiStatus === 'offline' ? 'Backend serverga ulanib bo\'lmadi.' : 'Hali aktiv yo\'q. Tranzaksiya qo\'shing!'}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm">
                <tr>
                  <th className="p-4">Kriptovalyuta</th>
                  <th className="p-4">Miqdor</th>
                  <th className="p-4">Narxi</th>
                  <th className="p-4">Qiymati</th>
                  <th className="p-4 text-right">Ulush</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.assets.map((asset: any) => (
                  <tr key={asset.symbol} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-black shadow-lg">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{asset.name || asset.symbol}</p>
                        <p className="text-xs text-gray-500">{asset.symbol}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-amber-100">{asset.amount}</td>
                    <td className="p-4 text-gray-300">${asset.current_price?.toLocaleString() ?? 0}</td>
                    <td className="p-4 font-bold text-amber-400">${asset.total_value?.toLocaleString(undefined, {maximumFractionDigits:2}) ?? 0}</td>
                    <td className="p-4 text-right text-gray-400 text-sm">
                      {portfolio.total_value > 0 ? ((asset.total_value / portfolio.total_value) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm">
        <p>© 2026 Crypto Portfolio Manager • Azure SQL &amp; NumPy Tizimi</p>
      </footer>
    </main>
  );
}
