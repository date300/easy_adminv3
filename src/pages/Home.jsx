import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Store,
  Package,
  Briefcase,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";

const defaultStats = {
  totalUsers: 0,
  totalVerifiedUsers: 0,
  totalBusinesses: 0,
  totalActiveProducts: 0,
};

function formatNumber(value) {
  const safeValue = Number(value) || 0;
  return safeValue.toLocaleString();
}

export default function Home() {
  const { token } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok || data.status !== "success") {
          throw new Error(data.message || "Failed to load dashboard stats.");
        }

        const payload = data?.data || data || defaultStats;
        setStats(payload);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={20} className="text-cyan-400" />,
      gradient: "from-cyan-500/20 to-blue-500/5",
      border: "border-cyan-500/20"
    },
    {
      label: "Verified Users",
      value: stats.totalVerifiedUsers,
      icon: <ShieldCheck size={20} className="text-emerald-400" />,
      gradient: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/20"
    },
    {
      label: "Total Businesses",
      value: stats.totalBusinesses,
      icon: <Store size={20} className="text-amber-400" />,
      gradient: "from-amber-500/20 to-orange-500/5",
      border: "border-amber-500/20"
    },
    {
      label: "Active Products",
      value: stats.totalActiveProducts,
      icon: <Package size={20} className="text-purple-400" />,
      gradient: "from-purple-500/20 to-violet-500/5",
      border: "border-purple-500/20"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                    <Zap size={16} className="text-sky-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-10">
              Overview of platform activity and metrics
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden md:flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
          >
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Live Analytics
          </motion.div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-3 backdrop-blur-md">
          <div className="p-1.5 rounded-lg bg-red-500/20">
            <TrendingUp size={16} className="rotate-180" />
          </div>
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            className={`relative group overflow-hidden rounded-3xl border ${card.border} bg-gradient-to-br ${card.gradient} p-6 backdrop-blur-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default`}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />

            <div className="flex items-center justify-between relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{card.label}</p>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2 relative z-10">
              <p className="text-4xl font-black text-white tracking-tighter">
                {loading ? "--" : formatNumber(card.value)}
              </p>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Count</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" />
                Platform Growth
              </h2>
              <p className="text-sm text-slate-400 mt-1">Cross-sectional performance analysis.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {loading ? "Loading..." : "Updated Just Now"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-colors">
              <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Users size={40} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Accounts</p>
              <p className="mt-3 text-3xl font-black text-white tracking-tighter">
                {loading ? "--" : formatNumber(stats.totalVerifiedUsers)}
              </p>
              <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: stats.totalUsers > 0 ? `${(stats.totalVerifiedUsers/stats.totalUsers)*100}%` : '0%' }}
                />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-colors">
                <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Package size={40} />
                </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Inventory</p>
              <p className="mt-3 text-3xl font-black text-white tracking-tighter">
                {loading ? "--" : formatNumber(stats.totalActiveProducts)}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-tighter">
                <Sparkles size={10} />
                Live in system marketplace
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-2xl flex flex-col"
        >
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-6">
            <Briefcase size={20} className="text-amber-400" />
            Quick Access
          </h2>
          <div className="space-y-3 flex-1">
            {[
              { label: "Active Network", value: stats.totalUsers, color: "text-blue-400" },
              { label: "Trust Index", value: stats.totalVerifiedUsers, color: "text-emerald-400" },
              { label: "Market Entities", value: stats.totalBusinesses, color: "text-amber-400" }
            ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                  <span className={`text-lg font-black tracking-tight ${item.color}`}>
                    {loading ? "--" : formatNumber(item.value)}
                  </span>
                </div>
            ))}
          </div>

          <button className="mt-6 w-full py-4 rounded-2xl bg-sky-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:bg-sky-400 hover:shadow-[0_15px_25px_rgba(14,165,233,0.3)] active:scale-[0.98] transition-all">
            Refresh
          </button>
        </motion.div>
      </div>
    </div>
  );
}
