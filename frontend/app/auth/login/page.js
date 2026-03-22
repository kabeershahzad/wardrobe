'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! ✨`);
      router.push(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #d4af37, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #d4af37, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-700/20 border border-gold-500/30 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-gold-500">W</span>
            </div>
            <span className="font-display text-2xl font-bold text-gold-shimmer">WARDROBE X</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mt-4 mb-1">Welcome Back</h1>
          <p className="text-[var(--text-secondary)] text-sm">Sign in to your account</p>
        </div>

        <div className="p-8 rounded-3xl border border-gold-500/20 shadow-glass"
          style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="input-luxury w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="input-luxury w-full pl-11 pr-12 py-3.5 rounded-xl text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {showPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl btn-gold font-semibold disabled:opacity-60"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><HiOutlineSparkles size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
