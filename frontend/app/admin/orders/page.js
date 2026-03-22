'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../../components/ui/Navbar';
import { Spinner } from '../../../components/ui/Loaders';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineChevronDown } from 'react-icons/hi';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'bg-blue-500/15 text-blue-400',
  confirmed: 'bg-gold-500/15 text-gold-500',
  processing: 'bg-teal-500/15 text-teal-400',
  shipped: 'bg-indigo-500/15 text-indigo-400',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') router.push('/');
      else fetchOrders();
    }
  }, [user, loading, filterStatus, page]);

  const fetchOrders = async () => {
    setFetching(true);
    try {
      const { data } = await adminAPI.getOrders({ status: filterStatus, page, limit: 15 });
      setOrders(data.orders);
      setTotal(data.total);
    } finally { setFetching(false); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Admin</span>
            <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">Orders ({total})</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', ...STATUS_OPTIONS].map(s => (
              <button key={s || 'all'} onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                  filterStatus === s ? 'bg-gold-500 text-obsidian-950' : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                }`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                    {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Update'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[var(--text-primary)] whitespace-nowrap">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-muted)]">{order.items?.length} item(s)</td>
                      <td className="px-5 py-3 font-mono font-semibold text-[var(--text-primary)] whitespace-nowrap">PKR {order.total?.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                        }`}>{order.paymentMethod} · {order.paymentStatus}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <select
                            value={order.orderStatus}
                            onChange={e => handleStatusUpdate(order._id, e.target.value)}
                            className="input-luxury pl-3 pr-8 py-1.5 rounded-lg text-xs appearance-none cursor-pointer"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                          <HiOutlineChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" size={12} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
