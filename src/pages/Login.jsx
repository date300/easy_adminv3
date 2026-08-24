import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, Loader2, AlertCircle, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://api.easysarvice.com/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status === "success") {
        login(data.token, data.name);
        navigate("/");
      } else {
        setError(data.message || "Credential verification failed. Access denied.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040816] px-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Tech Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          {/* Header */}
          <div className="p-10 text-center relative z-10">
            <div className="inline-flex p-4 bg-sky-500/10 rounded-3xl border border-sky-500/20 text-sky-400 mb-6 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                <Cpu size={40} className="animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Easy Service</h1>
            <p className="text-xs text-slate-500 font-semibold">Admin Login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 backdrop-blur-md"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-white text-sm placeholder:text-slate-600 transition-all hover:bg-white/[0.05]"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-white text-sm placeholder:text-slate-600 transition-all hover:bg-white/[0.05]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-sm text-white transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${
                loading
                  ? "bg-slate-800 cursor-not-allowed opacity-50"
                  : "bg-sky-600 hover:bg-sky-500 shadow-sky-900/20 hover:shadow-sky-500/30"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Logging in...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Login
                </>
              )}
            </button>

            <div className="pt-6 border-t border-white/5">
                <p className="text-center text-[10px] font-medium text-slate-500 leading-loose">
                    Authorized Access Only<br/>
                    All actions are monitored and logged
                </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
