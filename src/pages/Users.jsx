import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API = "https://api.easysarvice.com/api";

// ─── tiny helpers ────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-BD");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("en-GB") : "—";

function Badge({ children, color = "gray" }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red:   "bg-red-50 text-red-600 border-red-200",
    yellow:"bg-amber-50 text-amber-700 border-amber-200",
    gray:  "bg-slate-100 text-slate-600 border-slate-200",
    blue:  "bg-blue-50 text-blue-700 border-blue-200",
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

// ─── Modal wrapper ────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
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

// ─── Small confirm dialog ─────────────────────────────────────────
function Confirm({ open, msg, onYes, onNo }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-slate-700 mb-5 text-center">{msg}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onNo}  className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={onYes} className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  USER DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
const TABS = ["Overview","Income","Payments","Withdraws","Businesses","Products","Notifications","Referrals"];

function UserDetailModal({ userId, token, onClose, onUserUpdated }) {
  const [user, setUser]       = useState(null);
  const [tab, setTab]         = useState("Overview");
  const [tabData, setTabData] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTab, setLoadingTab]   = useState(false);

  // sub-modals
  const [editOpen, setEditOpen]     = useState(false);
  const [balOpen, setBalOpen]       = useState(false);
  const [voucOpen, setVoucOpen]     = useState(false);
  const [pwdOpen, setPwdOpen]       = useState(false);
  const [confirm, setConfirm]       = useState(null); // {msg, action}

  const authH = { Authorization: `Bearer ${token}` };

  // fetch user detail
  const loadUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const r = await fetch(`${API}/admin/users/${userId}`, { headers: authH });
      const d = await r.json();
      if (d.status === "success") setUser(d.data);
    } finally { setLoadingUser(false); }
  }, [userId]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // fetch tab data
  useEffect(() => {
    if (!user || tab === "Overview") return;
    if (tabData[tab]) return; // cached

    const endpointMap = {
      Income:        `income`,
      Payments:      `payments`,
      Withdraws:     `withdraws`,
      Businesses:    `businesses`,
      Products:      `products`,
      Notifications: `notifications`,
      Referrals:     `referrals`,
    };
    const ep = endpointMap[tab];
    if (!ep) return;

    setLoadingTab(true);
    fetch(`${API}/admin/users/${userId}/${ep}`, { headers: authH })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") setTabData(prev => ({ ...prev, [tab]: d.data || [] }));
      })
      .finally(() => setLoadingTab(false));
  }, [tab, user]);

  // Toggle block
  const handleToggleBlock = () => {
    const action = user.is_matrix_blocked ? "unblock" : "block";
    setConfirm({
      msg: `Are you sure you want to ${action} this user?`,
      action: async () => {
        await fetch(`${API}/admin/users/block`, {
          method: "POST", headers: { ...authH, "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action }),
        });
        await loadUser();
        onUserUpdated?.();
      }
    });
  };

  // Toggle active
  const handleToggleActive = () => {
    setConfirm({
      msg: `${user.is_active ? "Deactivate" : "Activate"} this user?`,
      action: async () => {
        await fetch(`${API}/admin/users/${userId}/toggle-active`, {
          method: "POST", headers: authH,
        });
        await loadUser();
        onUserUpdated?.();
      }
    });
  };

  if (loadingUser) return (
    <Modal open onClose={onClose} title="User Details" wide><Spinner /></Modal>
  );
  if (!user) return null;

  return (
    <>
      <Modal open onClose={onClose} title={`User: ${user.full_name}`} wide>
        {/* ── Top action bar ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200">
            ✏️ Edit Info
          </button>
          <button onClick={() => setBalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
            💰 Balance
          </button>
          <button onClick={() => setVoucOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            🎟️ Voucher
          </button>
          <button onClick={() => setPwdOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200">
            🔑 Password
          </button>
          <button onClick={handleToggleActive}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${user.is_active
              ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"}`}>
            {user.is_active ? "⛔ Deactivate" : "✅ Activate"}
          </button>
          <button onClick={handleToggleBlock}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${user.is_matrix_blocked
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}>
            {user.is_matrix_blocked ? "🔓 Unblock" : "🔒 Block"}
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 flex-wrap mb-5 border-b border-slate-100 pb-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors ${
                tab === t ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}>{t}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {tab === "Overview" && <OverviewTab user={user} />}
        {loadingTab && tab !== "Overview" && <Spinner />}
        {!loadingTab && tab === "Income"        && <IncomeTab data={tabData.Income || []} />}
        {!loadingTab && tab === "Payments"      && <PaymentsTab data={tabData.Payments || []} />}
        {!loadingTab && tab === "Withdraws"     && <WithdrawsTab data={tabData.Withdraws || []} />}
        {!loadingTab && tab === "Businesses"    && <BusinessesTab data={tabData.Businesses || []} />}
        {!loadingTab && tab === "Products"      && <ProductsTab data={tabData.Products || []} />}
        {!loadingTab && tab === "Notifications" && <NotificationsTab data={tabData.Notifications || []} />}
        {!loadingTab && tab === "Referrals"     && <ReferralsTab data={tabData.Referrals || []} />}
      </Modal>

      {/* Sub-modals */}
      <EditUserModal    open={editOpen} onClose={() => setEditOpen(false)} user={user} token={token} onDone={() => { loadUser(); onUserUpdated?.(); }} />
      <AdjustModal      open={balOpen}  onClose={() => setBalOpen(false)}  userId={userId} token={token} type="balance"  onDone={loadUser} />
      <AdjustModal      open={voucOpen} onClose={() => setVoucOpen(false)} userId={userId} token={token} type="voucher"  onDone={loadUser} />
      <ResetPwdModal    open={pwdOpen}  onClose={() => setPwdOpen(false)}  userId={userId} token={token} />

      <Confirm
        open={!!confirm}
        msg={confirm?.msg}
        onYes={async () => { await confirm?.action(); setConfirm(null); }}
        onNo={() => setConfirm(null)}
      />
    </>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────
function OverviewTab({ user }) {
  const stats = user.stats || {};
  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Balance",     value: `৳${fmt(user.balance)}`,          color: "text-emerald-600" },
          { label: "Voucher",     value: `৳${fmt(user.voucher_balance)}`,   color: "text-amber-600" },
          { label: "Total Income",value: `৳${fmt(stats.totalIncome)}`,      color: "text-blue-600" },
          { label: "Deposited",   value: `৳${fmt(stats.totalDeposit)}`,     color: "text-indigo-600" },
          { label: "Withdrawn",   value: `৳${fmt(stats.totalWithdrawn)}`,   color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {[
          ["ID",              user.id],
          ["Full Name",       user.full_name],
          ["Mobile",          user.mobile],
          ["Email",           user.email],
          ["Referral Code",   user.referral_code],
          ["Referred By",     user.referred_by || "—"],
          ["Verified",        <Badge color={user.id_verified === "verified" ? "green" : "yellow"}>{user.id_verified}</Badge>],
          ["Active",          <Badge color={user.is_active ? "green" : "red"}>{user.is_active ? "Yes" : "No"}</Badge>],
          ["Matrix Blocked",  <Badge color={user.is_matrix_blocked ? "red" : "green"}>{user.is_matrix_blocked ? "Blocked" : "No"}</Badge>],
          ["Matrix Payouts",  user.matrix_payout_count],
          ["Products",        stats.totalProducts],
          ["Businesses",      stats.totalBusinesses],
          ["Joined",          fmtDT(user.created_at)],
          ["Last Matrix Pay", fmtDT(user.last_matrix_payout_at)],
        ].map(([label, val]) => (
          <div key={label} className="flex items-start gap-2 py-1.5 border-b border-slate-50">
            <span className="text-slate-500 w-36 shrink-0">{label}</span>
            <span className="font-medium text-slate-800">{val}</span>
          </div>
        ))}
      </div>

      {/* Referrer */}
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

// ── Income Tab ───────────────────────────────────────────────────
function IncomeTab({ data }) {
  return (
    <TabTable
      cols={["#","Type","Amount","Description","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
        <Badge color={r.type === "referral" ? "blue" : r.type === "matrix" ? "green" : r.type === "withdraw" ? "red" : "gray"}>{r.type}</Badge>,
        <span className={parseFloat(r.amount) < 0 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>৳{fmt(r.amount)}</span>,
        <span className="text-xs text-slate-500">{r.description}</span>,
        fmtDT(r.created_at),
      ]}
    />
  );
}

// ── Payments Tab ─────────────────────────────────────────────────
function PaymentsTab({ data }) {
  return (
    <TabTable
      cols={["#","Method","Amount","Trx ID","Purpose","Status","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
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

// ── Withdraws Tab ────────────────────────────────────────────────
function WithdrawsTab({ data }) {
  return (
    <TabTable
      cols={["#","Method","Account","Holder","Amount","Status","Remarks","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
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

// ── Businesses Tab ───────────────────────────────────────────────
function BusinessesTab({ data }) {
  return (
    <TabTable
      cols={["#","Business","Category","Type","Status","Fee","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
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

// ── Products Tab ─────────────────────────────────────────────────
function ProductsTab({ data }) {
  return (
    <TabTable
      cols={["#","Image","Name","Price","Stock","Status","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
        r.image ? <img src={r.image} alt="" className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-slate-100 rounded-lg"/>,
        <span className="font-medium">{r.product_name}</span>,
        `৳${fmt(r.price)}`,
        r.stock,
        <Badge color={r.status === "active" ? "green" : r.status === "rejected" ? "red" : "yellow"}>{r.status}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

// ── Notifications Tab ────────────────────────────────────────────
function NotificationsTab({ data }) {
  return (
    <TabTable
      cols={["#","Message","Amount","Read","Date"]}
      rows={data}
      render={(r, i) => [
        i+1,
        <span className="text-xs">{r.message_bn || r.message_en}</span>,
        <span className={parseFloat(r.amount_added) < 0 ? "text-red-600" : "text-emerald-600"}>৳{fmt(r.amount_added)}</span>,
        <Badge color={r.is_read ? "green" : "yellow"}>{r.is_read ? "Read" : "Unread"}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

// ── Referrals Tab ────────────────────────────────────────────────
function ReferralsTab({ data }) {
  return (
    <TabTable
      cols={["#","Name","Mobile","Email","Verified","Balance","Active","Joined"]}
      rows={data}
      render={(r, i) => [
        i+1,
        r.full_name,
        r.mobile,
        <span className="text-xs">{r.email}</span>,
        <Badge color={r.id_verified === "verified" ? "green" : "yellow"}>{r.id_verified}</Badge>,
        `৳${fmt(r.balance)}`,
        <Badge color={r.is_active ? "green" : "red"}>{r.is_active ? "Yes" : "No"}</Badge>,
        fmtDate(r.created_at),
      ]}
    />
  );
}

// ── Generic tab table ────────────────────────────────────────────
function TabTable({ cols, rows, render }) {
  if (!rows.length)
    return <p className="text-center text-slate-400 py-10">No records found.</p>;
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
            {cols.map(c => <th key={c} className="px-3 py-2 text-left whitespace-nowrap font-semibold">{c}</th>)}
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
//  Edit User Modal
// ═══════════════════════════════════════════════════════════════════
function EditUserModal({ open, onClose, user, token, onDone }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (user) setForm({
      full_name:        user.full_name || "",
      mobile:           user.mobile || "",
      email:            user.email || "",
      id_verified:      user.id_verified || "unverified",
      is_active:        user.is_active,
      is_matrix_blocked:user.is_matrix_blocked,
      role:             user.role || "user",
    });
  }, [user]);

  const handle = async () => {
    setSaving(true); setMsg(null);
    try {
      const r = await fetch(`https://api.easysarvice.com/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      setMsg({ ok: d.status === "success", text: d.message });
      if (d.status === "success") { onDone?.(); setTimeout(onClose, 900); }
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit User Info">
      <div className="space-y-4">
        {[
          ["Full Name", "full_name", "text"],
          ["Mobile",    "mobile",    "text"],
          ["Email",     "email",     "email"],
        ].map(([label, key, type]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
            <input type={type} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">KYC Status</label>
            <select value={form.id_verified || ""} onChange={e => setForm(p => ({ ...p, id_verified: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select value={form.role || ""} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600" />
            <span>Active</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!form.is_matrix_blocked} onChange={e => setForm(p => ({ ...p, is_matrix_blocked: e.target.checked }))}
              className="w-4 h-4 accent-red-500" />
            <span>Matrix Blocked</span>
          </label>
        </div>
        {msg && <p className={`text-sm text-center ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>{msg.text}</p>}
        <button onClick={handle} disabled={saving}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Adjust Balance / Voucher Modal
// ═══════════════════════════════════════════════════════════════════
function AdjustModal({ open, onClose, userId, token, type, onDone }) {
  const [amount, setAmount] = useState("");
  const [adjType, setAdjType] = useState("add");
  const [note, setNote]   = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]     = useState(null);

  const ep = type === "balance" ? "adjust-balance" : "adjust-voucher";
  const label = type === "balance" ? "Balance" : "Voucher Balance";

  const handle = async () => {
    if (!amount) return;
    setSaving(true); setMsg(null);
    try {
      const body = { amount: parseFloat(amount), type: adjType };
      if (type === "balance") body.note = note;
      const r = await fetch(`https://api.easysarvice.com/api/admin/users/${userId}/${ep}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      setMsg({ ok: d.status === "success", text: d.message });
      if (d.status === "success") { onDone?.(); setAmount(""); setNote(""); setTimeout(onClose, 900); }
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Adjust ${label}`}>
      <div className="space-y-4">
        <div className="flex gap-3">
          {["add","deduct"].map(t => (
            <button key={t} onClick={() => setAdjType(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                adjType === t
                  ? t === "add" ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-500 text-white border-red-500"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {t === "add" ? "➕ Add" : "➖ Deduct"}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (BDT)</label>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        {type === "balance" && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Reason..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        )}
        {msg && <p className={`text-sm text-center ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>{msg.text}</p>}
        <button onClick={handle} disabled={saving || !amount}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
          {saving ? "Processing..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Reset Password Modal
// ═══════════════════════════════════════════════════════════════════
function ResetPwdModal({ open, onClose, userId, token }) {
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handle = async () => {
    if (pwd.length < 6) { setMsg({ ok: false, text: "Min 6 characters" }); return; }
    setSaving(true); setMsg(null);
    try {
      const r = await fetch(`https://api.easysarvice.com/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: pwd }),
      });
      const d = await r.json();
      setMsg({ ok: d.status === "success", text: d.message });
      if (d.status === "success") { setPwd(""); setTimeout(onClose, 900); }
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reset Password">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            placeholder="Min 6 characters"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        {msg && <p className={`text-sm text-center ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>{msg.text}</p>}
        <button onClick={handle} disabled={saving}
          className="w-full bg-rose-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-50 transition">
          {saving ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN Users PAGE
// ═══════════════════════════════════════════════════════════════════
export default function Users() {
  const { token } = useAuth();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // filters
  const [search, setSearch]               = useState("");
  const [filterActive, setFilterActive]   = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterBlocked, setFilterBlocked] = useState("");
  const [page, setPage]                   = useState(1);
  const [pagination, setPagination]       = useState(null);
  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (search)        params.set("search", search);
    if (filterActive !== "")   params.set("is_active", filterActive);
    if (filterVerified !== "") params.set("id_verified", filterVerified);
    if (filterBlocked !== "")  params.set("is_matrix_blocked", filterBlocked);

    try {
      const r = await fetch(`${API}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.status === "success") {
        setUsers(d.data);
        setPagination(d.pagination);
      } else throw new Error(d.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, search, filterActive, filterVerified, filterBlocked, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Search debounce
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-800">User Management</h2>
          {pagination && (
            <span className="text-sm text-slate-500">Total: <strong>{pagination.total}</strong> users</span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name, mobile, email, code…"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All Active</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select value={filterVerified} onChange={e => { setFilterVerified(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All KYC</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select value={filterBlocked} onChange={e => { setFilterBlocked(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All Block</option>
            <option value="true">Blocked</option>
            <option value="false">Not Blocked</option>
          </select>
          <button onClick={() => { setSearchInput(""); setFilterActive(""); setFilterVerified(""); setFilterBlocked(""); setPage(1); }}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? <Spinner /> : error ? (
          <p className="text-red-500 text-center py-10">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    {["ID","Name","Mobile","Email","KYC","Balance","V.Balance","Active","Blocked","Joined","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{u.id}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{u.full_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{u.mobile}</td>
                      <td className="px-4 py-3 max-w-[140px] truncate text-slate-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge color={u.id_verified === "verified" ? "green" : "yellow"}>
                          {u.id_verified === "verified" ? "✓" : "?"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold whitespace-nowrap">৳{fmt(u.balance)}</td>
                      <td className="px-4 py-3 text-amber-600 whitespace-nowrap">৳{fmt(u.voucher_balance)}</td>
                      <td className="px-4 py-3">
                        <Badge color={u.is_active ? "green" : "red"}>{u.is_active ? "Yes" : "No"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={u.is_matrix_blocked ? "red" : "gray"}>{u.is_matrix_blocked ? "Blocked" : "No"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedId(u.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-12 text-slate-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-1">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                          p === page ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}>{p}</button>
                    );
                  })}
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedId && (
        <UserDetailModal
          userId={selectedId}
          token={token}
          onClose={() => setSelectedId(null)}
          onUserUpdated={fetchUsers}
        />
      )}
    </div>
  );
}

