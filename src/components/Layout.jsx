import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, Users, CreditCard, Briefcase, ArrowUpRight,
  LogOut, Package, Coins, LayoutGrid, Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const { adminName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/home", icon: <LayoutDashboard size={20} /> },
    { name: "Royalty Salary", path: "/royalty-salary", icon: <Coins size={20} /> },
    { name: "Matrix Fund", path: "/matrix-fund", icon: <LayoutGrid size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    { name: "Payments", path: "/payments", icon: <CreditCard size={20} /> },
    { name: "Payment Config", path: "/payment-methods", icon: <CreditCard size={20} /> },
    { name: "Products", path: "/product", icon: <Package size={20} /> },
    { name: "Businesses", path: "/business", icon: <Briefcase size={20} /> },
    { name: "Jobs", path: "/admin/jobs", icon: <Briefcase size={20} /> },
    { name: "Withdrawals", path: "/withdraw", icon: <ArrowUpRight size={20} /> },
  ];

  return (
    <div className="relative flex h-screen bg-[#040816] text-white overflow-hidden">

      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(41,182,246,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.06),_transparent_28%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#29B6F6]/5 blur-[80px]" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#7c3aed]/5 blur-[90px]" />
      </div>

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212]/80 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30">
                <Sparkles size={18} className="text-sky-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">
                EASY<span className="text-sky-400">ADMIN</span>
            </span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent"
                }`
              }
            >
              <div className="transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span className="font-semibold text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsOpen(false)}
            />
        )}
      </AnimatePresence>

      {/* ========== MAIN CONTENT ========== */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#121212]/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 bg-white/5 rounded-xl md:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-slate-300 font-bold text-[10px] sm:text-xs">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{adminName || "Super Admin"}</p>
                <p className="text-[10px] text-sky-400 font-bold mt-1">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sky-400 font-black text-sm">
                {(adminName || "A").charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

