import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    if (!token) return;
    fetchWithdraws();
  }, [token]);

  const fetchWithdraws = async () => {
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
  };

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

  const totalApproved = withdraws
    .filter((w) => w.status === "approved")
    .reduce((acc, w) => acc + (parseFloat(w.amount) || 0), 0);

  const pendingCount = withdraws.filter((w) => w.status === "pending").length;

  if (loading) return <div className="p-6 text-center text-slate-500">Loading withdrawals...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Withdraw Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage user withdrawal requests</p>
        </div>
        <span className="text-sm text-slate-500">{withdraws.length} total requests</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Pending Amount</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">৳{totalPending.toLocaleString()}</p>
          <p className="text-sm text-yellow-600 mt-1">{pendingCount} pending request{pendingCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Approved Amount</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">৳{totalApproved.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">Successfully processed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Requests</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{withdraws.length}</p>
          <p className="text-sm text-slate-400 mt-1">All time</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by ID, name, mobile, method or account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 placeholder:text-slate-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">User</th>
                <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Mobile</th>
                <th className="px-4 py-3 whitespace-nowrap">Method</th>
                <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Account</th>
                <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Trx ID</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">#{w.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{w.full_name}</div>
                    <div className="text-xs text-slate-500">{w.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{w.mobile}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                      {w.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-slate-600">
                    {w.account_no}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    ৳{parseFloat(w.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        w.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : w.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {w.status?.charAt(0).toUpperCase() + w.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                    {new Date(w.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-slate-500">
                    {w.trx_id || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {w.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(w, "approved")}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(w, "rejected")}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-400">
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {actionType === "approved" ? "Approve Withdrawal" : "Reject Withdrawal"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedWithdraw.full_name} — ৳{parseFloat(selectedWithdraw.amount).toLocaleString()} via {selectedWithdraw.method}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {actionType === "approved" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transaction ID (TrxID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="Enter bKash/Nagad TrxID"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remarks {actionType === "rejected" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionType === "rejected" ? "Reason for rejection..." : "Optional notes..."}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={processing}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  actionType === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? "Processing..." : actionType === "approved" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

