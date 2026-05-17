import React from "react";

export default function Users() {
  const users = [
    { id: 1, name: "Ariful Islam", email: "arif@example.com", status: "Active" },
    { id: 2, name: "Sumon Ali", email: "sumon@example.com", status: "Pending" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">User Management</h2>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-600 text-sm uppercase">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium">{user.name}</td>
              <td className="px-6 py-4 text-slate-600">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
