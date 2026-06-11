import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle, XCircle, Wallet, Loader2, RefreshCw,
  Eye, RotateCcw, ChevronLeft, ChevronRight, X, AlertTriangle,
  ClipboardList,
} from "lucide-react";

const API_BASE = "https://api.easysarvice.com/api";

// ─── Modal ───────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge Helpers ────────────────────────────────────────────────
const METHOD_BADGE = {
  bkash:  "bg-pink-100 text-pink-700 border border-pink-200",
  nagad:  "bg-orange-100 text-orange-700 border border-orange-200",
  rocket: "bg-purple-100 text-purple-700 border border-purple-200",
  bank:   "bg-blue-100 text-blue-700 border border-blue-200",
};
const PURPOSE_BADGE = {
  verification: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  voucher:      "bg-emerald-100 text-emerald-700 border border-emerald-200",
};
const STATUS_BADGE = {
  pending:  "bg-amber-100 text-amber-700 border border-amber-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};
const getMethodBadge  = (m) => METHOD_BADGE[m?.toLowerCase()]  || "bg-slate-100 text-slate-600 border border-slate-200";
const getPurposeBadge = (p) => PURPOSE_BADGE[p]                || "bg-slate-100 text-slate-600 border border-slate-200";
const getStatusBadge  = (s) => STATUS_BADGE[s]                 || "bg-slate-100 text-slate-600 border border-slate-200";

const fmtDate = (d) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Payment Table ────────────────────────────────────────────────
function PaymentTable({ payments, onAction, onLog, onOverride, actionId, showActions, showStatus, showLastAction }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 whitespace-nowrap">User</th>
              <th className="px-4 py-3 whitespace-nowrap">Method</th>
              <th className="px-4 py-3 whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 whitespace-nowrap">Trx ID</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Purpose</th>
              <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Sender</th>
              {showStatus && <th className="px-4 py-3 whitespace-nowrap">Status</th>}
              {showLastAction && (
                <th className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">Last Action</th>
              )}
              <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 leading-tight">{p.user_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{p.user_email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getMethodBadge(p.method)}`}>
                    {p.method}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                  ৳{Number(p.amount).toLocaleString("bn-BD")}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {p.trx_id}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getPurposeBadge(p.purpose)}`}>
                    {p.purpose}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs max-w-[130px] truncate">
                  {p.sender_info}
                </td>
                {showStatus && (
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                )}
                {showLastAction && (
                  <td className="px-4 py-3 hidden xl:table-cell text-xs">
                    {p.last_action ? (
                      <div className="space-y-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(p.last_action)}`}>
                          {p.last_action}
                        </span>
                        {p.last_action_at && (
                          <div className="text-slate-400">{fmtDate(p.last_action_at)}</div>
                        )}
                        {p.last_admin_name && (
                          <div className="text-slate-400">by {p.last_admin_name}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs whitespace-nowrap">
                  {fmtDate(p.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Approve / Reject — only on pending tab */}
                    {showActions && (
                      <>
                        <button
                          onClick={() => onAction(p, "approved")}
                          disabled={!!actionId}
                          title="Approve"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {actionId === p.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => onAction(p, "rejected")}
                          disabled={!!actionId}
                          title="Reject"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {actionId === p.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                    {/* Override */}
                    <button
                      onClick={() => onOverride(p)}
                      title="Override status"
                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                    {/* Audit Log */}
                    <button
                      onClick={() => onLog(p)}
                      title="View audit log"
                      className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ClipboardList size={28} className="opacity-40" />
                    <span className="text-sm">No payments found</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function Payments() {
  const { token } = useAuth();

  // ── Tab ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("pending");

  // ── Pending ────────────────────────────────────────────────────
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [purposeFilter, setPurposeFilter] = useState("all");

  // ── History ────────────────────────────────────────────────────
  const [history, setHistory]                   = useState([]);
  const [histLoading, setHistLoading]           = useState(false);
  const [histError, setHistError]               = useState(null);
  const [histSummary, setHistSummary]           = useState({});
  const [histPagination, setHistPagination]     = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [histFilter, setHistFilter]             = useState({ status: "", purpose: "", page: 1 });

  // ── Action / Modals ────────────────────────────────────────────
  const [actionId, setActionId]           = useState(null);
  const [modalLoading, setModalLoading]   = useState(false);

  const [actionModal, setActionModal]     = useState(null); // { payment, action }
  const [actionNote, setActionNote]       = useState("");

  const [overrideModal, setOverrideModal] = useState(null); // { payment }
  const [overrideStatus, setOverrideStatus] = useState("approved");
  const [overrideNote, setOverrideNote]   = useState("");

  const [logModal, setLogModal]           = useState(null); // { payment, logs }
  const [logLoading, setLogLoading]       = useState(false);

  // ── Fetch Pending ──────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    if (!token) return setLoading(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error("Session expired. Please login again.");
      const data = await res.json();
      if (data.status === "success") setPayments(data.data || []);
      else throw new Error(data.message || "Failed to load payments");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Fetch History ──────────────────────────────────────────────
  const fetchHistory = useCallback(async (filters) => {
    if (!token) return;
    setHistLoading(true);
    setHistError(null);
    const params = new URLSearchParams();
    if (filters.status)  params.set("status",  filters.status);
    if (filters.purpose) params.set("purpose", filters.purpose);
    params.set("page",  String(filters.page));
    params.set("limit", "15");
    try {
      const res = await fetch(`${API_BASE}/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error("Session expired.");
      const data = await res.json();
      if (data.status === "success") {
        setHistory(data.data || []);
        setHistSummary(data.summary || {});
        setHistPagination(data.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
      } else throw new Error(data.message || "Failed to load history");
    } catch (err) {
      setHistError(err.message);
    } finally {
      setHistLoading(false);
    }
  }, [token]);

  // Initial loads
  useEffect(() => { fetchPending(); }, [fetchPending]);
  useEffect(() => {
    if (activeTab === "history") fetchHistory(histFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Approve / Reject (modal confirm) ──────────────────────────
  const openActionModal = (payment, action) => {
    setActionModal({ payment, action });
    setActionNote("");
  };
  const handleAction = async () => {
    if (!actionModal) return;
    const { payment, action } = actionModal;
    setModalLoading(true);
    setActionId(payment.id);
    try {
      const res = await fetch(`${API_BASE}/admin/approve-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentId: payment.id,
          action,
          ...(actionNote.trim() ? { note: actionNote.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPayments((prev) => prev.filter((p) => p.id !== payment.id));
        setActionModal(null);
        setActionNote("");
        if (activeTab === "history") fetchHistory(histFilter);
      } else {
        alert(data.message || "Action failed.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setModalLoading(false);
      setActionId(null);
    }
  };

  // ── Override ───────────────────────────────────────────────────
  const openOverrideModal = (payment) => {
    const others = ["approved", "rejected", "pending"].filter((s) => s !== payment.status);
    setOverrideModal({ payment });
    setOverrideStatus(others[0]);
    setOverrideNote("");
  };
  const handleOverride = async () => {
    if (!overrideModal) return;
    if (overrideNote.trim().length < 5) {
      alert("Note must be at least 5 characters.");
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/admin/payments/${overrideModal.payment.id}/override`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ newStatus: overrideStatus, note: overrideNote.trim() }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setOverrideModal(null);
        setOverrideNote("");
        fetchPending();
        if (activeTab === "history") fetchHistory(histFilter);
      } else {
        alert(data.message || "Override failed.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // ── Audit Log ──────────────────────────────────────────────────
  const openLog = async (payment) => {
    setLogModal({ payment, logs: [] });
    setLogLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/${payment.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setLogModal({ payment: data.payment, logs: data.logs });
      } else {
        alert(data.message || "Failed to load logs.");
        setLogModal(null);
      }
    } catch {
      alert("Network error.");
      setLogModal(null);
    } finally {
      setLogLoading(false);
    }
  };

  // ── History filter helpers ─────────────────────────────────────
  const applyHistFilter = (key, val) => {
    const updated = { ...histFilter, [key]: val, page: 1 };
    setHistFilter(updated);
    fetchHistory(updated);
  };
  const clearHistFilter = () => {
    const reset = { status: "", purpose: "", page: 1 };
    setHistFilter(reset);
    fetchHistory(reset);
  };
  const goPage = (p) => {
    const updated = { ...histFilter, page: p };
    setHistFilter(updated);
    fetchHistory(updated);
  };

  // ── Filtered pending payments ──────────────────────────────────
  const filteredPayments =
    purposeFilter === "all"
      ? payments
      : payments.filter((p) => p.purpose === purposeFilter);

  const overrideOptions = overrideModal
    ? ["approved", "rejected", "pending"].filter((s) => s !== overrideModal.payment.status)
    : [];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={22} className="text-sky-500" />
            Payment Management
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Review, approve, reject, and override payment submissions
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { key: "pending", label: `Pending (${payments.length})` },
          { key: "history", label: "Full History" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══ PENDING TAB ══════════════════════════════════════════ */}
      {activeTab === "pending" && (
        <>
          {/* Purpose filter + Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {["all", "verification", "voucher"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPurposeFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    purposeFilter === f
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f}
                  {f !== "all" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({payments.filter((p) => p.purpose === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={fetchPending}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-sky-600 bg-white border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={20} /> Loading pending payments...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3">
              <span>{error}</span>
              <button onClick={fetchPending} className="underline font-medium shrink-0">Retry</button>
            </div>
          ) : (
            <PaymentTable
              payments={filteredPayments}
              onAction={openActionModal}
              onLog={openLog}
              onOverride={openOverrideModal}
              actionId={actionId}
              showActions
            />
          )}
        </>
      )}

      {/* ══ HISTORY TAB ══════════════════════════════════════════ */}
      {activeTab === "history" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["pending", "approved", "rejected"].map((s) => (
              <div key={s} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusBadge(s)}`}>
                  {s}
                </span>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-800">
                    {histSummary[s]?.count ?? 0}
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    ৳{(histSummary[s]?.total ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={histFilter.status}
              onChange={(e) => applyHistFilter("status", e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={histFilter.purpose}
              onChange={(e) => applyHistFilter("purpose", e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">All Purpose</option>
              <option value="verification">Verification</option>
              <option value="voucher">Voucher</option>
            </select>
            <button
              onClick={clearHistFilter}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => fetchHistory(histFilter)}
              disabled={histLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-sky-600 bg-white border border-slate-200 rounded-lg transition-colors ml-auto disabled:opacity-50"
            >
              <RefreshCw size={14} className={histLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {histLoading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={20} /> Loading history...
            </div>
          ) : histError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3">
              <span>{histError}</span>
              <button onClick={() => fetchHistory(histFilter)} className="underline font-medium shrink-0">Retry</button>
            </div>
          ) : (
            <>
              <PaymentTable
                payments={history}
                onLog={openLog}
                onOverride={openOverrideModal}
                showStatus
                showLastAction
              />

              {/* Pagination */}
              {histPagination.pages > 1 && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-sm text-slate-500">
                    Showing {history.length} of {histPagination.total} payments
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goPage(histPagination.page - 1)}
                      disabled={histPagination.page <= 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: histPagination.pages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - histPagination.page) <= 2)
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => goPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            p === histPagination.page
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() => goPage(histPagination.page + 1)}
                      disabled={histPagination.page >= histPagination.pages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══ MODAL: Approve / Reject ════════════════════════════ */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setActionNote(""); }}
        title={
          actionModal?.action === "approved"
            ? "✅ Confirm Approval"
            : "❌ Confirm Rejection"
        }
      >
        {actionModal && (
          <div className="space-y-4">
            {/* Payment summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">User</span>
                <span className="font-medium text-slate-800">{actionModal.payment.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-800">
                  ৳{Number(actionModal.payment.amount).toLocaleString("bn-BD")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trx ID</span>
                <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {actionModal.payment.trx_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getMethodBadge(actionModal.payment.method)}`}>
                  {actionModal.payment.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getPurposeBadge(actionModal.payment.purpose)}`}>
                  {actionModal.payment.purpose}
                </span>
              </div>
              {actionModal.payment.purpose === "verification" && actionModal.action === "approved" && (
                <div className="pt-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1.5">
                  ℹ️ This will mark the user as <strong>verified</strong>.
                </div>
              )}
              {actionModal.payment.purpose === "voucher" && actionModal.action === "approved" && (
                <div className="pt-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5">
                  ℹ️ ৳{Number(actionModal.payment.amount).toLocaleString()} will be added to user's voucher balance.
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                placeholder="Add a note for this action..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setActionModal(null); setActionNote(""); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={modalLoading}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 flex items-center gap-1.5 transition-colors ${
                  actionModal.action === "approved"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {modalLoading && <Loader2 size={14} className="animate-spin" />}
                {actionModal.action === "approved" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Override ════════════════════════════════════ */}
      <Modal
        open={!!overrideModal}
        onClose={() => { setOverrideModal(null); setOverrideNote(""); }}
        title="⚠️ Override Payment Status"
      >
        {overrideModal && (
          <div className="space-y-4">
            {/* Warning */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2.5 rounded-xl text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                This will <strong>reverse side effects</strong> of the current status and apply the new one.
                {overrideModal.payment.purpose === "verification" && " User verification status will change."}
                {overrideModal.payment.purpose === "voucher" && " User voucher balance will be adjusted."}
              </span>
            </div>

            {/* Current info */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment #</span>
                <span className="font-mono text-xs text-slate-600">#{overrideModal.payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User</span>
                <span className="font-medium text-slate-800">{overrideModal.payment.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-800">
                  ৳{Number(overrideModal.payment.amount).toLocaleString("bn-BD")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusBadge(overrideModal.payment.status)}`}>
                  {overrideModal.payment.status}
                </span>
              </div>
            </div>

            {/* New status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Status <span className="text-red-500">*</span>
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow"
              >
                {overrideOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason <span className="text-red-500">*</span>{" "}
                <span className="text-slate-400 font-normal">(min 5 characters)</span>
              </label>
              <textarea
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this override..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow"
              />
              {overrideNote.length > 0 && overrideNote.trim().length < 5 && (
                <p className="text-xs text-red-500 mt-1">Note is too short.</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setOverrideModal(null); setOverrideNote(""); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={modalLoading || overrideNote.trim().length < 5}
                className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-60 flex items-center gap-1.5 transition-colors"
              >
                {modalLoading && <Loader2 size={14} className="animate-spin" />}
                Apply Override
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Audit Log ═══════════════════════════════════ */}
      <Modal
        open={!!logModal}
        onClose={() => setLogModal(null)}
        title={`Audit Log — Payment #${logModal?.payment?.id}`}
        maxWidth="max-w-lg"
      >
        {logLoading ? (
          <div className="flex items-center justify-center h-24 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={18} /> Loading logs...
          </div>
        ) : logModal ? (
          <div className="space-y-4">
            {/* Payment mini-summary */}
            <div className="bg-slate-50 rounded-xl p-3 text-sm flex flex-wrap gap-x-4 gap-y-1 border border-slate-100">
              <span className="text-slate-500">
                User: <span className="font-medium text-slate-700">{logModal.payment.user_name}</span>
              </span>
              <span className="text-slate-500">
                Amount:{" "}
                <span className="font-bold text-slate-800">
                  ৳{Number(logModal.payment.amount).toLocaleString("bn-BD")}
                </span>
              </span>
              <span className="text-slate-500">
                Purpose: <span className="capitalize font-medium text-slate-700">{logModal.payment.purpose}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize self-center ${getStatusBadge(logModal.payment.status)}`}>
                {logModal.payment.status}
              </span>
            </div>

            {/* Log entries */}
            {logModal.logs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <ClipboardList size={28} className="opacity-40" />
                <span className="text-sm">No audit logs yet.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {logModal.logs.map((log, i) => (
                  <div
                    key={i}
                    className="border border-slate-100 rounded-xl p-3 text-sm space-y-2 bg-white"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusBadge(log.from_status)}`}>
                        {log.from_status}
                      </span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusBadge(log.to_status)}`}>
                        {log.to_status}
                      </span>
                      <span className="ml-auto text-xs text-slate-400 shrink-0">
                        {fmtDate(log.created_at)}
                      </span>
                    </div>
                    {log.admin_name && (
                      <div className="text-xs text-slate-500">
                        By:{" "}
                        <span className="font-medium text-slate-700">{log.admin_name}</span>
                        {log.admin_email && (
                          <span className="text-slate-400 ml-1">({log.admin_email})</span>
                        )}
                      </div>
                    )}
                    {log.note && (
                      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
                        {log.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

