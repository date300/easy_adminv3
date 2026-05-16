import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, Wallet, ArrowUpRight, Bell, UserCircle } from "lucide-react";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/home", icon: <LayoutDashboard size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    { name: "Deposit", path: "/deposit", icon: <Wallet size={20} /> },
    { name: "Withdraw", path: "/withdraw", icon: <ArrowUpRight size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* 1. Side Navigation (Desktop) & Drawer (Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950/50">
          <span className="text-xl font-black text-sky-400">ADMIN<span className="text-white">PANEL</span></span>
          <button className="md:hidden" onClick={() => setIsOpen(false)}><X size={24} /></button>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}

      {/* 2. Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="p-2 bg-slate-100 rounded-lg md:hidden"><Menu size={24} /></button>
            <h1 className="text-slate-700 font-bold hidden md:block uppercase tracking-wider">System Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <span className="text-sm font-bold text-slate-700 hidden sm:block">Admin Account</span>
              <UserCircle size={32} className="text-slate-300" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Rendering */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
