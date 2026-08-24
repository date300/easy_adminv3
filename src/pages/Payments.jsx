import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle, XCircle, Wallet, Loader2, RefreshCw,
  History, AlertTriangle, ChevronLeft, ChevronRight,
  Clock, Filter, Eye, RotateCcw, X, FileText, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatProfilePic = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http")) return filename;
    return `https://api.easysarvice.com/public/uploads/profile_pics/${filename}`;
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(n) {
  return "৳" + Number(n || 0).toLocaleString("en-BD");
}

const copyToClipboard = (text, onToast) => {
    navigator.clipboard.writeText(text);
    onToast("Identity captured to clipboard", "success");
};

// ─── Badge Components ────────────────────────────────────────────────────────

const METHOD_COLORS = {
  bkash:  "bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]",
  nagad:  "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
  rocket: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  bank:   "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
  card:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
};

const PURPOSE_COLORS = {
  verification: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
  voucher:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
};

const STATUS_COLORS = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
};

const VALID_PURPOSES = ["verification", "voucher"];
const VALID_STATUSES = ["pending", "approved", "rejected"];

function Badge({ label, colorMap, value }) {
  const cls = colorMap[value?.toLowerCase()] || "bg-white/5 text-slate-400 border-white/10";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${cls}`}>
      {label || value}
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const base = type === "error"
    ? "bg-red-500 shadow-red-500/20"
    : "bg-emerald-500 shadow-emerald-500/20";

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-xs font-bold transition-all text-white animate-in slide-in-from-bottom-4 duration-300 ${base}`}>
      {type === "error" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
      {msg}
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={12} /></button>
    </div>
  );
}

// ─── Audit Log Modal ─────────────────────────────────────────────────────────

