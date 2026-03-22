'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles, HiOutlineCheck } from 'react-icons/hi';

const strengthLevels = [
  { label: 'Weak', color: '#ef4444' },
  { label: 'Fair', color: '#f97316' },
  { label: 'Good', color: '#eab308' },
  { label: 'Strong', color: '#22c55e' },
];

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to Wardrobe X! ✨');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #d4af37, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-700/20 border border-gold-500/30 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-gold-500">W</span>
            </div>
            <span className="font-display text-2xl font-bold text-gold-shimmer">WARDROBE X</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mt-4 mb-1">Create Account</h1>
          <p className="text-[var(--text-secondary)] text-sm">Join thousands of fashion lovers</p>
        </div>

        <div className="p-8 rounded-3xl border border-gold-500/20 shadow-glass" style={{ background: 'var(--card-bg)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name" required className="input-luxury w-full pl-11 pr-4 py-3.5 rounded-xl text-sm" />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" required className="input-luxury w-full pl-11 pr-4 py-3.5 rounded-xl text-sm" />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" required className="input-luxury w-full pl-11 pr-12 py-3.5 rounded-xl text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthLevels[strength - 1]?.color : 'var(--border)' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthLevels[strength - 1]?.color || 'var(--text-muted)' }}>
                    {strengthLevels[strength - 1]?.label || 'Too short'}
                  </p>
                </div>
              )}
            </div>
            {/* Confirm */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input type="password" value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••" required className="input-luxury w-full pl-11 pr-12 py-3.5 rounded-xl text-sm" />
                {form.confirm && form.password === form.confirm && (
                  <HiOutlineCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl btn-gold font-semibold disabled:opacity-60 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" /> Creating account...</>
              ) : (
                <><HiOutlineSparkles size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
