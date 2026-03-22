'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../../components/ui/Navbar';
import { Spinner } from '../../../components/ui/Loaders';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineBan } from 'react-icons/hi';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') router.push('/');
      else fetchUsers();
    }
  }, [user, loading, search]);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const { data } = await adminAPI.getUsers({ search, limit: 20 });
      setUsers(data.users);
      setTotal(data.total);
    } finally { setFetching(false); }
  };

  const handleToggle = async (userId) => {
    try {
      const { data } = await adminAPI.toggleUser(userId);
      toast.success(data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('Failed'); }
  };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Admin</span>
            <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">Users ({total})</h1>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input-luxury w-full pl-11 pr-4 py-3 rounded-xl text-sm" />
        </div>

        {fetching ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-obsidian-950 text-xs font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${u.role === 'admin' ? 'bg-gold-500/15 text-gold-500' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleToggle(u._id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            u.isActive ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                          }`}>
                          {u.isActive ? <HiOutlineBan size={16} /> : <HiOutlineShieldCheck size={16} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
