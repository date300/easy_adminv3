import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, FileText, Loader2, AlertTriangle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";

function DetailModal({ token, productId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setErr("");
    fetch(`${API_BASE}/admin/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setDetail(d);
        else setErr(d.message || "Failed to load");
      })
      .catch(() => setErr("Network error"))
      .finally(() => setLoading(false));
  }, [token, productId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative flex flex-col"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                <FileText size={20} />
            </div>
            <div>
                <span className="font-black text-white text-lg tracking-tight uppercase">Product Details</span>
                <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">Product information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto relative z-10 flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Loading...</span>
            </div>
          ) : err ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3">
                <AlertTriangle size={16} />
                {err}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex flex-col gap-2">
                <h3 className="font-black text-2xl text-white tracking-tight leading-none">{detail.product.product_name}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[9px] font-black uppercase tracking-widest border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.15)]">
                        {detail.product.category || "General Registry"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ID: {detail.product.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Vendor</p>
                  <p className="text-sm font-black text-white tracking-tight">{detail.product.vendor_name || 'Anonymous'}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">{detail.product.vendor_email || detail.product.vendor_mobile}</p>
                </div>
                <div className="p-6 rounded-3xl bg-sky-500/5 border border-sky-500/10 group hover:bg-sky-500/10 transition-colors">
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">Price</p>
                  <p className="text-2xl font-black text-white tracking-tighter">৳{parseFloat(detail.product.price).toLocaleString()}</p>
                  <p className="text-[10px] text-sky-500/60 font-bold mt-1 uppercase tracking-tighter">Per Unit</p>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description</p>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {detail.product.description || 'No description provided.'}
                </p>
              </div>

              {detail.product.images && detail.product.images.length > 0 && (
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {detail.product.images.map((img, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden group">
                                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 relative z-10 bg-white/[0.02]">
            <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-[0.99] shadow-xl"
            >
                Close
            </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Product() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/products/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setProducts(d.data || []);
        else throw new Error(d.message || "Failed to load");
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id, action) => {
    if (!token) return alert("No auth token");
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API_BASE}/admin/product/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setProducts((p) => p.filter((x) => x.id !== id));
      } else {
        alert(data.message || "Action failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  if (!token) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Unauthorized Access</div>;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading products...</span>
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
            <Package size={24} className="text-sky-400" />
            Product Approval
        </h1>
          <p className="text-sm text-slate-400 font-medium">{products.length} products pending approval</p>
        </div>
      </div>

      <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                <th className="px-6 py-5 whitespace-nowrap">ID</th>
                <th className="px-6 py-5 whitespace-nowrap">Product Name</th>
                <th className="px-6 py-5 hidden sm:table-cell">Vendor</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{p.id}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-black text-white text-sm tracking-tight">{p.product_name}</div>
                    <div className="text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-1">৳{parseFloat(p.price).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="font-black text-white text-[10px] uppercase tracking-wide">{p.vendor_name || 'Unknown'}</div>
                    <div className="text-[9px] text-slate-500 font-bold tracking-tighter mt-0.5">{p.vendor_email || p.vendor_mobile}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setDetailId(p.id)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all active:scale-[0.98]"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAction(p.id, 'approve')}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionLoading === p.id + 'approve' ? <Loader2 size={12} className="animate-spin" /> : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(p.id, 'reject')}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionLoading === p.id + 'reject' ? <Loader2 size={12} className="animate-spin" /> : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center opacity-40">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                            <span className="text-2xl">?</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No product requests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {detailId && <DetailModal token={token} productId={detailId} onClose={() => setDetailId(null)} />}
      </AnimatePresence>
    </div>
  );
}
