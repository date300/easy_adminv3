import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, FileText } from "lucide-react";

const API_BASE = "https://api.easysarvice.com/api";

function DetailModal({ token, productId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setErr("");
    fetch(`${API_BASE}/admin/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setDetail(d);
        else setErr(d.message || "Failed to load");
      })
      .catch(() => setErr("Network error"))
      .finally(() => setLoading(false));
  }, [token, productId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            <span className="font-bold text-slate-800">Product Detail</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : err ? (
            <div className="text-red-600">Error: {err}</div>
          ) : (
            <div className="space-y-4 text-sm text-slate-700">
              <h3 className="font-bold text-lg">{detail.product.product_name}</h3>
              <p className="text-slate-500">Vendor: {detail.product.vendor_name || detail.product.vendor_email || detail.product.vendor_mobile}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Price</p>
                  <p>৳{detail.product.price}</p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="capitalize">{detail.product.status}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <p className="text-slate-600">{detail.product.description || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/products/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setProducts(d.data || []);
        else throw new Error(d.message || "Failed to load");
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id, action) => {
    if (!token) return alert("No auth token");
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API_BASE}/admin/product/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setProducts((p) => p.filter((x) => x.id !== id));
      } else {
        alert(data.message || "Action failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  if (!token) return <div className="p-6 text-center text-slate-500">You must be logged in as admin.</div>;
  if (loading) return <div className="p-6 text-center text-slate-500">Loading products...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Pending Products</h2>
        <span className="text-sm text-slate-500">{products.length} pending</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 hidden sm:table-cell">Vendor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{p.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{p.product_name}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{p.vendor_name || p.vendor_email || p.vendor_mobile}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">Pending</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetailId(p.id)} className="px-2 py-1 rounded-md text-xs bg-slate-100 hover:bg-slate-200">View</button>
                    <button onClick={() => handleAction(p.id, 'approve')} disabled={actionLoading !== null} className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">{actionLoading === p.id + 'approve' ? '...' : 'Approve'}</button>
                    <button onClick={() => handleAction(p.id, 'reject')} disabled={actionLoading !== null} className="px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">{actionLoading === p.id + 'reject' ? '...' : 'Reject'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No pending products</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailId && <DetailModal token={token} productId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
