import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Loader2, AlertTriangle } from "lucide-react";

export default function Business() {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // businessId

  useEffect(() => {
    if (!token) return;
    fetch("https://api.easysarvice.com/api/admin/business/pending", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setBusinesses(data.data);
        else throw new Error(data.message);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (businessId, action) => {
    setActionLoading(businessId + action);
    try {
      const res = await fetch("https://api.easysarvice.com/api/admin/business/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId, action }),
      });
      const data = await res.json();
      if (data.status === "success") {
        // Remove from list after action
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading businesses...</span>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase size={24} className="text-amber-400" />
            Business List
        </h1>
          <p className="text-sm text-slate-400 font-medium">{businesses.length} businesses pending approval</p>
        </div>
      </div>

      <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                <th className="px-6 py-5 whitespace-nowrap">ID</th>
                <th className="px-6 py-5 whitespace-nowrap">Name</th>
                <th className="px-6 py-5 whitespace-nowrap hidden sm:table-cell">Category</th>
                <th className="px-6 py-5 whitespace-nowrap hidden md:table-cell">Type</th>
                <th className="px-6 py-5 whitespace-nowrap">Owner</th>
                <th className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">Address</th>
                <th className="px-6 py-5 whitespace-nowrap">Status</th>
                <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {businesses.map((biz) => (
                <tr key={biz.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{biz.id}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-black text-white text-sm tracking-tight">{biz.business_name}</div>
                    <div className="text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-1">{biz.mobile_number || biz.user_mobile}</div>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">{biz.category}</span>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell text-slate-500 font-medium">{biz.business_type}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-black text-white text-[11px] uppercase tracking-wide">{biz.user_name}</div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-tighter">{biz.user_email}</div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell max-w-[150px] truncate text-slate-500 font-medium italic">
                    {biz.business_address}
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleAction(biz.id, "approved")}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionLoading === biz.id + "approved" ? <Loader2 size={12} className="animate-spin" /> : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(biz.id, "rejected")}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionLoading === biz.id + "rejected" ? <Loader2 size={12} className="animate-spin" /> : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center opacity-40">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                            <span className="text-2xl">?</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No business requests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
