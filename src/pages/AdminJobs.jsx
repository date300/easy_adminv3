import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Loader2, AlertTriangle, RefreshCw, Eye, CheckCircle, XCircle, Trash2, ExternalLink, User, Layers, Coins, Users as UsersIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://api.easysarvice.com/api/microjob";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  completed: "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
  closed: "bg-white/5 text-slate-400 border-white/10",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
};

function formatCurrency(value) {
  const n = Number(value || 0);
  return `৳${n.toLocaleString()}`;
}

function getField(job, primary, fallback) {
  return job?.[primary] ?? job?.[fallback] ?? null;
}

function getOwner(job) {
  return job?.owner || {};
}

function getPricing(job) {
  return job?.pricing || {};
}

export default function AdminJobs() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function fetchJobs() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/jobs?limit=50`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") throw new Error(data.message || "Failed to load jobs");
      setJobs(data.data || []);
    } catch (err) {
      setError(err.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAction(id, action) {
    if (!token) return;
    if (!window.confirm(`Are you sure to ${action} job #${id}?`)) return;
    setActionLoading(`${id}-${action}`);
    try {
      const res = await fetch(`${API_BASE}/admin/job/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") throw new Error(data.message || "Action failed");
      await fetchJobs();
      alert(data.message || "Done");
    } catch (err) {
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id) {
    if (!token) return;
    if (!window.confirm(`Permanently delete job #${id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/job/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") throw new Error(data.message || "Delete failed");
      fetchJobs();
      alert(data.message || "Deleted");
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  async function openJobDetails(id) {
    setDetailsLoading(true);
    setSelectedJob(null);
    try {
      const res = await fetch(`${API_BASE}/admin/job/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") throw new Error(data.message || "Failed to load job details");
      setSelectedJob(data.data || null);
    } catch (err) {
      alert(err.message || "Unable to load job details");
    } finally {
      setDetailsLoading(false);
    }
  }

  if (loading && jobs.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading jobs...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase size={24} className="text-emerald-400" />
            Job Management
        </h1>
          <p className="text-sm text-slate-400 font-medium">{jobs.length} jobs active</p>
        </div>
        <button
          onClick={fetchJobs}
          className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold backdrop-blur-md flex items-center gap-3">
            <AlertTriangle size={20} />
            {error}
        </div>
      )}

      <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold">
                <th className="px-6 py-5 whitespace-nowrap">ID</th>
                <th className="px-6 py-5 whitespace-nowrap">Job Title</th>
                <th className="px-6 py-5 whitespace-nowrap">Owner</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Progress</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((j) => (
                <tr key={j.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">#{j.id}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-black text-white text-sm tracking-tight">{j.title}</div>
                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                        {j.reward_per_worker ? `${formatCurrency(j.reward_per_worker)} / worker` : "Zero Reward"}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-white text-[11px] uppercase tracking-wide">{j.owner_name}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[j.status] || "bg-white/5 text-slate-400"}`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="font-black text-white text-sm tracking-tighter">{j.progress || "0/0"}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{j.completed_workers ?? 0} Completed</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                        {j.status === "pending" && (
                            <>
                                <button
                                    onClick={() => handleAction(j.id, "approve")}
                                    disabled={actionLoading === `${j.id}-approve`}
                                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    title="Approve"
                                >
                                    {actionLoading === `${j.id}-approve` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                </button>
                                <button
                                    onClick={() => handleAction(j.id, "reject")}
                                    disabled={actionLoading === `${j.id}-reject`}
                                    className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    title="Reject"
                                >
                                    {actionLoading === `${j.id}-reject` ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => openJobDetails(j.id)}
                            className="p-2 bg-white/5 text-slate-400 border border-white/10 rounded-xl hover:text-white hover:bg-white/10 transition-all"
                            title="Inspect"
                        >
                            {detailsLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => handleDelete(j.id)}
                            className="p-2 bg-white/5 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                            title="Terminate"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center opacity-40">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                            <span className="text-2xl">?</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No jobs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden relative flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Briefcase size={20} />
                </div>
                <div>
                    <span className="font-black text-white text-lg tracking-tight uppercase">Job Details</span>
                    <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">Job information</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto relative z-10 flex-1 custom-scrollbar space-y-10">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">{selectedJob.title}</h2>
                    <div className="flex items-center gap-3 mt-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${STATUS_STYLES[selectedJob.status] || ""}`}>
                            {selectedJob.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol ID: {selectedJob.id}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Owner", value: getField(selectedJob, "owner_name", "name") || getOwner(selectedJob).name || "—", icon: <User size={14} />, color: "text-white" },
                        { label: "Reward", value: formatCurrency(getField(selectedJob, "reward_per_worker", "reward_per_worker") ?? getPricing(selectedJob).reward_per_worker), icon: <Coins size={14} />, color: "text-emerald-400" },
                        { label: "Worker Limit", value: getField(selectedJob, "total_workers", "total_workers") ?? getPricing(selectedJob).total_workers ?? 0, icon: <UsersIcon size={14} />, color: "text-sky-400" },
                        { label: "Progress", value: selectedJob.progress || "0/0", icon: <Layers size={14} />, color: "text-amber-400" }
                    ].map((stat, i) => (
                        <div key={i} className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                {stat.icon} {stat.label}
                            </p>
                            <p className={`text-sm font-black tracking-tight truncate ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Description</p>
                    <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 leading-relaxed text-sm text-slate-400 font-medium italic">
                        "{selectedJob.description || "No description provided."}"
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-sky-500 pl-3">Job Link</p>
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/[0.05]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{selectedJob.job_link || "None"}</span>
                            {selectedJob.job_link && (
                                <a href={selectedJob.job_link} target="_blank" rel="noreferrer" className="p-2 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all">
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-amber-500 pl-3">Proof Type</p>
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white text-[11px] uppercase tracking-widest">
                            {selectedJob.proof_type || "None"}
                        </div>
                    </div>
                </div>

                {selectedJob.image_url && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">Job Image</p>
                        <div className="rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden relative group">
                            <img src={selectedJob.image_url} alt="" className="w-full max-h-[300px] object-contain group-hover:scale-[1.02] transition-transform duration-700" />
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Work Summary</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { l: "Total", v: selectedJob.submissions_summary?.total ?? 0, c: "text-white" },
                            { l: "Pending", v: selectedJob.submissions_summary?.pending ?? 0, c: "text-amber-400" },
                            { l: "Approved", v: selectedJob.submissions_summary?.approved ?? 0, c: "text-emerald-400" },
                            { l: "Rejected", v: selectedJob.submissions_summary?.rejected ?? 0, c: "text-red-400" }
                        ].map((node, i) => (
                            <div key={i} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
                                <p className={`text-xl font-black ${node.c}`}>{node.v}</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">{node.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-white/5 relative z-10 bg-white/[0.02]">
                <button
                    onClick={() => setSelectedJob(null)}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-[0.99] shadow-xl"
                >
                    Close
                </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
