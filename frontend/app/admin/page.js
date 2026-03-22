'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import { Spinner } from '../../components/ui/Loaders';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import {
  HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyDollar,
  HiOutlineSparkles, HiOutlineCollection, HiOutlineChartBar,
  HiOutlineCog, HiOutlineClipboardList
} from 'react-icons/hi';

const STATUS_COLORS = {
  placed: 'bg-blue-500/15 text-blue-400',
  confirmed: 'bg-gold-500/15 text-gold-500',
  processing: 'bg-teal-500/15 text-teal-400',
  shipped: 'bg-indigo-500/15 text-indigo-400',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/auth/login');
      else if (user.role !== 'admin') router.push('/');
      else adminAPI.getDashboard().then(({ data }) => setData(data)).finally(() => setFetching(false));
    }
  }, [user, loading]);

  if (loading || fetching) return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
    </main>
  );

  const statCards = [
    { label: 'Total Customers', value: data?.stats?.totalUsers?.toLocaleString(), icon: HiOutlineUsers, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
    { label: 'Active Products', value: data?.stats?.totalProducts?.toLocaleString(), icon: HiOutlineCollection, color: 'from-teal-500/20 to-teal-600/10', iconColor: 'text-teal-400' },
    { label: 'Total Orders', value: data?.stats?.totalOrders?.toLocaleString(), icon: HiOutlineShoppingBag, color: 'from-gold-500/20 to-gold-600/10', iconColor: 'text-gold-500' },
    { label: 'AI Try-Ons', value: data?.stats?.totalTryOns?.toLocaleString(), icon: HiOutlineSparkles, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
    { label: 'Total Revenue', value: `PKR ${data?.stats?.totalRevenue?.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: 'from-rose-500/20 to-rose-600/10', iconColor: 'text-rose-400' },
  ];

  const navLinks = [
    { href: '/admin/products', icon: HiOutlineCollection, label: 'Manage Products' },
    { href: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users' },
    { href: '/admin/orders', icon: HiOutlineClipboardList, label: 'Manage Orders' },
  ];

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Admin Panel</span>
          <h1 className="font-display text-5xl font-bold text-[var(--text-primary)] mt-1">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-2">Welcome back, {user?.name?.split(' ')[0]}</p>
        </motion.div>

        {/* Quick Nav */}
        <div className="flex flex-wrap gap-3 mb-10">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold-500/20 hover:border-gold-500/50 bg-gold-500/5 hover:bg-gold-500/10 text-sm font-semibold text-gold-500 transition-all">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border border-[var(--border)]`}>
                <Icon size={24} className={`${stat.iconColor} mb-3`} />
                <p className="font-display text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="font-mono text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-gold-500 hover:text-gold-400 font-semibold">View All →</Link>
            </div>
            <div className="space-y-3">
              {data?.recentOrders?.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm">No orders yet</p>
              ) : data?.recentOrders?.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">{order.orderNumber}</p>
                    <p className="text-xs text-[var(--text-muted)]">{order.user?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">PKR {order.total?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">New Customers</h2>
              <Link href="/admin/users" className="text-xs text-gold-500 hover:text-gold-400 font-semibold">View All →</Link>
            </div>
            <div className="space-y-3">
              {data?.recentUsers?.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm">No users yet</p>
              ) : data?.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-obsidian-950 font-bold text-sm shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Stats */}
          {data?.categoryStats?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-5">Products by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {data.categoryStats.map(({ _id, count }) => (
                  <div key={_id} className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/10 text-center">
                    <p className="font-display text-2xl font-bold text-gold-500">{count}</p>
                    <p className="font-mono text-xs text-[var(--text-muted)] capitalize mt-1">{_id}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
