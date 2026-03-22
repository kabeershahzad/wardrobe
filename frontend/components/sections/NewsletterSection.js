'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineGift, HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    setTimeout(() => {
      toast.success('Subscribed successfully. Your welcome offer is unlocked.');
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <section id="newsletter" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-shell p-8 sm:p-10 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-kicker">Email Capture</p>
              <h2 className="section-title text-4xl sm:text-5xl text-[var(--text-primary)] mt-2">Get 10% Off Your First Order</h2>
              <p className="text-[var(--text-secondary)] max-w-xl mt-4">
                A conversion-focused Shopify pattern: offer value first, then bring shoppers back with weekly launches and curated edits.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  'Early access to weekly drops',
                  'Exclusive bundles and private offers',
                  'Personalized style picks in your inbox',
                ].map((benefit) => (
                  <p key={benefit} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <HiOutlineCheckCircle size={16} className="text-[var(--gold-dark)]" />
                    {benefit}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Welcome Offer</p>
              <p className="font-display text-3xl text-[var(--text-primary)] mt-2 inline-flex items-center gap-2">
                <HiOutlineGift size={26} className="text-[var(--gold-dark)]" />
                Save 10% today
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-luxury w-full pl-11 pr-4 py-3 rounded-lg text-sm"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full px-6 py-3 rounded-lg btn-gold text-sm disabled:opacity-70">
                  {loading ? 'Joining...' : 'Unlock My Discount'}
                </button>
              </form>

              <p className="text-xs text-[var(--text-muted)] mt-3">No spam. One click unsubscribe.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

