import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Copy, ArrowUpRight, Search, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatProfilePic = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http")) return filename;
    return `https://api.easysarvice.com/public/uploads/profile_pics/${filename}`;
};

export default function Withdraw() {
  const { token } = useAuth();
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approved' or 'rejected'
  const [trxId, setTrxId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchWithdraws = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.easysarvice.com/api/admin/withdraws", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setWithdraws(data.data);
      else throw new Error(data.message || "Failed to fetch");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchWithdraws();
  }, [token, fetchWithdraws]);

  const openModal = (withdraw, action) => {
    setSelectedWithdraw(withdraw);
    setActionType(action);
    setTrxId("");
    setRemarks("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedWithdraw(null);
    setActionType(null);
    setTrxId("");
    setRemarks("");
  };

  const handleSubmitAction = async () => {
    if (!selectedWithdraw || !actionType) return;

    if (actionType === "approved" && !trxId.trim()) {
      alert("Please enter Transaction ID (TrxID)");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("https://api.easysarvice.com/api/admin/approve-withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawId: selectedWithdraw.id,
          action: actionType,
          trxId: actionType === "approved" ? trxId.trim() : null,
          remarks: remarks.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setWithdraws((prev) =>
          prev.map((w) =>
            w.id === selectedWithdraw.id
              ? {
                  ...w,
                  status: actionType,
                  trx_id: actionType === "approved" ? trxId.trim() : w.trx_id,
                  remarks: remarks.trim() || w.remarks,
                  updated_at: new Date().toISOString(),
                }
              : w
          )
        );
        closeModal();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = withdraws.filter((w) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      w.id?.toString().toLowerCase().includes(term) ||
      w.full_name?.toLowerCase().includes(term) ||
      w.mobile?.toLowerCase().includes(term) ||
      w.method?.toLowerCase().includes(term) ||
      w.account_no?.toLowerCase().includes(term);
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = withdraws
    .filter((w) => w.status === "pending")
    .reduce((acc, w) => acc + (parseFloat(w.amount) || 0), 0);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const totalApproved = withdraws
    .filter((w) => w.status === "approved")
    .reduce((acc, w) => acc + (parseFloat(w.amount) || 0), 0);

  const pendingCount = withdraws.filter((w) => w.status === "pending").length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading withdrawals...</span>
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
            <ArrowUpRight size={24} className="text-rose-400" />
            Withdrawal Requests
          </h1>
          <p className="text-sm text-slate-400 font-medium">{withdraws.length} total withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            Pending
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Pending", value: `৳${totalPending.toLocaleString()}`, sub: `${pendingCount} users waiting`, color: "text-amber-400", bg: "from-amber-500/20 to-orange-500/5", border: "border-amber-500/20" },
          { label: "Total Approved", value: `৳${totalApproved.toLocaleString()}`, sub: "Successfully paid", color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/20" },
          { label: "Total Requests", value: withdraws.length, sub: "Total requests overall", color: "text-sky-400", bg: "from-sky-500/20 to-blue-500/5", border: "border-sky-500/20" }
        ].map(card => (
          <div key={card.label} className={`group overflow-hidden rounded-3xl border ${card.border} bg-gradient-to-br ${card.bg} p-6 backdrop-blur-xl transition-all hover:scale-[1.02]`}>
            <p className="text-[10px] font-bold text-slate-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-black ${card.color} tracking-tighter`}>{card.value}</p>
            <p className="mt-2 text-[10px] font-bold text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-sky-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search via User, Mobile, or Method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all group-hover:bg-white/[0.05]"
            />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-w-[180px] appearance-none cursor-pointer"
        >
          <option value="all" className="bg-[#121212]">ALL STATUSES</option>
          <option value="pending" className="bg-[#121212]">PENDING</option>
          <option value="approved" className="bg-[#121212]">APPROVED</option>
          <option value="rejected" className="bg-[#121212]">REJECTED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                <th className="px-6 py-4 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 whitespace-nowrap">User</th>
                <th className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">Mobile</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Method</th>
                <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell">Account No</th>
                <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">Date</th>
                <th className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">Transaction ID</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((w) => (
                <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{w.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                            {w.profile_picture ? (
                                <img src={formatProfilePic(w.profile_picture)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sky-400 font-black text-sm">{(w.full_name || "?").charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <div className="font-black text-white text-sm tracking-tight">{w.full_name}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{w.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 group/copy">
                        <span className="text-slate-400 font-bold">{w.mobile}</span>
                        <button onClick={() => copyToClipboard(w.mobile)} className="opacity-0 group-hover/copy:opacity-100 p-1.5 bg-white/5 rounded-lg text-sky-400 transition-all active:scale-90">
                            <Copy size={12} />
                        </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-white/5 text-slate-300 border border-white/10 uppercase tracking-widest">
                      {w.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 group/copy">
                        <span className="font-mono text-slate-400 bg-black/20 px-2 py-1 rounded-lg border border-white/5">{w.account_no}</span>
                        <button onClick={() => copyToClipboard(w.account_no)} className="opacity-0 group-hover/copy:opacity-100 p-1.5 bg-white/5 rounded-lg text-sky-400 transition-all active:scale-90">
                            <Copy size={12} />
                        </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-black text-white text-sm tracking-tight">
                    ৳{parseFloat(w.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        w.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : w.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-500 font-bold uppercase tracking-tighter">
                    {new Date(w.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {w.trx_id ? (
                        <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-[10px] text-sky-400">{w.trx_id}</span>
                            <button onClick={() => copyToClipboard(w.trx_id)} className="opacity-0 group-hover/copy:opacity-100 p-1.5 bg-white/5 rounded-lg text-sky-400 transition-all active:scale-90">
                                <Copy size={12} />
                            </button>
                        </div>
                    ) : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {w.status === "pending" ? (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openModal(w, "approved")}
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-[0.98]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(w, "rejected")}
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.98]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center opacity-40">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                            <span className="text-2xl">?</span>
                        </div>
                        <p className="text-[10px] font-bold">No withdrawals found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
      {modalOpen && selectedWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#121212] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="p-6 sm:p-8 border-b border-white/5 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {actionType === "approved" ? "Approve Withdrawal" : "Reject Withdrawal"}
                </h3>
                <button onClick={closeModal} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">User</span>
                    <span className="text-xs font-black text-white">{selectedWithdraw.full_name}</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Amount</span>
                    <span className="text-sm font-black text-sky-400 block">৳{parseFloat(selectedWithdraw.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6 relative z-10">
              {actionType === "approved" && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="Enter transaction ID..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                  Notes {actionType === "rejected" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionType === "rejected" ? "Reason for rejection..." : "Optional notes..."}
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none transition-all"
                />
              </div>
            </div>

            <div className="p-8 border-t border-white/5 flex gap-4 relative z-10 bg-white/[0.01]">
              <button
                onClick={closeModal}
                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white border border-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={processing}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all ${
                  actionType === "approved"
                    ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400"
                    : "bg-red-500 shadow-red-500/20 hover:bg-red-400"
                } disabled:opacity-50 active:scale-[0.98]`}
              >
                {processing ? "Executing..." : actionType === "approved" ? "Approve" : "Confirm Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}

