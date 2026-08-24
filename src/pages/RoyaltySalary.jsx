import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Users, Coins, History, Search, Loader2, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight, Edit, TrendingUp, Calendar, Zap } from "lucide-react";

const API_BASE = "https://api.easysarvice.com/api";

function Badge({ children, color = "gray" }) {
  const map = {
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    red:    "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    gray:   "bg-white/5 text-slate-400 border-white/10",
    blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
    sky:    "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${map[color]}`}>
      {children}
    </span>
  );
}

export default function RoyaltySalary() {
  const { token } = useAuth();
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [distributing, setDistributing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState("eligible"); // "eligible" or "history"

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [eligibleRes, historyRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/royalty/admin/eligible-list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/royalty/history/monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/royalty/my-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const eligibleData = await eligibleRes.json();
      const historyData = await historyRes.json();
      const statusData = await statusRes.json();

      if (eligibleData.status === "success") setEligibleUsers(eligibleData.data);
      if (historyData.status === "success") setHistory(historyData.data);
      if (statusData.status === "success") setStatus(statusData.data);

      if (eligibleData.status !== "success" || historyData.status !== "success" || statusData.status !== "success") {
        throw new Error("Failed to synchronize network nodes");
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

  const handleDistribute = async () => {
    if (!status?.is_active) return alert("Distribution protocol is currently offline.");
    if (!window.confirm(`Initiate mass credit distribution of ৳${status?.global_royalty_fund} across ${eligibleUsers.length} entities?`)) return;

    setDistributing(true);
    try {
      const res = await fetch(`${API_BASE}/royalty/admin/distribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Network handshake failed.");
    } finally {
      setDistributing(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !status?.is_active;
    if (!window.confirm(`${newStatus ? "Online" : "Offline"} Royalty Distribution Protocol?`)) return;

    setToggling(true);
    try {
      const res = await fetch(`${API_BASE}/royalty/admin/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: newStatus }),
      });
      const data = await res.json();
      if (data.status === "success") fetchData();
      else alert(data.message);
    } catch (err) {
      alert("Status toggle failure");
    } finally {
      setToggling(false);
    }
  };

  const handleAdjustFund = async () => {
    const amount = window.prompt("Re-calibrate Royalty Asset Reserve:", status?.global_royalty_fund);
    if (amount === null || amount === "" || isNaN(amount)) return;

    try {
      const res = await fetch(`${API_BASE}/royalty/admin/adjust-fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (data.status === "success") fetchData();
      else alert(data.message);
    } catch (err) {
      alert("Reserve adjustment failure");
    }
  };

  const filteredUsers = eligibleUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.mobile?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-bold text-slate-500">Loading royalty data...</span>
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
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-3xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
            <Coins size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Royalty Payments</h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Monthly rewards for users</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`px-6 py-3 rounded-2xl font-bold text-[10px] flex items-center gap-3 transition-all border shadow-xl ${
              status?.is_active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            {status?.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            Status: {status?.is_active ? "Online" : "Offline"}
          </button>

          <button
            onClick={fetchData}
            className="p-3.5 bg-white/5 text-slate-400 rounded-2xl hover:text-white hover:bg-white/10 transition-all border border-white/5"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleDistribute}
            disabled={distributing || !status?.is_active || eligibleUsers.length === 0 || (status?.global_royalty_fund || 0) <= 0}
            className="flex-1 xl:flex-none px-10 py-4 bg-sky-500 text-white rounded-2xl font-bold text-[10px] shadow-2xl shadow-sky-500/20 hover:bg-sky-400 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            <Zap size={18} />
            {distributing ? "Executing..." : "Send Payments"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
            { label: "Royalty Fund", value: `৳${(status?.global_royalty_fund || 0).toLocaleString()}`, sub: "Available fund for users", color: "text-sky-400", bg: "from-sky-500/20 to-blue-500/5", border: "border-sky-500/20", icon: <Coins size={18} />, action: handleAdjustFund },
            { label: "Eligible Users", value: eligibleUsers.length, sub: "Qualified users found", color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/20", icon: <Users size={18} /> },
            { label: "Payment Rate", value: `৳${(status?.estimated_payout || 0).toLocaleString()}`, sub: "Estimated amount per user", color: "text-amber-400", bg: "from-amber-500/20 to-orange-500/5", border: "border-amber-500/20", icon: <TrendingUp size={18} /> }
        ].map((card, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-[2.5rem] border ${card.border} bg-gradient-to-br ${card.bg} p-8 backdrop-blur-xl transition-all hover:scale-[1.02]`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-white/5 ${card.color} border border-white/5`}>
                        {card.icon}
                    </div>
                    {card.action && (
                        <button onClick={card.action} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><Edit size={14} /></button>
                    )}
                </div>
                <p className="text-[10px] font-bold text-slate-500">{card.label}</p>
                <p className={`mt-3 text-4xl font-bold ${card.color} tracking-tighter`}>{card.value}</p>
                <p className="mt-2 text-[10px] font-bold text-slate-500">{card.sub}</p>
            </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5 backdrop-blur-md">
            <button
                onClick={() => setActiveTab("eligible")}
                className={`px-8 py-3 rounded-xl text-[10px] font-bold transition-all ${
                    activeTab === "eligible" ? "bg-sky-500 text-white shadow-lg" : "text-slate-500 hover:text-white"
                }`}
            >
                Eligible Users
            </button>
            <button
                onClick={() => setActiveTab("history")}
                className={`px-8 py-3 rounded-xl text-[10px] font-bold transition-all ${
                    activeTab === "history" ? "bg-sky-500 text-white shadow-lg" : "text-slate-500 hover:text-white"
                }`}
            >
                Payment History
            </button>
        </div>

        {activeTab === "eligible" ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-sky-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search via User, Mobile or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white text-sm placeholder:text-slate-600 group-hover:bg-white/[0.05]"
                    />
                </div>

                <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                            <thead>
                                <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                                    <th className="px-8 py-5">User</th>
                                    <th className="px-8 py-5">Contact Info</th>
                                    <th className="px-8 py-5 text-center">Referrals</th>
                                    <th className="px-8 py-5 text-center">Verified Referrals</th>
                                    <th className="px-8 py-5">KYC Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-sky-400 font-bold text-xl overflow-hidden shadow-lg">
                                                    {user.profile_picture ? (
                                                        <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.full_name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm tracking-tight">{user.full_name}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">ID: #{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-white font-bold">{user.mobile}</div>
                                            <div className="text-[10px] text-slate-500 font-medium tracking-tight">{user.email}</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-lg font-bold text-white tracking-tighter">{user.total_referrals}</span>
                                            <div className="text-[9px] text-slate-600 font-bold">Total</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-lg font-bold text-emerald-400 tracking-tighter">{user.verified_referrals}</span>
                                            <div className="text-[9px] text-emerald-900/60 font-bold">Verified</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <Badge color={user.id_verified === 'verified' ? 'green' : 'yellow'}>
                                                {user.id_verified || "Unverified"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center opacity-30">
                                            <div className="flex flex-col items-center">
                                                <Users size={64} className="mb-4" />
                                                <p className="text-xs font-bold">No eligible users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-500">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead>
                            <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                                <th className="px-8 py-5"><div className="flex items-center gap-2"><Calendar size={14} /> Month</div></th>
                                <th className="px-8 py-5"><div className="flex items-center gap-2"><Coins size={14} /> Total Fund</div></th>
                                <th className="px-8 py-5 text-center">Users Paid</th>
                                <th className="px-8 py-5 text-center">Amount Per User</th>
                                <th className="px-8 py-5 text-right">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((row) => (
                                <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-white text-sm tracking-tight">{row.month_name}</div>
                                        <div className="text-[9px] text-slate-500 font-bold mt-0.5">Completed</div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-sky-400 text-lg tracking-tighter">
                                        ৳{parseFloat(row.total_fund).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6 text-center font-bold text-white text-lg tracking-tighter">
                                        {row.user_count}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm tracking-tighter shadow-lg">
                                            ৳{parseFloat(row.amount_per_user).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-white font-bold">{new Date(row.distributed_at).toLocaleDateString("en-GB")}</div>
                                        <div className="text-[10px] text-slate-500 font-medium">{new Date(row.distributed_at).toLocaleTimeString()}</div>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center opacity-30">
                                        <div className="flex flex-col items-center">
                                            <History size={64} className="mb-4" />
                                            <p className="text-xs font-bold">No history found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
