import React from "react";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Total Users', 'Total Deposit', 'Total Withdraw'].map((item, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium">{item}</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {i === 0 ? "0.00" : i === 1 ? "0.00" : "0.00"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
