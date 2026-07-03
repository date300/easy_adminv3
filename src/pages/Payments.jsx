import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle, XCircle, Wallet, Loader2, RefreshCw,
  History, AlertTriangle, ChevronLeft, ChevronRight,
  Clock, Filter, Eye, RotateCcw, X, FileText
} from "lucide-react";

const API_BASE = "https://api.easysarvice.com/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Badge Components ────────────────────────────────────────────────────────

// ✅ FIX: Added "card" — API now accepts it as a valid method
const METHOD_COLORS = {
  bkash:  "bg-pink-100 text-pink-700 border-pink-200",
  nagad:  "bg-orange-100 text-orange-700 border-orange-200",
  rocket: "bg-purple-100 text-purple-700 border-purple-200",
  bank:   "bg-blue-100 text-blue-700 border-blue-200",
  card:   "bg-cyan-100 text-cyan-700 border-cyan-200",
};

// ✅ FIX: Removed "deposit" — API only accepts "verification" | "voucher"
const PURPOSE_COLORS = {
  verification: "bg-indigo-100 text-indigo-700 border-indigo-200",
  voucher:      "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_COLORS = {
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

// Valid values matching API
const VALID_PURPOSES = ["verification", "voucher"];
const VALID_STATUSES = ["pending", "approved", "rejected"];

function Badge({ label, colorMap, value }) {
  const cls = colorMap[value?.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${cls}`}>
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
    ? "bg-red-600 text-white"
    : "bg-emerald-600 text-white";

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${base}`}>
      {type === "error" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
      {msg}
      <button onClick={onClose}><X size={14} /></button>
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
    fetch(`${API_BASE}/admin/payments/${paymentId}/logs`, {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            <span className="font-bold text-slate-800">Audit Log — Payment #{paymentId}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : err ? (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{err}</p>
          ) : (
            <>
              {/* Payment Detail */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge colorMap={STATUS_COLORS} value={data.payment.status} />
                  <Badge colorMap={PURPOSE_COLORS} value={data.payment.purpose} />
                  <Badge colorMap={METHOD_COLORS} value={data.payment.method} />
                </div>
                <p className="text-slate-700 mt-2">
                  <span className="font-semibold">{data.payment.user_name}</span>
                  <span className="text-slate-500 ml-1">({data.payment.user_email})</span>
                </p>
                <p className="font-bold text-slate-800 text-lg">{fmtAmount(data.payment.amount)}</p>
                <p className="text-slate-500 font-mono text-xs">TrxID: {data.payment.trx_id}</p>
                <p className="text-slate-400 text-xs">Submitted: {fmtDate(data.payment.created_at)}</p>
              </div>

              {/* Timeline */}
              {data.logs.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">কোনো log পাওয়া যায়নি।</p>
              ) : (
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />
                  {data.logs.map((log, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-400 shadow" />
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <div className="flex flex-wrap gap-2 items-center mb-1">
                          <Badge colorMap={STATUS_COLORS} value={log.from_status} />
                          <span className="text-slate-400 text-xs">→</span>
                          <Badge colorMap={STATUS_COLORS} value={log.to_status} />
                          {log.admin_name && (
                            <span className="text-xs text-slate-500 ml-auto">by {log.admin_name}</span>
                          )}
                        </div>
                        {log.note && (
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1">{log.note}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{fmtDate(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
    if (!newStatus) return setErr("নতুন status বেছে নিন।");
    if (note.trim().length < 5) return setErr("কারণ কমপক্ষে ৫ অক্ষরের হতে হবে।");
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/${payment.id}/override`, {
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

  // ✅ FIX: current status বাদ দিয়ে বাকি valid status দেখাও
  const options = VALID_STATUSES.filter(s => s !== payment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-amber-500" />
            <span className="font-bold text-slate-800">Override — #{payment.id}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              বর্তমান status: <strong>{payment.status}</strong>।
              Override করলে balance/verification স্বয়ংক্রিয় ঠিক হবে।
            </span>
          </div>

          <div className="text-sm text-slate-600">
            <span className="font-semibold">{payment.user_name}</span> — {fmtAmount(payment.amount)} ({payment.purpose})
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">নতুন Status</label>
            <div className="flex gap-2">
              {options.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                    newStatus === s
                      ? s === "approved"
                        ? "bg-green-600 text-white border-green-600"
                        : s === "rejected"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-slate-700 text-white border-slate-700"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              কারণ <span className="text-red-400">(বাধ্যতামূলক)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="কেন override করছেন তা লিখুন..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{note.trim().length}/5 minimum</p>
          </div>

          {err && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{err}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
              বাতিল
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !newStatus || note.trim().length < 5}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              Override করুন
            </button>
          </div>
        </div>
      </div>
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <span className="text-xs text-slate-500">
        {from}–{to} of {total} records (Page {page}/{pages})
      </span>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── PENDING TAB ─────────────────────────────────────────────────────────────

function PendingTab({ token, onToast }) {
  const [data, setData] = useState(null);     // { data, pagination }
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [auditId, setAuditId] = useState(null);
  const [page, setPage] = useState(1);

  // ✅ FIX: fetchPending এখন page নেয়; API-এর pagination response handle করে
  const fetchPending = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/pending?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") setData(json);
      else throw new Error(json.message);
    } catch (e) {
      onToast(e.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  useEffect(() => { fetchPending(1); }, [fetchPending]);

  const handleAction = async (paymentId, action) => {
    if (!window.confirm(`Payment "${action}" করতে চান?`)) return;
    setActionId(paymentId);
    try {
      const res = await fetch(`${API_BASE}/admin/approve-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId, action }),
      });
      const json = await res.json();
      if (json.status === "success") {
        onToast(`Payment ${action} successfully.`, "success");
        fetchPending(page); // ✅ same page refresh
      } else {
        onToast(json.message || "Action failed", "error");
      }
    } catch {
      onToast("Network error.", "error");
    } finally {
      setActionId(null);
    }
  };

  const changePage = (p) => {
    setPage(p);
    fetchPending(p);
  };

  const payments = data?.data || [];

  // ✅ FIX: "deposit" purpose filter সরানো হয়েছে — API সাপোর্ট করে না
  const purposeOptions = ["all", ...VALID_PURPOSES];
  const filtered = purposeFilter === "all" ? payments : payments.filter(p => p.purpose === purposeFilter);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {purposeOptions.map(f => (
            <button
              key={f}
              onClick={() => setPurposeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                purposeFilter === f ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1 opacity-60">({payments.filter(p => p.purpose === f).length})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg font-semibold">
            <Clock size={12} className="inline mr-1" />
            {data?.pagination?.total ?? 0} pending
          </span>
          <button
            onClick={() => fetchPending(page)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-sky-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={20} /> Loading...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    {["ID", "User", "Method", "Amount", "Trx ID", "Purpose", "Sender", "Date", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs">{p.user_name}</div>
                        <div className="text-xs text-slate-400">{p.user_email}</div>
                        {/* ✅ FIX: user_phone → user_phone (API এখন mobile_number AS user_phone দেয়) */}
                        {p.user_phone && <div className="text-xs text-slate-400">{p.user_phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge colorMap={METHOD_COLORS} value={p.method} />
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{fmtAmount(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{p.trx_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge colorMap={PURPOSE_COLORS} value={p.purpose} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate" title={p.sender_info}>
                        {p.sender_info}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAction(p.id, "approved")}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionId === p.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <CheckCircle size={12} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(p.id, "rejected")}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                          <button
                            onClick={() => setAuditId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Audit Log"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-400 text-sm">
                        {payments.length === 0 ? "কোনো pending payment নেই" : "এই filter-এ কোনো payment নেই"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* ✅ FIX: Pending tab এ pagination যোগ হয়েছে */}
            <Pagination pagination={data?.pagination} onPage={changePage} />
          </>
        )}
      </div>

      {auditId && <AuditModal token={token} paymentId={auditId} onClose={() => setAuditId(null)} />}
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

  // ✅ FIX: useCallback-এ filters dependency নেই — f parameter দিয়ে explicit call হয়
  //         stale closure সমস্যা দূর হয়েছে
  const fetchHistory = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.status)  params.set("status", f.status);
      if (f.purpose) params.set("purpose", f.purpose);
      if (f.userId)  params.set("userId", f.userId);
      params.set("page", f.page);
      params.set("limit", 15);

      const res = await fetch(`${API_BASE}/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") setData(json);
      else throw new Error(json.message);
    } catch (e) {
      onToast(e.message || "Failed to load history", "error");
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  // ✅ FIX: initial load — INIT_FILTERS পাঠানো হচ্ছে explicitly
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
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "pending",  label: "Pending",  color: "yellow"  },
          { key: "approved", label: "Approved", color: "emerald" },
          { key: "rejected", label: "Rejected", color: "red"     },
        ].map(({ key, label, color }) => (
          <div key={key} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
            <p className={`text-xs font-semibold text-${color}-600 uppercase tracking-wide`}>{label}</p>
            <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{summary[key]?.count ?? 0}</p>
            <p className={`text-xs text-${color}-500 mt-0.5`}>{fmtAmount(summary[key]?.total ?? 0)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="">All</option>
            {/* ✅ FIX: VALID_STATUSES থেকে options — hardcode নয় */}
            {VALID_STATUSES.map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Purpose</label>
          <select
            value={filters.purpose}
            onChange={e => setFilters(f => ({ ...f, purpose: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="">All</option>
            {/* ✅ FIX: "deposit" সরানো হয়েছে — API validate করে এবং error দেয় */}
            {VALID_PURPOSES.map(p => (
              <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">User ID</label>
          <input
            type="number"
            min="1"
            value={filters.userId}
            onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
            placeholder="e.g. 42"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-28 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <button
          onClick={applyFilter}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          <Filter size={14} /> Filter
        </button>
        <button
          onClick={resetFilter}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="animate-spin" size={20} /> Loading...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    {["ID", "User", "Method", "Amount", "Purpose", "Status", "Last Action", "Date", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.data || []).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs">{p.user_name}</div>
                        <div className="text-xs text-slate-400">{p.user_email}</div>
                        {/* ✅ FIX: user_phone — API mobile_number AS user_phone দেয় */}
                        {p.user_phone && <div className="text-xs text-slate-400">{p.user_phone}</div>}
                      </td>
                      <td className="px-4 py-3"><Badge colorMap={METHOD_COLORS} value={p.method} /></td>
                      <td className="px-4 py-3 font-bold text-slate-800">{fmtAmount(p.amount)}</td>
                      <td className="px-4 py-3"><Badge colorMap={PURPOSE_COLORS} value={p.purpose} /></td>
                      <td className="px-4 py-3"><Badge colorMap={STATUS_COLORS} value={p.status} /></td>
                      <td className="px-4 py-3">
                        {p.last_action ? (
                          <div>
                            <span className="text-xs text-slate-600">{p.last_admin_name || "admin"}</span>
                            <div className="text-xs text-slate-400">{fmtDate(p.last_action_at)}</div>
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setAuditId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Audit Log"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setOverridePayment(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Override"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(data?.data || []).length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-400 text-sm">
                        কোনো payment পাওয়া যায়নি
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
            fetchHistory(filters); // ✅ FIX: explicit filters পাঠানো হচ্ছে
          }}
        />
      )}
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

  if (!token) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Please log in to continue.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={22} className="text-sky-500" />
            Payment Management
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Review, approve, reject, and override payments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: "pending", icon: <Clock size={15} />, label: "Pending" },
          { key: "history", icon: <History size={15} />, label: "Full History" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "pending"
        ? <PendingTab token={token} onToast={showToast} />
        : <HistoryTab token={token} onToast={showToast} />
      }

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

