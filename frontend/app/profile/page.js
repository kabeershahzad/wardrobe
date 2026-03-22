'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, loading } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: '', phone: '', address: { street: '', city: '', country: '', postalCode: '' } });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) setProfile({ name: user.name || '', phone: user.phone || '', address: user.address || { street: '', city: '', country: '', postalCode: '' } });
  }, [user, loading]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  if (loading || !user) return null;

  const tabs = ['profile', 'security'];

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-obsidian-950 text-3xl font-bold font-display shadow-gold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">{user.name}</h1>
              <p className="text-[var(--text-secondary)]">{user.email}</p>
              <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                user.role === 'admin' ? 'bg-gold-500/20 text-gold-500' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}>{user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-8 border border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-gold-500 text-obsidian-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Full Name</label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                      <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="input-luxury w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Phone</label>
                    <div className="relative">
                      <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+92 300 0000000" className="input-luxury w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                  <HiOutlineLocationMarker className="text-gold-500" /> Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'street', label: 'Street Address', placeholder: '123 Main Street' },
                    { key: 'city', label: 'City', placeholder: 'Karachi' },
                    { key: 'country', label: 'Country', placeholder: 'Pakistan' },
                    { key: 'postalCode', label: 'Postal Code', placeholder: '75500' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">{label}</label>
                      <input type="text" value={profile.address?.[key] || ''}
                        onChange={e => setProfile(p => ({ ...p, address: { ...p.address, [key]: e.target.value } }))}
                        placeholder={placeholder} className="input-luxury w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl btn-gold font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : <><HiOutlineSparkles size={18} /> Save Changes</>}
              </button>
            </form>
          </motion.div>
        )}

        {tab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleChangePassword}>
              <div className="p-6 rounded-2xl border border-[var(--border)] max-w-md" style={{ background: 'var(--card-bg)' }}>
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                  <HiOutlineLockClosed className="text-gold-500" /> Change Password
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password' },
                    { key: 'newPassword', label: 'New Password' },
                    { key: 'confirm', label: 'Confirm New Password' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">{label}</label>
                      <input type="password" value={passwords[key]}
                        onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                        className="input-luxury w-full px-4 py-3 rounded-xl text-sm" required />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={saving}
                  className="mt-5 flex items-center gap-2 px-8 py-3.5 rounded-xl btn-gold font-semibold disabled:opacity-60">
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}
