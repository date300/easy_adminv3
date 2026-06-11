import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API = "https://api.easysarvice.com/api";

// ─── helpers ─────────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-BD");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("en-GB") : "—";

function Badge({ children, color = "gray" }) {
  const map = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    red:    "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    gray:   "bg-slate-100 text-slate-600 border-slate-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${map[color]}`}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-8 pb-4 px-2 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-4xl" : "max-w-md"} relative`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────
function Confirm({ open, msg, onYes, onNo, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-slate-700 mb-5 text-center">{msg}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onNo}
            className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onYes}
            className={`px-5 py-2 rounded-lg text-white text-sm ${danger ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-indigo-500";
  return (
    <div className={`fixed top-4 right-4 z-[70] ${colors} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium`}>
      {msg}
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
}

// ─── Generic tab table ────────────────────────────────────────────
function TabTable({ cols, rows, render }) {
  if (!rows.length)
    return <p className="text-center text-slate-400 py-10">No records found.</p>;
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
            {cols.map(c => (
              <th key={c} className="px-3 py-2 text-left whitespace-nowrap font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={r.id || i} className="hover:bg-slate-50">
              {render(r, i).map((cell, ci) => (
                <td key={ci} className="px-3 py-2 whitespace-nowrap">{cell}</td>
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
function OverviewTab({ user }) {
  const s = user.stats || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Balance",      value: `৳${fmt(user.balance)}`,       color: "text-emerald-600" },
          { label: "Voucher",      value: `৳${fmt(user.voucher_balance)}`, color: "text-amber-600" },
          { label: "Total Income", value: `৳${fmt(s.totalIncome)}`,       color: "text-blue-600" },
          { label: "Deposited",    value: `৳${fmt(s.totalDeposit)}`,      color: "text-indigo-600" },
          { label: "Withdrawn",    value: `৳${fmt(s.totalWithdrawn)}`,    color: "text-rose-600" },
        ].map(c => (
          <div key={c.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
        {[
          ["ID",              user.id],
          ["Full Name",       user.full_name],
          ["Mobile",          user.mobile],
          ["Email",           user.email],
          ["Referral Code",   user.referral_code],
          ["Referred By",     user.referred_by || "—"],
          ["KYC",             <Badge color={user.id_verified === "verified" ? "green" : "yellow"}>{user.id_verified || "pending"}</Badge>],
          ["Matrix Blocked",  <Badge color={user.is_matrix_blocked ? "red" : "green"}>{user.is_matrix_blocked ? "Blocked" : "No"}</Badge>],
          ["Matrix Payouts",  s.matrix_payout_count || user.matrix_payout_count || 0],
          ["Products",        s.totalProducts],
          ["Businesses",      s.totalBusinesses],
          ["Joined",          fmtDT(user.created_at)],
          ["Last Matrix Pay", fmtDT(user.last_matrix_payout_at)],
        ].map(([label, val]) => (
          <div key={label} className="flex items-start gap-2 py-1.5 border-b border-slate-50">
            <span className="text-slate-500 w-36 shrink-0">{label}</span>
            <span className="font-medium text-slate-800">{val}</span>
          </div>
        ))}
      </div>
      {user.referrer && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-500 mb-1 uppercase tracking-wider">Referred By</p>
          <p className="font-semibold text-slate-800">{user.referrer.full_name}</p>
          <p className="text-xs text-slate-500">{user.referrer.mobile} · {user.referrer.email}</p>
          <p className="text-xs text-slate-400 mt-0.5">Code: {user.referrer.referral_code}</p>
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
        <span className={parseFloat(r.amount) < 0 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>৳{fmt(r.amount)}</span>,
        <span className="text-xs text-slate-500 max-w-[200px] truncate block">{r.description}</span>,
        fmtDT(r.created_at),
      ]}
    />
  );
}

function PaymentsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Method", "Amount", "Trx ID", "Purpose", "Status", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.method,
        `৳${fmt(r.amount)}`,
        <span className="font-mono text-xs">{r.trx_id}</span>,
        r.purpose,
        <Badge color={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function WithdrawsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Method", "Account", "Holder", "Amount", "Status", "Remarks", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.method,
        r.account_no,
        r.account_holder,
        `৳${fmt(r.amount)}`,
        <Badge color={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>,
        <span className="text-xs text-slate-400">{r.remarks || "—"}</span>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function BusinessesTab({ data }) {
  return (
    <TabTable
      cols={["#", "Business", "Category", "Type", "Status", "Fee", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.business_name,
        r.category,
        r.business_type,
        <Badge color={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>,
        `৳${fmt(r.voucher_fee)}`,
        fmtDate(r.created_at),
      ]}
    />
  );
}

function ProductsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Image", "Name", "Price", "Stock", "Status", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.image
          ? <img src={r.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
          : <div className="w-10 h-10 bg-slate-100 rounded-lg" />,
        <span className="font-medium">{r.product_name || r.name}</span>,
        `৳${fmt(r.price)}`,
        r.stock,
        <Badge color={r.status === "active" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

// ─── Notifications Tab (NEW) ────────────────────────────────────
function NotificationsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Message (EN)", "Message (BN)", "Amount", "Source", "Read", "Date"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        <span className="text-xs text-slate-700 max-w-[200px] truncate block">{r.message_en || r.message || "—"}</span>,
        <span className="text-xs text-slate-700 max-w-[200px] truncate block">{r.message_bn || "—"}</span>,
        <span className={parseFloat(r.amount_added || 0) < 0 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
          ৳{fmt(r.amount_added)}
        </span>,
        <Badge color="indigo">{r.source || "System"}</Badge>,
        <Badge color={r.is_read ? "green" : "yellow"}>{r.is_read ? "Read" : "Unread"}</Badge>,
        fmtDT(r.created_at),
      ]}
    />
  );
}

// ─── Referrals Tab (NEW) ──────────────────────────────────────────
function ReferralsTab({ data }) {
  return (
    <TabTable
      cols={["#", "Name", "Mobile", "Email", "Code", "Balance", "Voucher", "Status", "Joined"]}
      rows={data}
      render={(r, i) => [
        i + 1,
        r.full_name,
        r.mobile,
        <span className="text-xs text-slate-500">{r.email}</span>,
        <span className="font-mono text-xs">{r.referral_code}</span>,
        `৳${fmt(r.balance)}`,
        `৳${fmt(r.voucher_balance)}`,
        <Badge color={r.is_active ? "green" : "red"}>{r.is_active ? "Active" : "Inactive"}</Badge>,
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

  const showToast = (msg, type = "success") => setToast({ msg, type });
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
  }, [page, search, token]);

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
    const ok = await apiPost(
      `/admin/users/${detailUser.id}/adjust-balance`,
      balanceForm,
      `Balance ${balanceForm.type === "add" ? "added" : "deducted"}`
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
      // invalidate notifications cache so next tab open refreshes
      setDetailData(prev => ({ ...prev, notifications: undefined }));
      // if currently on notifications tab, refresh immediately
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
    ? "bg-red-50 text-red-700 hover:bg-red-100"
    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

  const blockBtnClass = detailUser?.is_matrix_blocked
    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    : "bg-rose-50 text-rose-700 hover:bg-rose-100";

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500">{totalUsers} total users</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <TabTable
              cols={["ID", "Name", "Mobile", "Email", "Balance", "Status", "Joined", "Actions"]}
              rows={users}
              render={(r) => [
                r.id,
                <div className="flex items-center gap-2">
                  {r.profile_picture ? (
                    <img src={r.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                      {(r.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{r.full_name}</span>
                </div>,
                r.mobile,
                <span className="text-xs text-slate-500">{r.email}</span>,
                `৳${fmt(r.balance)}`,
                <div className="flex gap-1">
                  <Badge color={r.is_active ? "green" : "red"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                  {r.is_matrix_blocked && <Badge color="red">Blocked</Badge>}
                </div>,
                fmtDate(r.created_at),
                <div className="flex gap-1">
                  <button onClick={() => openDetail(r)} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100">
                    View
                  </button>
                </div>,
              ]}
            />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
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
        title={detailUser?.full_name}
        wide
      >
        {detailUser && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
              {["overview", "income", "payments", "withdraws", "businesses", "products", "notifications", "referrals"].map(tab => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    detailTab === tab
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailLoading ? <Spinner /> : (
              <>
                {detailTab === "overview" && <OverviewTab user={detailUser} />}
                {detailTab === "income" && <IncomeTab data={detailData.income || []} />}
                {detailTab === "payments" && <PaymentsTab data={detailData.payments || []} />}
                {detailTab === "withdraws" && <WithdrawsTab data={detailData.withdraws || []} />}
                {detailTab === "businesses" && <BusinessesTab data={detailData.businesses || []} />}
                {detailTab === "products" && <ProductsTab data={detailData.products || []} />}
                {detailTab === "notifications" && <NotificationsTab data={detailData.notifications || []} />}
                {detailTab === "referrals" && <ReferralsTab data={detailData.referrals || []} />}
              </>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button onClick={openEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">
                Edit Info
              </button>
              <button onClick={() => setBalanceModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                Adjust Balance
              </button>
              <button onClick={() => setVoucherModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100">
                Adjust Voucher
              </button>
              <button onClick={() => setPasswordModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                Reset Password
              </button>
              <button onClick={() => setNotifyModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                Send Notify
              </button>
              <button onClick={handleToggleActive} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeBtnClass}`}>
                {detailUser.is_active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleBlockMatrix(!detailUser.is_matrix_blocked)} className={`px-4 py-2 rounded-lg text-sm font-medium ${blockBtnClass}`}>
                {detailUser.is_matrix_blocked ? "Unblock Matrix" : "Block Matrix"}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">
                Delete User
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit User">
        <div className="space-y-3">
          {[
            ["Full Name", "full_name", "text"],
            ["Mobile", "mobile", "text"],
            ["Email", "email", "email"],
          ].map(([label, field, type]) => (
            <div key={field}>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
              <input
                type={type}
                value={editForm[field] || ""}
                onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">KYC Status</label>
            <select
              value={editForm.id_verified || ""}
              onChange={e => setEditForm(f => ({ ...f, id_verified: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!editForm.is_active}
                onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!editForm.is_matrix_blocked}
                onChange={e => setEditForm(f => ({ ...f, is_matrix_blocked: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Matrix Blocked
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={handleEditSave} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600">Save</button>
          </div>
        </div>
      </Modal>

      {/* Balance Modal */}
      <Modal open={balanceModal} onClose={() => setBalanceModal(false)} title="Adjust Balance">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
            <select
              value={balanceForm.type}
              onChange={e => setBalanceForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="add">Add</option>
              <option value="deduct">Deduct</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
            <input
              type="number"
              value={balanceForm.amount}
              onChange={e => setBalanceForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Note</label>
            <input
              type="text"
              value={balanceForm.note}
              onChange={e => setBalanceForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              placeholder="Optional note"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setBalanceModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={handleBalanceAdjust} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Voucher Modal */}
      <Modal open={voucherModal} onClose={() => setVoucherModal(false)} title="Adjust Voucher">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
            <select
              value={voucherForm.type}
              onChange={e => setVoucherForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="add">Add</option>
              <option value="deduct">Deduct</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
            <input
              type="number"
              value={voucherForm.amount}
              onChange={e => setVoucherForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setVoucherModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={handleVoucherAdjust} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal open={passwordModal} onClose={() => setPasswordModal(false)} title="Reset Password">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              placeholder="Min 6 characters"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPasswordModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={handleResetPassword} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600">Reset</button>
          </div>
        </div>
      </Modal>

      {/* Notify Modal */}
      <Modal open={notifyModal} onClose={() => setNotifyModal(false)} title="Send Notification">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Message (English)</label>
            <textarea
              value={notifyForm.message_en}
              onChange={e => setNotifyForm(f => ({ ...f, message_en: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm h-20 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Message (Bengali)</label>
            <textarea
              value={notifyForm.message_bn}
              onChange={e => setNotifyForm(f => ({ ...f, message_bn: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm h-20 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Source</label>
            <input
              type="text"
              value={notifyForm.source}
              onChange={e => setNotifyForm(f => ({ ...f, source: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setNotifyModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={handleNotify} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">Send</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={confirmOpen}
        msg={confirmMsg}
        onYes={() => { confirmAction?.(); setConfirmOpen(false); }}
        onNo={() => setConfirmOpen(false)}
        danger={confirmDanger}
      />

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

