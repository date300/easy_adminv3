import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Wallet, Loader2 } from "lucide-react";

export default function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null); // কোন payment-এর উপর action চলছে
  const [filter, setFilter] = useState("all"); // all | verification | voucher | deposit

  const API_BASE = "https://api.easysarvice.com/api";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      const data = await res.json();
      if (data.status === "success") setPayments(data.data || []);
      else throw new Error(data.message || "Failed to load payments");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (paymentId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) return;

    setActionId(paymentId);
    try {
      const res = await fetch(`${API_BASE}/admin/approve-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId, action }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      } else {
        alert(data.message || "Action failed");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const filteredPayments =
    filter === "all"
      ? payments
      : payments.filter((p) => p.purpose === filter);

  const getMethodBadge = (method) => {
    const colors = {
      bkash: "bg-pink-100 text-pink-700",
      nagad: "bg-orange-100 text-orange-700",
      rocket: "bg-purple-100 text-purple-700",
      bank: "bg-blue-100 text-blue-700",
    };
    return colors[method?.toLowerCase()] || "bg-slate-100 text-slate-700";
  };

  const getPurposeBadge = (purpose) => {
    switch (purpose) {
      case "verification":
        return "bg-indigo-100 text-indigo-700";
      case "voucher":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Loader2 className="animate-spin" size={20} />
        Loading pending payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          Error: {error}
        </div>
        <button
          onClick={fetchPending}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={24} className="text-sky-500" />
            Payment Requests
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Review and manage pending payment submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            {payments.length} pending
          </span>
          <button
            onClick={fetchPending}
            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors"
            title="Refresh"
          >
            <Loader2 size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "verification", "voucher", "deposit"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
            {f !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({payments.filter((p) => p.purpose === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">User</th>
                <th className="px-4 py-3 whitespace-nowrap">Method</th>
                <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 whitespace-nowrap">Trx ID</th>
                <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Purpose</th>
                <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Sender</th>
                <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">#{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.user_name}</div>
                    <div className="text-xs text-slate-500">{p.user_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getMethodBadge(
                        p.method
                      )}`}
                    >
                      {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    ৳{Number(p.amount).toLocaleString("bn-BD")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 bg-slate-50 rounded">
                    {p.trx_id}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getPurposeBadge(
                        p.purpose
                      )}`}
                    >
                      {p.purpose}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs max-w-[140px] truncate">
                    {p.sender_info}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs whitespace-nowrap">
                    {new Date(p.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(p.id, "approved")}
                        disabled={actionId === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionId === p.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(p.id, "rejected")}
                        disabled={actionId === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-slate-400 text-sm">
                      {payments.length === 0
                        ? "No pending payments found"
                        : "No payments match this filter"}
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

