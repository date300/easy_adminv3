import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch("https://api.easysarvice.com/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setUsers(data.data);
        else throw new Error(data.message);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleToggleBlock = async (userId, currentBlocked) => {
    const action = currentBlocked ? "unblock" : "block";
    try {
      const res = await fetch("https://api.easysarvice.com/api/admin/users/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_matrix_blocked: action === "block" } : u
          )
        );
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error");
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">User Management</h2>
        <span className="text-sm text-slate-500">{users.length} users</span>
      </div>

      {/* Horizontal scroll for small screens */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Name</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Mobile</th>
              <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Email</th>
              <th className="px-4 py-3 whitespace-nowrap">Verified</th>
              <th className="px-4 py-3 whitespace-nowrap">Balance</th>
              <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">V.Balance</th>
              <th className="px-4 py-3 whitespace-nowrap">Active</th>
              <th className="px-4 py-3 whitespace-nowrap">Blocked</th>
              <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{user.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">{user.full_name}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{user.mobile}</td>
                <td className="px-4 py-3 hidden md:table-cell max-w-[150px] truncate">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    user.id_verified === "verified"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {user.id_verified === "verified" ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">{user.balance} BDT</td>
                <td className="px-4 py-3 hidden lg:table-cell">{user.voucher_balance} BDT</td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={user.is_matrix_blocked ? "text-red-600" : "text-green-600"}>
                    {user.is_matrix_blocked ? "Blocked" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleBlock(user.id, user.is_matrix_blocked)}
                    className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-semibold transition-colors ${
                      user.is_matrix_blocked
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {user.is_matrix_blocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
