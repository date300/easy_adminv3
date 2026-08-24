import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutGrid, Coins, Loader2, AlertTriangle, RefreshCw, Edit2, Save, X, UserPlus, Search, List, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";

const MATRIX_AMOUNTS = [5, 10, 15, 20, 25, 30, 50, 100, 200, 300, 400, 500, 800, 1000, 1500, 2000, 2500, 3000];

export default function MatrixFund() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newManualFund, setNewManualFund] = useState("");
  const [updating, setUpdating] = useState(false);

  // Reward state
  const [rewardUser, setRewardUser] = useState(null); // Found user
  const [userIdSearch, setUserIdSearch] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardDescription, setRewardDescription] = useState("Special performance reward for your excellent work this month.");
  const [searching, setSearching] = useState(false);
  const [sendingReward, setSendingReward] = useState(false);
  const [completingStep, setCompletingStep] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/matrix-fund`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === "success") {
        setFundData(data.data);
        setNewManualFund(data.data.manual_matrix_fund);
      } else {
        throw new Error(data.message || "Failed to fetch matrix funds");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async () => {
    if (newManualFund === "" || isNaN(newManualFund)) {
      alert("Please enter a valid amount");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/matrix-fund`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ manual_matrix_fund: parseFloat(newManualFund) }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setFundData({ ...fundData, manual_matrix_fund: parseFloat(newManualFund) });
        setIsEditing(false);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSearchUser = async () => {
    if (!userIdSearch) return;
    setSearching(true);
    setRewardUser(null);
    try {
      const isNumeric = /^\d+$/.test(userIdSearch);
      if (isNumeric && userIdSearch.length < 10) {
        try {
          const res = await fetch(`${API_BASE}/admin/users/${userIdSearch}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.status === "success") {
            setRewardUser(data.data);
            setSearching(false);
            return;
          }
        } catch (e) {}
      }

      const searchRes = await fetch(`${API_BASE}/admin/users?search=${encodeURIComponent(userIdSearch)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const searchData = await searchRes.json();

      if (searchData.status === "success" && searchData.data.length > 0) {
        setRewardUser(searchData.data[0]);
      } else {
        alert("User not found. Try with a different ID, Email, or Mobile number.");
      }
    } catch (err) {
      alert("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSendReward = async () => {
    if (!rewardUser || !rewardAmount || rewardAmount <= 0) {
      alert("Please select a user and valid amount");
      return;
    }
    setSendingReward(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reward-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: rewardUser.id,
          amount: parseFloat(rewardAmount),
          description: rewardDescription
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(data.message);
        setRewardUser(null);
        setUserIdSearch("");
        setRewardAmount("");
        setRewardDescription("Special performance reward for your excellent work this month.");
        fetchData();
      } else {
        alert(data.message || "Failed to send reward");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSendingReward(false);
    }
  };

  const handleForceStep = async () => {
    if (!rewardUser) return;
    if (rewardUser.matrix_payout_count >= 18) {
        alert("This user has already completed all matrix steps.");
        return;
    }

    const nextStep = rewardUser.matrix_payout_count + 1;
    const nextAmount = MATRIX_AMOUNTS[rewardUser.matrix_payout_count];

    if (!window.confirm(`Manually complete Step ${nextStep} for ${rewardUser.full_name}?\n\nThis will:\n1. Deduct ৳${nextAmount} from Manual Fund.\n2. Add ৳${nextAmount} to user's balance.\n3. Mark Step ${nextStep} as completed.`)) {
        return;
    }

    setCompletingStep(true);
    try {
        const res = await fetch(`${API_BASE}/admin/force-matrix-step`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: rewardUser.id }),
        });
        const data = await res.json();
        if (data.status === "success") {
            alert(data.message);
            // Refresh local state
            setRewardUser({
                ...rewardUser,
                matrix_payout_count: rewardUser.matrix_payout_count + 1,
                balance: parseFloat(rewardUser.balance) + nextAmount
            });
            fetchData();
        } else {
            alert(data.message || "Failed to complete step");
        }
    } catch (err) {
        alert("Network error");
    } finally {
        setCompletingStep(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-bold text-slate-500">Loading matrix fund...</span>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold backdrop-blur-md flex items-center gap-3">
        <AlertTriangle size={20} />
        {error}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutGrid size={24} className="text-indigo-400" />
            Matrix Fund
        </h1>
          <p className="text-sm text-slate-400 font-medium">Manage matrix fund allocation</p>
        </div>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-xl"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Fund Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Manual Matrix Fund */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-8 backdrop-blur-xl transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <Coins size={140} />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Coins size={24} />
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2.5 bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-white/5"
                    >
                        <Edit2 size={18} />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdate}
                            disabled={updating}
                            className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setNewManualFund(fundData.manual_matrix_fund); }}
                            className="p-2.5 bg-white/5 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-white/5"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>
            <p className="text-[10px] font-bold text-slate-500 relative z-10">Manual Fund</p>
            {isEditing ? (
                <div className="mt-4 relative z-10">
                    <input
                        type="number"
                        value={newManualFund}
                        onChange={(e) => setNewManualFund(e.target.value)}
                        className="w-full text-3xl font-bold text-white bg-white/5 border border-indigo-500/30 rounded-2xl px-4 py-3 outline-none focus:bg-white/10 transition-all tracking-tighter"
                        autoFocus
                    />
                </div>
            ) : (
                <p className="mt-4 text-4xl font-bold text-white tracking-tighter relative z-10">৳{(fundData?.manual_matrix_fund || 0).toLocaleString()}</p>
            )}
            <p className="mt-3 text-[10px] font-bold text-slate-500 relative z-10">Fund for manual payouts</p>
        </div>

        {/* Auto Matrix Fund */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 backdrop-blur-xl transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                <RefreshCw size={140} />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <RefreshCw size={24} />
                </div>
                <button
                    onClick={() => navigate("/matrix-fund/auto-queue")}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 text-[10px] font-bold shadow-lg shadow-emerald-500/20"
                >
                    <List size={14} />
                    View Pending
                </button>
            </div>
            <p className="text-[10px] font-bold text-slate-500 relative z-10">Automatic Fund</p>
            <p className="mt-4 text-4xl font-bold text-white tracking-tighter relative z-10">৳{(fundData?.auto_matrix_fund || 0).toLocaleString()}</p>
            <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter relative z-10">Funds for automatic payouts</p>
        </div>

        {/* Royalty Fund */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-8 backdrop-blur-xl transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 text-sky-500/10 group-hover:text-sky-500/20 transition-colors">
                <Sparkles size={140} />
            </div>
            <div className="p-3.5 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)] w-fit mb-6 relative z-10">
                <Coins size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 relative z-10">Royalty Fund</p>
            <p className="mt-4 text-4xl font-bold text-white tracking-tighter relative z-10">৳{(fundData?.royalty_fund || 0).toLocaleString()}</p>
            <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter relative z-10">Monthly rewards pool</p>
        </div>
      </div>

      {/* Manual Reward Section */}
      <div className="bg-white/[0.02] rounded-[3rem] border border-white/5 p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-10 opacity-[0.02] pointer-events-none">
            <Zap size={300} />
        </div>

        <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                <UserPlus size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Reward User</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Manually reward a user</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            {/* Search Part */}
            <div className="space-y-6">
                <label className="text-[10px] font-bold text-slate-500 block ml-1">Step 1: Find User</label>
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            placeholder="Enter ID, Email or Mobile..."
                            value={userIdSearch}
                            onChange={(e) => setUserIdSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white text-sm placeholder:text-slate-600 group-hover:bg-white/[0.05]"
                        />
                    </div>
                    <button
                        onClick={handleSearchUser}
                        disabled={searching || !userIdSearch}
                        className="px-8 bg-white text-black rounded-2xl font-bold text-[10px] hover:bg-sky-400 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl active:scale-[0.98]"
                    >
                        {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        Search
                    </button>
                </div>

                <AnimatePresence>
                {rewardUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-5 relative group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-emerald-400 font-black text-2xl overflow-hidden shadow-xl">
                                {rewardUser.profile_picture ? (
                                    <img src={rewardUser.profile_picture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    rewardUser.full_name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-lg tracking-tight">{rewardUser.full_name}</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">{rewardUser.mobile} <span className="mx-2 text-white/5">|</span> ID: {rewardUser.id}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400">Balance: ৳{rewardUser.balance}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setRewardUser(null)}
                                className="p-2 bg-white/5 text-slate-500 hover:text-red-400 rounded-xl transition-all hover:bg-red-500/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Matrix Progress */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-xs font-bold text-slate-400">Matrix Progress ({rewardUser.matrix_payout_count || 0}/18)</p>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Current Path</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {MATRIX_AMOUNTS.map((amt, idx) => {
                                    const isCompleted = idx < (rewardUser.matrix_payout_count || 0);
                                    return (
                                        <div
                                            key={idx}
                                            className={`relative h-12 rounded-xl border transition-all duration-500 flex flex-col items-center justify-center ${
                                                isCompleted
                                                ? "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                : "bg-white/[0.02] border-white/5"
                                            }`}
                                        >
                                            <span className={`text-[8px] font-bold ${isCompleted ? "text-emerald-400" : "text-slate-600"} leading-none mb-0.5`}>
                                                S{idx + 1}
                                            </span>
                                            <span className={`text-[10px] font-bold ${isCompleted ? "text-white" : "text-slate-500"} leading-none`}>
                                                ৳{amt}
                                            </span>
                                            {isCompleted && (
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleForceStep}
                                disabled={completingStep || rewardUser.matrix_payout_count >= 18}
                                className="mt-6 w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                            >
                                {completingStep ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Zap size={14} className="group-hover:animate-bounce" />
                                )}
                                {rewardUser.matrix_payout_count >= 18 ? "Matrix Completed" : `Force Complete Step ${rewardUser.matrix_payout_count + 1}`}
                            </button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Reward Part */}
            <div className={`space-y-6 transition-all duration-500 ${!rewardUser ? 'opacity-20 blur-[2px] pointer-events-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
                <label className="text-[10px] font-bold text-slate-500 block ml-1">Step 2: Reward Details</label>
                <div className="space-y-4">
                    <div className="relative group">
                        <input
                            type="number"
                            placeholder="Amount (BDT)"
                            value={rewardAmount}
                            onChange={(e) => setRewardAmount(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white text-sm font-bold tracking-tight group-hover:bg-white/[0.05]"
                        />
                    </div>
                    <textarea
                        placeholder="Notes..."
                        value={rewardDescription}
                        onChange={(e) => setRewardDescription(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white text-sm placeholder:text-slate-600 h-28 resize-none group-hover:bg-white/[0.05]"
                    ></textarea>
                    <button
                        onClick={handleSendReward}
                        disabled={sendingReward || !rewardAmount || rewardAmount <= 0}
                        className="w-full py-5 bg-sky-500 text-white rounded-2xl font-bold text-xs shadow-2xl shadow-sky-500/20 hover:bg-sky-400 hover:shadow-sky-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.99]"
                    >
                        {sendingReward ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                        Send Reward
                    </button>
                    <p className="text-center text-[9px] font-bold text-slate-600">Confirmation required</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
