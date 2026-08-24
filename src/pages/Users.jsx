import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users as UsersIcon, Shield, X, Trash2, Edit2, Wallet, Coins,
  Bell, UserPlus, Fingerprint, Activity, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "https://api.easysarvice.com/api";

const MATRIX_AMOUNTS = [5, 10, 15, 20, 25, 30, 50, 100, 200, 300, 400, 500, 800, 1000, 1500, 2000, 2500, 3000];

// ─── helpers ─────────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-BD");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("en-GB") : "—";

const kycColor = (v) => v === "verified" ? "green" : v === "rejected" ? "red" : "yellow";

function Badge({ children, color = "gray" }) {
  const map = {
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    red:    "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    gray:   "bg-white/5 text-slate-400 border-white/10",
    blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${map[color]}`}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-white/5 border-t-sky-500 rounded-full animate-spin shadow-[0_0_15px_rgba(14,165,233,0.2)]" />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl w-full ${wide ? "max-w-4xl" : "max-w-md"} max-h-[90vh] flex flex-col relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10 bg-white/[0.02]">
          <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5 shadow-inner">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar relative z-10 flex-1">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────
function Confirm({ open, msg, onYes, onNo, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#18181b] border border-white/10 rounded-[2rem] shadow-2xl p-8 max-w-sm w-full relative overflow-hidden"
      >
        <p className="text-slate-300 font-bold mb-8 text-center leading-relaxed relative z-10">{msg}</p>
        <div className="flex gap-4 justify-center relative z-10">
          <button onClick={onNo}
            className="flex-1 py-4 rounded-2xl border border-white/5 bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button onClick={onYes}
            className={`flex-1 py-4 rounded-2xl text-white text-xs font-bold transition-all shadow-xl ${danger ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-sky-500 hover:bg-sky-600 shadow-sky-500/20"}`}>
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = type === "success" ? "bg-emerald-500 shadow-emerald-500/20" : type === "error" ? "bg-red-500 shadow-red-500/20" : "bg-sky-500 shadow-sky-500/20";
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] ${colors} text-white px-6 py-4 rounded-2xl shadow-2xl text-xs font-bold transition-all animate-in slide-in-from-bottom-4 duration-300`}>
      {msg}
    </div>
  );
}

const copyToClipboard = (text, onToast) => {
    navigator.clipboard.writeText(text);
    onToast("Copied to clipboard", "success");
};

// ─── Generic tab table ────────────────────────────────────────────
function TabTable({ cols, rows, render }) {
  if (!rows.length)
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center mb-4">
                <span className="text-2xl text-slate-500">?</span>
            </div>
            <p className="text-xs font-bold text-slate-500">No Data Records Found</p>
        </div>
    );
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="min-w-full text-xs text-left">
        <thead>
          <tr className="bg-white/[0.03] text-slate-500 text-[10px] font-bold">
            {cols.map(c => (
              <th key={c} className="px-6 py-5 whitespace-nowrap uppercase tracking-wider">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((r, i) => (
            <tr key={r.id || i} className="group hover:bg-white/[0.01] transition-colors">
              {render(r, i).map((cell, ci) => (
                <td key={ci} className="px-6 py-5 whitespace-nowrap text-slate-400 group-hover:text-slate-200 transition-colors font-medium">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function OverviewTab({ user, onToast }) {
  const s = user.stats || {};
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Main Balance", value: `৳${fmt(user.balance)}`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Voucher", value: `৳${fmt(user.voucher_balance)}`, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Total Income", value: `৳${fmt(s.totalIncome)}`, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Deposited", value: `৳${fmt(s.totalDeposit)}`, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Withdrawn", value: `৳${fmt(s.totalWithdrawn)}`, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} border rounded-[1.5rem] p-5 text-center transition-all hover:scale-[1.02]`}>
            <div className={`text-xl font-black tracking-tight ${c.color}`}>{c.value}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Matrix Progress Visualization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
            <Activity size={100} />
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                Matrix Payout Progress ({user.matrix_payout_count || 0}/{MATRIX_AMOUNTS.length})
            </h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Payout Sequence</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 relative z-10">
            {MATRIX_AMOUNTS.map((amt, idx) => {
                const isCompleted = idx < (user.matrix_payout_count || 0);
                return (
                    <div
                        key={idx}
                        className={`relative group h-14 rounded-2xl border transition-all flex flex-col items-center justify-center ${
                            isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-white/[0.02] border-white/5"
                        }`}
                    >
                        <span className={`text-[8px] font-bold ${isCompleted ? "text-emerald-400" : "text-slate-600"} leading-none mb-1`}>
                            {idx + 1}
                        </span>
                        <span className={`text-xs font-bold ${isCompleted ? "text-white" : "text-slate-500"} leading-none`}>
                            ৳{amt}
                        </span>
                        {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        <div className="mt-6 flex items-center justify-between text-[10px] relative z-10 border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40"></div>
                    <span className="text-slate-500 font-bold">Received</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded border border-white/5 bg-white/[0.02]"></div>
                    <span className="text-slate-500 font-bold">Pending</span>
                </div>
            </div>
            <div className="font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                Total Matrix Income: ৳{fmt(MATRIX_AMOUNTS.slice(0, user.matrix_payout_count || 0).reduce((a, b) => a + b, 0))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Fingerprint size={14} className="text-sky-400" />
                Identity Information
            </h4>
            <div className="space-y-1">
                {[
                    ["User ID", user.id],
                    ["Full Name", user.full_name],
                    ["Mobile", user.mobile],
                    ["Email", user.email],
                    ["Referral Code", user.referral_code],
                    ["Referred By ID", user.referred_by || "None"],
                ].map(([label, val]) => (
                    <div key={label} className="flex items-start justify-between py-2.5 border-b border-white/[0.03] group transition-colors">
                        <span className="text-slate-500 text-xs font-medium">{label}</span>
                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{val}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" />
                System Statistics
            </h4>
            <div className="space-y-1">
                {[
                    ["Account Status", <Badge color={user.is_active ? "green" : "red"}>{user.is_active ? "Active" : "Disabled"}</Badge>],
                    ["KYC Status", <Badge color={user.id_verified === "verified" ? "green" : "yellow"}>{user.id_verified || "pending"}</Badge>],
                    ["Matrix Access", <Badge color={user.is_matrix_blocked ? "red" : "green"}>{user.is_matrix_blocked ? "Blocked" : "Enabled"}</Badge>],
                    ["Joined Date", fmtDT(user.created_at)],
                    ["Total Products", s.totalProducts || 0],
                    ["Total Businesses", s.totalBusinesses || 0],
                ].map(([label, val]) => (
                    <div key={label} className="flex items-start justify-between py-2.5 border-b border-white/[0.03] group transition-colors">
                        <span className="text-slate-500 text-xs font-medium">{label}</span>
                        <div className="text-right">{val}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {user.referrer && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-indigo-500/10 transition-all">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <UserPlus size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest mb-1">Affiliate Source</p>
                <p className="font-bold text-slate-200 text-lg">{user.referrer.full_name}</p>
                <p className="text-xs text-slate-500">{user.referrer.mobile} • {user.referrer.email}</p>
              </div>
          </div>
          <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Code</div>
              <div className="font-mono text-indigo-400 bg-indigo-400/5 px-3 py-1 rounded-lg border border-indigo-400/10">{user.referrer.referral_code}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function IncomeTab({ data }) {
  return (
    <TabTable
      cols={["#", "Type", "Amount", "Description", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <Badge color={r.type === "referral" ? "blue" : r.type === "matrix" ? "green" : r.type === "withdraw" ? "red" : "gray"}>{r.type}</Badge>,
        <span className={parseFloat(r.amount) < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>৳{fmt(r.amount)}</span>,
        <span className="text-xs text-slate-500 max-w-[250px] truncate block">{r.description}</span>,
        fmtDT(r.created_at),
      ]}
    />
  );
}

function PaymentsTab({ data, onToast }) {
  return (
    <TabTable
      cols={["#", "Method", "Amount", "Transaction ID", "Purpose", "KYC", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <span className="font-bold uppercase text-slate-300">{r.method}</span>,
        `৳${fmt(r.amount)}`,
        <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(r.trx_id, onToast)}>
            <span className="font-mono text-xs text-sky-400 bg-sky-400/5 px-2 py-1 rounded border border-sky-400/10">{r.trx_id}</span>
        </div>,
        r.purpose,
           <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function WithdrawsTab({ data, onToast }) {
  return (
    <TabTable
      cols={["#", "Method", "Account No", "Amount", "KYC", "Remarks", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <span className="font-bold uppercase text-slate-300">{r.method}</span>,
        <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(r.account_no, onToast)}>
            <span className="font-mono text-slate-400">{r.account_no}</span>
        </div>,
        <span className="font-bold text-white">৳{fmt(r.amount)}</span>,
           <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>,
        <span className="text-xs text-slate-500 italic max-w-[150px] truncate block">{r.remarks || "No remarks"}</span>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function BusinessesTab({ data }) {
  return (
    <TabTable
      cols={["#", "Business Name", "Category", "Type", "KYC", "Fee", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <span className="font-bold text-slate-200">{r.business_name}</span>,
        r.category,
        r.business_type,
           <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>,
        `৳${fmt(r.voucher_fee)}`,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function ProductsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Media", "Product Name", "Price", "Stock", "KYC", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.image
          ? <img src={r.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-white/5" />
          : <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-slate-700">NA</div>,
        <span className="font-bold text-slate-200">{r.product_name || r.name}</span>,
        <span className="text-emerald-400">৳{fmt(r.price)}</span>,
        r.stock,
           <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function NotificationsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Alert Content (EN)", "Source", "Status", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <span className="text-xs text-slate-400 max-w-[300px] whitespace-normal block leading-relaxed">{r.message_en || r.message || "—"}</span>,
        <Badge color="indigo">{r.source || "System"}</Badge>,
        <Badge color={r.is_read ? "green" : "yellow"}>{r.is_read ? "Read" : "Unread"}</Badge>,
        fmtDT(r.created_at),
      ]}
    />
  );
}

function ReferralsTab({ data }) {
  return (
    <TabTable
      cols={["#", "User Identity", "Mobile", "Code", "Balance", "KYC", "Joined"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <div className="flex flex-col">
            <span className="font-bold text-slate-200">{r.full_name}</span>
            <span className="text-[10px] text-slate-500 uppercase">#{r.id}</span>
        </div>,
        r.mobile,
        <span className="font-mono text-sky-400">{r.referral_code}</span>,
        `৳${fmt(r.balance)}`,
           <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // debounce helper
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [detailUser, setDetailUser] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [detailData, setDetailData] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmDanger, setConfirmDanger] = useState(false);

  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({ amount: "", type: "add", note: "" });
  const [voucherModal, setVoucherModal] = useState(false);
  const [voucherForm, setVoucherForm] = useState({ amount: "", type: "add" });
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ message_en: "", message_bn: "", source: "Admin" });

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);
  const closeToast = () => setToast(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") {
        setUsers(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalUsers(json.pagination?.total || 0);
      } else {
        showToast(json.message || "Failed to load users", "error");
      }
    } catch (e) {
      showToast("Network error", "error");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, token, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchDetail = async (userId, tab) => {
    if (tab === "overview") {
      setDetailLoading(true);
      try {
        const res = await fetch(`${API}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.status === "success") {
          setDetailUser(json.data);
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to load user details", "error");
      } finally {
        setDetailLoading(false);
      }
      return;
    }

    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setDetailData(prev => ({ ...prev, [tab]: json.data || [] }));
    } catch (e) {
      console.error(e);
      showToast(`Failed to load ${tab}`, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (user) => {
    setDetailUser(user);
    setDetailTab("overview");
    setDetailData({});
    fetchDetail(user.id, "overview");
  };

  const switchTab = (tab) => {
    setDetailTab(tab);
    if (tab !== "overview" && !detailData[tab]) fetchDetail(detailUser.id, tab);
  };

  const confirm = (msg, action, danger = false) => {
    setConfirmMsg(msg);
    setConfirmAction(() => action);
    setConfirmDanger(danger);
    setConfirmOpen(true);
  };

  const apiPost = async (url, body, successMsg) => {
    try {
      const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast(successMsg || json.message);
        return true;
      } else {
        showToast(json.message || "Action failed", "error");
        return false;
      }
    } catch (e) {
      showToast("Network error", "error");
      return false;
    }
  };

  const handleBlockMatrix = (block) => {
    confirm(
      block ? "Block matrix payouts for this user?" : "Unblock matrix payouts?",
      async () => {
        const ok = await apiPost(`/admin/users/block`, { userId: detailUser.id, action: block ? "block" : "unblock" }, block ? "Matrix blocked" : "Matrix unblocked");
        if (ok) {
          setDetailUser(prev => ({ ...prev, is_matrix_blocked: block }));
          fetchUsers();
        }
      },
      block
    );
  };

  const handleToggleActive = () => {
    const action = detailUser.is_active ? "deactivate" : "activate";
    confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} this user?`,
      async () => {
        const ok = await apiPost(`/admin/users/${detailUser.id}/toggle-active`, {}, `User ${action}d`);
        if (ok) {
          setDetailUser(prev => ({ ...prev, is_active: !prev.is_active }));
          fetchUsers();
        }
      },
      action === "deactivate"
    );
  };

  const handleDelete = () => {
    confirm(
      "Delete this user? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`${API}/admin/users/${detailUser.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.status === "success") {
            showToast("User deleted");
            setDetailUser(null);
            fetchUsers();
          } else {
            showToast(json.message || "Delete failed", "error");
          }
        } catch (e) {
          showToast("Network error", "error");
        }
      },
      true
    );
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`${API}/admin/users/${detailUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast("User updated");
        setDetailUser(prev => ({ ...prev, ...editForm }));
        setEditModal(false);
        fetchUsers();
      } else {
        showToast(json.message || "Update failed", "error");
      }
    } catch (e) {
      showToast("Network error", "error");
    }
  };

  const handleBalanceAdjust = async () => {
    const actionLabel =
      balanceForm.type === "add" ? "added" :
      balanceForm.type === "deduct" ? "deducted" : "set (overwritten)";

    const ok = await apiPost(
      `/admin/users/${detailUser.id}/adjust-balance`,
      balanceForm,
      `Balance ${actionLabel} successfully`
    );
    if (ok) {
      setBalanceModal(false);
      setBalanceForm({ amount: "", type: "add", note: "" });
      fetchDetail(detailUser.id, "overview");
      fetchUsers();
    }
  };

  const handleVoucherAdjust = async () => {
    const ok = await apiPost(
      `/admin/users/${detailUser.id}/adjust-voucher`,
      voucherForm,
      `Voucher ${voucherForm.type === "add" ? "added" : "deducted"}`
    );
    if (ok) {
      setVoucherModal(false);
      setVoucherForm({ amount: "", type: "add" });
      fetchDetail(detailUser.id, "overview");
      fetchUsers();
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    const ok = await apiPost(
      `/admin/users/${detailUser.id}/reset-password`,
      { new_password: newPassword },
      "Password reset successfully"
    );
    if (ok) {
      setPasswordModal(false);
      setNewPassword("");
    }
  };

  const handleNotify = async () => {
    if (!notifyForm.message_en && !notifyForm.message_bn) {
      showToast("At least one message required", "error");
      return;
    }
    const ok = await apiPost(
      `/admin/users/${detailUser.id}/notify`,
      notifyForm,
      "Notification sent"
    );
    if (ok) {
      setNotifyModal(false);
      setNotifyForm({ message_en: "", message_bn: "", source: "Admin" });
      setDetailData(prev => ({ ...prev, notifications: undefined }));
      if (detailTab === "notifications") {
        fetchDetail(detailUser.id, "notifications");
      }
    }
  };

  const openEdit = () => {
    setEditForm({
      full_name: detailUser.full_name,
      mobile: detailUser.mobile,
      email: detailUser.email,
      id_verified: detailUser.id_verified,
      is_active: detailUser.is_active,
      is_matrix_blocked: detailUser.is_matrix_blocked,
    });
    setEditModal(true);
  };

  const activeBtnClass = detailUser?.is_active
    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20";

  const blockBtnClass = detailUser?.is_matrix_blocked
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
    : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UsersIcon size={24} className="text-sky-400" />
            Users
          </h1>
          <p className="text-sm text-slate-400 font-medium">{totalUsers} active users in system</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full sm:w-80 pl-12 pr-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all group-hover:bg-white/[0.05]"
          />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
            <TabTable
              cols={["ID", "Name", "Mobile", "Balance", "Matrix", "Status", "Joined", "Actions"]}
              rows={users}
              render={(r) => [
                <span className="font-mono text-[10px] text-slate-500">#{r.id}</span>,
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                    {r.profile_picture ? (
                      <img src={r.profile_picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sky-400 font-black text-sm">
                        {(r.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm tracking-tight">{r.full_name}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{r.email}</span>
                  </div>
                </div>,
                <span className="font-bold text-slate-400">{r.mobile}</span>,
                <span className="font-bold text-emerald-400 tracking-tight">৳{fmt(r.balance)}</span>,
                <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] font-bold text-slate-500 leading-none">Steps</div>
                    <div className="text-sm font-bold text-sky-400">{r.matrix_payout_count || 0}/{MATRIX_AMOUNTS.length}</div>
                </div>,
                <div className="flex gap-2">
                  <Badge color={kycColor(r.id_verified || r.user?.id_verified)}>{r.id_verified || r.user?.id_verified || "pending"}</Badge>
                  {r.is_matrix_blocked && <Badge color="red">Blocked</Badge>}
                </div>,
                <span className="text-[10px] font-bold text-slate-500">{fmtDate(r.created_at)}</span>,
                <div className="flex gap-2">
                  <button onClick={() => openDetail(r)} className="px-4 py-2 rounded-xl bg-sky-500 text-white text-[10px] font-bold hover:bg-sky-400 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all">
                    Details
                  </button>
                </div>,
              ]}
            />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Page {page} <span className="text-slate-500 mx-1">/</span> {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        title={detailUser?.full_name || "User Details"}
        wide
      >
        {detailUser && (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5">
              {["overview", "income", "payments", "withdraws", "businesses", "products", "notifications", "referrals"].map(tab => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold capitalize transition-all ${
                    detailTab === tab
                      ? "bg-white text-black shadow-xl scale-100"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[40vh]">
              {detailLoading ? <Spinner /> : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {detailTab === "overview" && <OverviewTab user={detailUser} onToast={showToast} />}
                  {detailTab === "income" && <IncomeTab data={detailData.income || []} />}
                  {detailTab === "payments" && <PaymentsTab data={detailData.payments || []} onToast={showToast} />}
                  {detailTab === "withdraws" && <WithdrawsTab data={detailData.withdraws || []} onToast={showToast} />}
                  {detailTab === "businesses" && <BusinessesTab data={detailData.businesses || []} />}
                  {detailTab === "products" && <ProductsTab data={detailData.products || []} />}
                  {detailTab === "notifications" && <NotificationsTab data={detailData.notifications || []} />}
                  {detailTab === "referrals" && <ReferralsTab data={detailData.referrals || []} />}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-8 border-t border-white/5">
              <button onClick={openEdit} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                <Edit2 size={14} /> Edit Profile
              </button>
              <button onClick={() => setBalanceModal(true)} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                <Wallet size={14} /> Adjust Balance
              </button>
              <button onClick={() => setVoucherModal(true)} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-2">
                <Coins size={14} /> Adjust Voucher
              </button>
              <button onClick={() => setPasswordModal(true)} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2">
                <Shield size={14} /> Reset Password
              </button>
              <button onClick={() => setNotifyModal(true)} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all flex items-center gap-2">
                <Bell size={14} /> Send Alert
              </button>
              <button onClick={handleToggleActive} className={`px-5 py-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2 ${activeBtnClass}`}>
                <Activity size={14} /> {detailUser.is_active ? "Suspend Account" : "Activate Account"}
              </button>
              <button onClick={() => handleBlockMatrix(!detailUser.is_matrix_blocked)} className={`px-5 py-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2 ${blockBtnClass}`}>
                <Activity size={14} /> {detailUser.is_matrix_blocked ? "Resume Matrix" : "Restrict Matrix"}
              </button>
              <button onClick={handleDelete} className="px-5 py-3 rounded-xl text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2">
                <Trash2 size={14} /> Delete Entity
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Input Modals (Simplified Design) */}
      <AnimatePresence>
        {editModal && (
          <Modal open={editModal} onClose={() => setEditModal(false)} title="Modify Identity">
            <div className="space-y-5">
              {[
                ["Full Name", "full_name", "text"],
                ["Mobile", "mobile", "text"],
                ["Email Address", "email", "email"],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[field] || ""}
                    onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-white text-sm transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">KYC Status</label>
                <select
                  value={editForm.id_verified || ""}
                  onChange={e => setEditForm(f => ({ ...f, id_verified: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#121212] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-white text-sm"
                >
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified Authorized</option>
                  <option value="rejected">Rejected / Denied</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={handleEditSave} className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-400 transition-all active:scale-[0.98]">Save Modifications</button>
              </div>
            </div>
          </Modal>
        )}

        {balanceModal && (
          <Modal open={balanceModal} onClose={() => setBalanceModal(false)} title="Calibrate Balance">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Action Type</label>
                <select
                  value={balanceForm.type}
                  onChange={e => setBalanceForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#121212] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm"
                >
                  <option value="add">Add Credit (+)</option>
                  <option value="deduct">Deduct Credit (-)</option>
                  <option value="set">Overwrite Balance (=)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Injection Value (BDT)</label>
                <input
                  type="number"
                  value={balanceForm.amount}
                  onChange={e => setBalanceForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Protocol Note</label>
                <input
                  type="text"
                  value={balanceForm.note}
                  onChange={e => setBalanceForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white"
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="pt-4">
                <button onClick={handleBalanceAdjust} className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-[0.98]">Confirm Adjustment</button>
              </div>
            </div>
          </Modal>
        )}

        {notifyModal && (
          <Modal open={notifyModal} onClose={() => setNotifyModal(false)} title="Broadcast Alert">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Message (EN)</label>
                <textarea
                  value={notifyForm.message_en}
                  onChange={e => setNotifyForm(f => ({ ...f, message_en: e.target.value }))}
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white h-24 resize-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="Primary alert content..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Message (BN)</label>
                <textarea
                  value={notifyForm.message_bn}
                  onChange={e => setNotifyForm(f => ({ ...f, message_bn: e.target.value }))}
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white h-24 resize-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="লোকাল এলার্ট টেক্সট..."
                />
              </div>
              <div className="pt-4">
                <button onClick={handleNotify} className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-400 transition-all active:scale-[0.98]">Broadcast to Entity</button>
              </div>
            </div>
          </Modal>
        )}

        {passwordModal && (
          <Modal open={passwordModal} onClose={() => setPasswordModal(false)} title="Override Access Code">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white text-sm tracking-widest"
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-4">
                <button onClick={handleResetPassword} className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-[0.98]">Confirm Override</button>
              </div>
            </div>
          </Modal>
        )}

        {voucherModal && (
          <Modal open={voucherModal} onClose={() => setVoucherModal(false)} title="Adjust Voucher">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Action Type</label>
                <select
                  value={voucherForm.type}
                  onChange={e => setVoucherForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#121212] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white text-sm"
                >
                  <option value="add">Add Voucher (+)</option>
                  <option value="deduct">Deduct Voucher (-)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block ml-1">Voucher Amount (BDT)</label>
                <input
                  type="number"
                  value={voucherForm.amount}
                  onChange={e => setVoucherForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white text-sm font-bold"
                />
              </div>
              <div className="pt-4">
                <button onClick={handleVoucherAdjust} className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-[0.98]">Confirm Voucher Adjustment</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <Confirm
        open={confirmOpen}
        msg={confirmMsg}
        onYes={() => { confirmAction?.(); setConfirmOpen(false); }}
        onNo={() => setConfirmOpen(false)}
        danger={confirmDanger}
      />

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
      </AnimatePresence>
    </div>
  );
}