function AuditModal({ token, paymentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    fetch(`${API_BASE}/admin/deposit/payment/logs/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") setData(d);
        else setErr(d.message || "Failed to load logs.");
      })
      .catch(() => setErr("Network error."))
      .finally(() => setLoading(false));
  }, [token, paymentId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#121212] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                <FileText size={20} />
            </div>
            <div>
                <span className="font-bold text-white text-sm">Payment Details</span>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">ID: #{paymentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 custom-scrollbar relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
              <span className="text-[10px] font-bold text-slate-500">Scanning Logs...</span>
            </div>
          ) : err ? (
            <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-center">{err}</p>
          ) : (
            <>
              {/* Payment Detail */}
              <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 mb-10 relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Wallet size={100} />
                </div>
                <div className="flex gap-2 flex-wrap mb-6 relative z-10">
                  <Badge colorMap={STATUS_COLORS} value={data.payment.status} />
                  <Badge colorMap={PURPOSE_COLORS} value={data.payment.purpose} />
                  <Badge colorMap={METHOD_COLORS} value={data.payment.method} />
                </div>
                <div className="relative z-10">
                    <p className="text-white text-2xl font-bold tracking-tight mb-1">
                      {data.payment.user_name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mb-6">{data.payment.user_email}</p>

                    <div className="flex items-baseline gap-3">
                        <p className="font-bold text-sky-400 text-4xl tracking-tighter">{fmtAmount(data.payment.amount)}</p>
                        <span className="text-[10px] font-bold text-slate-600">Amount</span>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 border-t border-white/5 pt-6 text-[10px] font-bold text-slate-500">
                    <div>Transaction ID: <span className="text-sky-400 font-mono ml-1">{data.payment.trx_id}</span></div>
                    <div>Timestamp: <span className="text-slate-300 ml-1">{fmtDate(data.payment.created_at)}</span></div>
                </div>
              </div>

              {/* Timeline */}
              {data.logs.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                    <p className="text-[10px] font-bold text-slate-500">Zero Interactions Recorded</p>
                </div>
              ) : (
                <div className="relative pl-10 space-y-8">
                  <div className="absolute left-[13px] top-2 bottom-0 w-px bg-white/5" />
                  {data.logs.map((log, i) => (
                    <div key={i} className="relative group/log">
                      <div className="absolute -left-[37px] top-1.5 w-6 h-6 rounded-full border-4 border-[#121212] bg-[#1a1a1a] flex items-center justify-center transition-all group-hover/log:bg-sky-500 shadow-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 transition-all group-hover/log:bg-white" />
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
                        <div className="flex flex-wrap gap-4 items-center mb-4">
                          <Badge colorMap={STATUS_COLORS} value={log.from_status} />
                          <div className="w-4 h-px bg-slate-800" />
                          <Badge colorMap={STATUS_COLORS} value={log.to_status} />
                          {log.admin_name && (
                            <span className="text-[10px] font-bold text-slate-500 ml-auto border border-white/5 px-3 py-1 rounded-lg bg-black/20">Agent: {log.admin_name}</span>
                          )}
                        </div>
                        {log.note && (
                          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 mb-3">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{log.note}"</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                            <Clock size={10} />
                            {fmtDate(log.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Override Modal ───────────────────────────────────────────────────────────

function OverrideModal({ token, payment, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!newStatus) return setErr("Target state required.");
    if (note.trim().length < 5) return setErr("Note must be at least 5 characters.");
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/deposit/payment/override/${payment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newStatus, note }),
      });
      const data = await res.json();
      if (data.status === "success") {
        onSuccess(data.message);
        onClose();
      } else {
        setErr(data.message || "Override failed.");
      }
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const options = VALID_STATUSES.filter(s => s !== payment.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <RotateCcw size={20} />
            </div>
            <div>
                <span className="font-bold text-white text-sm">Manual Update</span>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">ID: #{payment.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8 relative z-10">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl px-6 py-5 text-[11px] font-bold text-amber-500/90 flex items-start gap-4 backdrop-blur-sm">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed tracking-wide">
              Warning: Payment status is <span className="text-white underline">{payment.status.toUpperCase()}</span>.
              Updating will manually adjust the balance.
            </span>
          </div>

          <div className="px-8 py-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 mb-1">Target Identity</span>
                <span className="text-xs font-bold text-white">{payment.user_name}</span>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 mb-1">Impact</span>
                <span className="text-lg font-bold text-sky-400 block tracking-tighter">{fmtAmount(payment.amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-4 ml-1">Calibrate Target State</label>
            <div className="flex gap-3">
              {options.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-bold border transition-all duration-300 ${
                    newStatus === s
                      ? s === "approved"
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.2)] scale-[1.02]"
                        : "bg-red-500 text-white border-red-400 shadow-[0_10px_20px_rgba(239,68,68,0.2)] scale-[1.02]"
                      : "bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-4 ml-1">
              Operation Directive <span className="text-red-500/50">*</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Detailed reason for override protocols..."
              rows={3}
              className="w-full px-6 py-5 rounded-3xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none transition-all hover:bg-white/[0.05]"
            />
          </div>

          {err && <p className="text-red-400 text-[10px] font-bold text-center animate-pulse bg-red-500/5 py-3 rounded-xl border border-red-500/10">{err}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-white text-black text-xs font-bold shadow-2xl hover:bg-sky-400 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Executing..." : "Confirm Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.01] relative z-10">
      <span className="text-[10px] font-bold text-slate-500">
        Items {from}–{to} <span className="text-slate-700 mx-2">/</span> Total {total} (Page {page}/{pages})
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all active:scale-90"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── PENDING TAB ─────────────────────────────────────────────────────────────

function PendingTab({ token, onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [auditId, setAuditId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchPending = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/deposit/payment/pending?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") setData(json);
      else throw new Error(json.message);
    } catch (e) {
      onToast(e.message || "Protocol error", "error");
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  useEffect(() => { fetchPending(1); }, [fetchPending]);

  const handleAction = async (paymentId, action) => {
    if (!window.confirm(`Initiate payment ${action} protocol?`)) return;
    setActionId(paymentId);
    try {
      const res = await fetch(`${API_BASE}/admin/deposit/payment/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId, action }),
      });
      const json = await res.json();
      if (json.status === "success") {
        onToast(`Signal ${action} confirmed.`, "success");
        fetchPending(page);
      } else {
        onToast(json.message || "Authorization failed", "error");
      }
    } catch {
      onToast("Network handshake failed.", "error");
    } finally {
      setActionId(null);
    }
  };

  const changePage = (p) => {
    setPage(p);
    fetchPending(p);
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
      <Loader2 className="animate-spin text-sky-400 mb-4" size={40} />
      <span className="text-[11px] font-bold text-slate-500">Loading...</span>
    </div>
  );

  const payments = data?.data || [];
  const purposeOptions = ["all", ...VALID_PURPOSES];
  const filtered = purposeFilter === "all" ? payments : payments.filter(p => p.purpose === purposeFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
          {purposeOptions.map(f => (
            <button
              key={f}
              onClick={() => setPurposeFilter(f)}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold transition-all ${
                purposeFilter === f ? "bg-white text-black shadow-xl" : "text-slate-500 hover:text-white"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-2 opacity-40 font-bold">[{payments.filter(p => p.purpose === f).length}]</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {data?.pagination?.total ?? 0} Pending Payments
          </div>
          <button
            onClick={() => fetchPending(page)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-90"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Method</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Purpose</th>
                <th className="px-8 py-5">Sender Info</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{p.id}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                            {p.profile_picture ? (
                                <img src={formatProfilePic(p.profile_picture)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sky-400 font-bold text-sm">{(p.user_name || "?").charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm tracking-tight">{p.user_name}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">{p.user_email}</div>
                            {p.user_phone && (
                                <div className="flex items-center gap-2 group/copy mt-1.5 cursor-pointer" onClick={() => copyToClipboard(p.user_phone, onToast)}>
                                    <div className="text-[9px] text-slate-600 font-bold transition-colors group-hover/copy:text-sky-400">{p.user_phone}</div>
                                    <Copy size={10} className="text-slate-700 opacity-0 group-hover/copy:opacity-100 transition-all" />
                                </div>
                            )}
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge colorMap={METHOD_COLORS} value={p.method} />
                  </td>
                  <td className="px-8 py-6 font-bold text-white text-base tracking-tighter">{fmtAmount(p.amount)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(p.trx_id, onToast)}>
                        <span className="font-mono text-[10px] bg-white/5 text-sky-400 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all group-hover/copy:bg-sky-500/10">{p.trx_id}</span>
                        <Copy size={12} className="text-slate-600 opacity-0 group-hover/copy:opacity-100 transition-all" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge colorMap={PURPOSE_COLORS} value={p.purpose} />
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] text-slate-500 font-bold max-w-[150px] truncate" title={p.sender_info}>
                      {p.sender_info || "—"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleAction(p.id, "approved")}
                        disabled={actionId === p.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        {actionId === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(p.id, "rejected")}
                        disabled={actionId === p.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold hover:bg-red-500/20 transition-all disabled:opacity-50 active:scale-95"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => setAuditId(p.id)}
                        className="p-2.5 text-slate-500 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-all"
                        title="Audit Log"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-32 text-center opacity-30">
                    <div className="flex flex-col items-center">
                        <Clock size={64} className="mb-4" />
                        <p className="text-xs font-bold">No pending payments found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={data?.pagination} onPage={changePage} />
      </div>

      <AnimatePresence>
        {auditId && <AuditModal token={token} paymentId={auditId} onClose={() => setAuditId(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── HISTORY TAB ─────────────────────────────────────────────────────────────

const INIT_FILTERS = { status: "", purpose: "", userId: "", page: 1 };

function HistoryTab({ token, onToast }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [auditId, setAuditId] = useState(null);
  const [overridePayment, setOverridePayment] = useState(null);

  const fetchHistory = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.status)  params.set("status", f.status);
      if (f.purpose) params.set("purpose", f.purpose);
      if (f.userId)  params.set("userId", f.userId);
      params.set("page", f.page);
      params.set("limit", 15);

      const res = await fetch(`${API_BASE}/admin/deposit/payment/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") setData(json);
      else throw new Error(json.message);
    } catch (e) {
      onToast(e.message || "Sync failure", "error");
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  useEffect(() => { fetchHistory(INIT_FILTERS); }, [fetchHistory]);

  const applyFilter = () => {
    const updated = { ...filters, page: 1 };
    setFilters(updated);
    fetchHistory(updated);
  };

  const resetFilter = () => {
    setFilters(INIT_FILTERS);
    fetchHistory(INIT_FILTERS);
  };

  const changePage = (p) => {
    const updated = { ...filters, page: p };
    setFilters(updated);
    fetchHistory(updated);
  };

  const summary = data?.summary || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { key: "pending",  label: "Pending",  color: "amber", icon: <Clock size={16} />  },
          { key: "approved", label: "Approved", color: "emerald", icon: <CheckCircle size={16} /> },
          { key: "rejected", label: "Rejected", color: "red", icon: <XCircle size={16} /> },
        ].map(({ key, label, color, icon }) => (
          <div key={key} className={`group relative overflow-hidden rounded-[2rem] border border-${color}-500/20 bg-gradient-to-br from-${color}-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02]`}>
            <div className={`p-2.5 rounded-xl bg-white/5 text-${color}-400 border border-white/5 w-fit mb-4`}>
                {icon}
            </div>
            <p className="text-[10px] font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white tracking-tighter">{summary[key]?.count ?? 0}</p>
            <p className={`mt-1 text-[11px] font-bold text-${color}-400/80 tracking-tight`}>{fmtAmount(summary[key]?.total ?? 0)} Total</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-wrap gap-6 items-end shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 ml-1">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-w-[140px] appearance-none cursor-pointer hover:bg-white/[0.05]"
          >
            <option value="" className="bg-[#121212]">ALL STATUSES</option>
            {VALID_STATUSES.map(s => (
              <option key={s} value={s} className="bg-[#121212] font-bold">{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 ml-1">Purpose</label>
          <select
            value={filters.purpose}
            onChange={e => setFilters(f => ({ ...f, purpose: e.target.value }))}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-w-[160px] appearance-none cursor-pointer hover:bg-white/[0.05]"
          >
            <option value="" className="bg-[#121212]">ALL PURPOSES</option>
            {VALID_PURPOSES.map(p => (
              <option key={p} value={p} className="bg-[#121212] font-bold">{p.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 ml-1">User ID</label>
          <input
            type="number"
            min="1"
            value={filters.userId}
            onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
            placeholder="ID..."
            className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-32 hover:bg-white/[0.05]"
          />
        </div>

        <div className="flex gap-3 relative z-10 ml-auto w-full md:w-auto">
            <button
                onClick={applyFilter}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-3.5 bg-sky-500 text-white rounded-xl text-[10px] font-bold hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
            >
                <Filter size={14} /> Search
            </button>
            <button
                onClick={resetFilter}
                className="p-3.5 border border-white/10 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                title="Reset Filters"
            >
                <RefreshCw size={16} />
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
        {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <Loader2 className="animate-spin text-sky-400 mb-4" size={40} />
                <span className="text-[11px] font-bold text-slate-500">Loading...</span>
            </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">User</th>
                    <th className="px-8 py-5">Method</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Transaction ID</th>
                    <th className="px-8 py-5">Purpose</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Admin</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.data || []).map(p => (
                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{p.id}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                                {p.profile_picture ? (
                                    <img src={formatProfilePic(p.profile_picture)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sky-400 font-bold text-sm">{(p.user_name || "?").charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm tracking-tight">{p.user_name}</div>
                                <div className="text-[10px] text-slate-500 font-bold mt-0.5">{p.user_email}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><Badge colorMap={METHOD_COLORS} value={p.method} /></td>
                      <td className="px-8 py-6 font-bold text-white text-base tracking-tighter">{fmtAmount(p.amount)}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(p.trx_id, onToast)}>
                            <span className="font-mono text-[10px] bg-white/5 text-sky-400 px-2.5 py-1.5 rounded-lg border border-white/5">{p.trx_id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6"><Badge colorMap={PURPOSE_COLORS} value={p.purpose} /></td>
                      <td className="px-8 py-6"><Badge colorMap={STATUS_COLORS} value={p.status} /></td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {p.last_action ? (
                          <div>
                            <span className="text-[10px] font-bold text-white">{p.last_admin_name || "SYSTEM"}</span>
                            <div className="text-[9px] text-slate-500 font-bold mt-1">{fmtDate(p.last_action_at)}</div>
                          </div>
                        ) : <span className="text-slate-800 font-bold">—</span>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setAuditId(p.id)}
                            className="p-2.5 text-slate-500 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-all"
                            title="Logs"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setOverridePayment(p)}
                            className="p-2.5 text-slate-500 hover:text-amber-400 bg-white/5 border border-white/10 rounded-xl transition-all"
                            title="Update"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(data?.data || []).length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-32 text-center opacity-30">
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
            <Pagination pagination={data?.pagination} onPage={changePage} />
          </>
        )}
      </div>

      <AnimatePresence>
        {auditId && (
            <AuditModal token={token} paymentId={auditId} onClose={() => setAuditId(null)} />
        )}
        {overridePayment && (
            <OverrideModal
            token={token}
            payment={overridePayment}
            onClose={() => setOverridePayment(null)}
            onSuccess={msg => {
                onToast(msg, "success");
                fetchHistory(filters);
            }}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPayments() {
  const { token } = useAuth();
  const [tab, setTab]     = useState("pending");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  if (!token) return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-xs font-bold animate-pulse">
        Access Link Offline — Authorization Required
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet size={26} className="text-sky-400" />
            Payment Management
          </h2>
          <p className="text-slate-500 text-[10px] font-bold mt-1">Manage payments and history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5 backdrop-blur-xl shadow-2xl">
        {[
          { key: "pending", icon: <Clock size={16} />, label: "Pending" },
          { key: "history", icon: <History size={16} />, label: "History" },
        ].map(t => (
                <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                      tab === t.key
                        ? "bg-white text-black shadow-2xl scale-100"
                        : "text-slate-500 hover:text-white"
                    }`}
                >
                    {t.icon} {t.label}
                </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {tab === "pending"
                    ? <PendingTab token={token} onToast={showToast} />
                    : <HistoryTab token={token} onToast={showToast} />
                }
            </motion.div>
          </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
            <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
