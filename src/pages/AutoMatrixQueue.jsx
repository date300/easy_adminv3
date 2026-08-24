import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { List, Loader2, AlertTriangle, ArrowLeft, RefreshCw, Eye, X, Sparkles, Zap, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";
const MATRIX_AMOUNTS = [5, 10, 15, 20, 25, 30, 50, 100, 200, 300, 400, 500, 800, 1000, 1500, 2000, 2500, 3000];

// Helper to format profile picture
const formatProfilePic = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http")) return filename;
    return `https://api.easysarvice.com/public/uploads/profile_pics/${filename}`;
};

export default function AutoMatrixQueue() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchQueue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/auto-matrix-queue?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setQueue(data.data);
        setTotal(data.total);
      } else {
        throw new Error(data.message || "Failed to fetch queue");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchQueue();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchQueue]);

  if (loading && queue.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading queue...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
            <button
                onClick={() => navigate(-1)}
                className="p-3 bg-white/5 text-slate-400 rounded-2xl hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <List className="text-emerald-400" size={24} />
                    Matrix Queue
                </h2>
                <p className="text-sm text-slate-400 font-medium">{total} users waiting for payout</p>
            </div>
        </div>
        <button
          onClick={fetchQueue}
          className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search Option */}
      <div className="relative group max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
        <input
            type="text"
            placeholder="Search by name, mobile or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white text-sm placeholder:text-slate-600 group-hover:bg-white/[0.05]"
        />
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center backdrop-blur-md">
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            <h3 className="text-white font-black text-lg mb-1 uppercase tracking-tight">Failed to load queue</h3>
            <p className="text-red-400/80 text-sm mb-6">{error}</p>
            <button onClick={fetchQueue} className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Retry</button>
        </div>
      ) : (
        <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                            <th className="px-6 py-5 whitespace-nowrap">Position</th>
                            <th className="px-6 py-5 whitespace-nowrap">User</th>
                            <th className="px-6 py-5 whitespace-nowrap text-center">Progress</th>
                            <th className="px-6 py-5 text-center">Total Refer</th>
                            <th className="px-6 py-5 text-center">Verified Refer</th>
                            <th className="px-6 py-5 whitespace-nowrap">Last Payout</th>
                            <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {queue.map((user, index) => (
                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="font-black text-slate-600 text-2xl group-hover:text-sky-500/40 transition-colors tracking-tighter">#{index + 1}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                                            {user.profile_picture ? (
                                                <img src={formatProfilePic(user.profile_picture)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sky-400 font-black text-sm">{(user.full_name || "?").charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm tracking-tight">{user.full_name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{user.mobile} <span className="mx-1 text-white/5">|</span> {user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                            {[...Array(18)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-4 rounded-full transition-all duration-500 ${
                                                        i < user.matrix_payout_count
                                                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-y-110'
                                                        : 'bg-white/5'
                                                    }`}
                                                ></div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-white bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/20">{user.matrix_payout_count} / 18</span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Levels</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="text-lg font-bold text-white tracking-tighter">{user.total_referrals || 0}</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase">Referrals</div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="text-lg font-bold text-emerald-400 tracking-tighter">{user.verified_referrals || 0}</div>
                                    <div className="text-[9px] text-emerald-900/60 font-bold uppercase">Verified</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {user.last_matrix_payout_at ? new Date(user.last_matrix_payout_at).toLocaleDateString("en-GB") : "None"}
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-medium mt-1">
                                        {user.last_matrix_payout_at ? new Date(user.last_matrix_payout_at).toLocaleTimeString() : "Awaiting payout"}
                                    </p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                                    >
                                        <Eye size={12} />
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {queue.length === 0 && (
                <div className="py-32 text-center opacity-30">
                    <List size={64} className="mx-auto mb-4" />
                    <p className="text-xs font-bold">No users found</p>
                </div>
            )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                {/* Modal Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-0.5 shadow-xl overflow-hidden relative group">
                            {selectedUser.profile_picture ? (
                                <img src={formatProfilePic(selectedUser.profile_picture)} alt="" className="w-full h-full object-cover rounded-[1.4rem]" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sky-400 font-black text-2xl">
                                    {selectedUser.full_name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xl tracking-tight leading-tight">{selectedUser.full_name}</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mt-1">{selectedUser.mobile} <span className="mx-1 text-white/5">•</span> ID: {selectedUser.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-inner"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-10 space-y-10 relative z-10">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[10px] font-bold text-slate-500 flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                                Matrix Progress
                            </h4>
                            <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                Level {Math.floor(selectedUser.matrix_payout_count / 6) + 1}
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-3">
                            {MATRIX_AMOUNTS.map((amt, idx) => {
                                const isCompleted = idx < selectedUser.matrix_payout_count;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative h-16 rounded-[1.25rem] border transition-all duration-500 flex flex-col items-center justify-center ${
                                            isCompleted
                                            ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)] scale-[1.02]"
                                            : "bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/10"
                                        }`}
                                    >
                                        <span className={`text-[8px] font-black uppercase tracking-tighter mb-1 ${isCompleted ? "text-emerald-100" : "text-slate-700"}`}>
                                            Payout {idx + 1}
                                        </span>
                                        <span className={`text-[12px] font-black ${isCompleted ? "text-white" : "text-slate-500"}`}>
                                            ৳{amt}
                                        </span>
                                        {isCompleted && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-xl">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/[0.03] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={80} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Earned</p>
                            <p className="text-3xl font-black text-white tracking-tighter">৳{MATRIX_AMOUNTS.slice(0, selectedUser.matrix_payout_count).reduce((a, b) => a + b, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-sky-500/5 rounded-[2rem] p-6 border border-sky-500/10 relative overflow-hidden group hover:bg-sky-500/10 transition-colors">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap size={80} />
                            </div>
                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">Pending Payout</p>
                            <p className="text-3xl font-black text-sky-400 tracking-tighter">৳{MATRIX_AMOUNTS.slice(selectedUser.matrix_payout_count).reduce((a, b) => a + b, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5 relative z-10">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-[0.99] shadow-xl"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
