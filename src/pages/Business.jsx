import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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

  if (loading) return <div className="p-6 text-center text-slate-500">Loading businesses...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Business Management</h2>
        <span className="text-sm text-slate-500">{businesses.length} pending</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Business Name</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Type</th>
              <th className="px-4 py-3 whitespace-nowrap">Owner</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Mobile</th>
              <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Address</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{biz.id}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700">
                  {biz.business_name}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{biz.category}</td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500">{biz.business_type}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium">{biz.user_name}</div>
                  <div className="text-xs text-slate-400 hidden sm:block">{biz.user_email}</div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">{biz.mobile_number || biz.user_mobile}</td>
                <td className="px-4 py-3 hidden lg:table-cell max-w-[150px] truncate text-slate-500">
                  {biz.business_address}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">
                    Pending
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">
                  {new Date(biz.created_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleAction(biz.id, "approved")}
                      disabled={actionLoading !== null}
                      className="px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === biz.id + "approved" ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(biz.id, "rejected")}
                      disabled={actionLoading !== null}
                      className="px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === biz.id + "rejected" ? "..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-slate-400">
                  No pending businesses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
