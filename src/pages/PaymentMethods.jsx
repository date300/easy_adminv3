import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard, Edit2, Save, X, Loader2, AlertTriangle, CheckCircle,
  Info, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";

export default function PaymentMethods() {
  const { token } = useAuth();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") {
        setMethods(json.data);
      } else {
        setError(json.message || "Failed to fetch");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (method) => {
    setEditingId(method.id);
    setEditData({ ...method });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payment-methods/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast("Payment method updated successfully");
        setEditingId(null);
        fetchMethods();
      } else {
        showToast(json.message || "Update failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="text-sky-400" />
            Payment Methods
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage merchant numbers and instructions for the app</p>
        </div>
        <button
          onClick={fetchMethods}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {methods.map((method) => (
          <motion.div
            layout
            key={method.id}
            className={`relative group bg-[#121212]/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 ${
              editingId === method.id ? "ring-2 ring-sky-500/50 border-sky-500/20" : "hover:border-white/10"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                    {method.type === 'bkash' || method.type === 'nagad' || method.type === 'binance' ? (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 text-sky-400 font-bold text-xs">
                        {method.name.charAt(0)}
                      </div>
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${method.name}&background=random&color=fff`}
                        alt={method.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{method.name}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      method.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {method.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {editingId !== method.id ? (
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 bg-white/5 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 rounded-xl transition-all border border-transparent hover:border-sky-500/20"
                  >
                    <Edit2 size={18} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                    >
                      <X size={18} />
                    </button>
                    <button
                      disabled={saving}
                      onClick={handleSave}
                      className="p-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Merchant Number</label>
                  {editingId === method.id ? (
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      value={editData.number || ""}
                      onChange={(e) => setEditData({ ...editData, number: e.target.value })}
                    />
                  ) : (
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-mono">
                      {method.number}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    Instructions
                    <Info size={10} className="text-slate-600" />
                  </label>
                  {editingId === method.id ? (
                    <textarea
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all resize-none"
                      value={editData.instructions || ""}
                      onChange={(e) => setEditData({ ...editData, instructions: e.target.value })}
                      placeholder="Enter steps separated by new lines..."
                    />
                  ) : (
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 leading-relaxed whitespace-pre-line min-h-[80px]">
                      {method.instructions || "No instructions provided."}
                    </div>
                  )}
                </div>

                {/* Status Toggle (only in edit) */}
                {editingId === method.id && (
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs font-bold text-slate-300">Method Availability</span>
                    <button
                      onClick={() => setEditData({ ...editData, is_active: !editData.is_active })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        editData.is_active ? "bg-sky-500" : "bg-slate-700"
                      }`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        editData.is_active ? "left-6" : "left-1"
                      }`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
