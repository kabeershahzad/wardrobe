'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { Spinner } from '../../components/ui/Loaders';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../lib/api';
import { HiOutlineShoppingBag, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const STATUS_COLORS = {
  placed: 'bg-blue-500/15 text-blue-400',
  confirmed: 'bg-gold-500/15 text-gold-500',
  processing: 'bg-teal-500/15 text-teal-400',
  shipped: 'bg-indigo-500/15 text-indigo-400',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      ordersAPI.getMy().then(({ data }) => setOrders(data.orders)).finally(() => setFetching(false));
    }
  }, [user, loading]);

  if (loading || fetching) return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">My Account</span>
          <h1 className="font-display text-5xl font-bold text-[var(--text-primary)] mt-1">My Orders</h1>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineShoppingBag size={32} className="text-gold-500/50" />
            </div>
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">No orders yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Your orders will appear here once you shop</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold font-semibold text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[var(--border)] overflow-hidden"
                style={{ background: 'var(--card-bg)' }}>
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">{order.orderNumber}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-bold text-[var(--text-primary)]">PKR {order.total?.toLocaleString()}</span>
                    {expanded === order._id ? <HiOutlineChevronUp size={20} className="text-[var(--text-muted)]" /> : <HiOutlineChevronDown size={20} className="text-[var(--text-muted)]" />}
                  </div>
                </div>

                {expanded === order._id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-[var(--border)] p-5">
                    <div className="space-y-3 mb-4">
                      {order.items?.map((item, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-lg bg-[var(--bg-secondary)] overflow-hidden shrink-0">
                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{item.name}</p>
                            <p className="text-xs text-[var(--text-muted)] font-mono">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">PKR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-[var(--border)] grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] mb-1">Shipping To</p>
                        <p className="text-[var(--text-muted)]">{order.shippingAddress?.name}</p>
                        <p className="text-[var(--text-muted)]">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                        <p className="text-[var(--text-muted)]">{order.shippingAddress?.phone}</p>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="font-semibold text-[var(--text-primary)] mb-1">Payment</p>
                        <p className="text-[var(--text-muted)]">Method: {order.paymentMethod}</p>
                        <p className="text-[var(--text-muted)]">Status: <span className="text-gold-500 capitalize">{order.paymentStatus}</span></p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
