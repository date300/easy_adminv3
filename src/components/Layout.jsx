import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, Users, CreditCard, Briefcase, ArrowUpRight,
  UserCircle, LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    { name: "Payments", path: "/payments", icon: <CreditCard size={20} /> },
    { name: "Product", path: "/product", icon: <CreditCard size={20} /> },
    { name: "Business", path: "/business", icon: <Briefcase size={20} /> },
    { name: "Withdraw", path: "/withdraw", icon: <ArrowUpRight size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950/50">
          <span className="text-xl font-black text-sky-400">
            ADMIN<span className="text-white">PANEL</span>
          </span>
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 bg-slate-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-slate-700 font-bold uppercase tracking-wider text-sm sm:text-base md:text-lg truncate max-w-[200px] sm:max-w-full">
              System Management
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-3 pl-2 sm:pl-4 border-l">
              <span className="text-sm font-bold text-slate-700 hidden sm:inline">
                {adminName || "Admin"}
              </span>
              <UserCircle size={28} className="text-slate-300 hidden sm:block" />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

