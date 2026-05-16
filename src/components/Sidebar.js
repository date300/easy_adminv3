import React, { useState } from "react";

export default function Sidebar({ dark }) {
  const [active, setActive] = useState("Dashboard");

  const menu = ["Dashboard", "Users", "Deposit", "Withdraw"];

  return (
    <div
      className={`w-[220px] h-screen p-5 transition-colors duration-300 ${
        dark ? "bg-slate-950" : "bg-slate-200"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-6 ${
          dark ? "text-sky-400" : "text-slate-900"
        }`}
      >
        Admin
      </h2>

      <nav>
        {menu.map((item) => (
          <div
            key={item}
            onClick={() => setActive(item)}
            className={`p-2.5 mt-2 rounded-lg cursor-pointer font-medium transition-all duration-200 ${
              active === item
                ? "bg-sky-400 text-black shadow-lg shadow-sky-400/20"
                : dark
                ? "text-white hover:bg-slate-800"
                : "text-slate-700 hover:bg-slate-300"
            }`}
          >
            {item}
          </div>
        ))}
      </nav>
    </div>
  );
}
