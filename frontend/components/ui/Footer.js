'use client';
import Link from 'next/link';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FaInstagram, FaTwitter, FaTiktok, FaPinterest } from 'react-icons/fa';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Featured', href: '/shop?featured=true' },
    { label: 'New Arrivals', href: '/shop?new=true' },
    { label: 'Try-On Studio', href: '/tryon' },
  ],
  Account: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Orders', href: '/orders' },
  ],
  Company: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Profile', href: '/profile' },
    { label: 'Cart', href: '/cart' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-9">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <h3 className="font-display text-3xl text-[var(--text-primary)]">Wardrobe X</h3>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Virtual try-on that helps you choose better, faster. Discover looks with confidence before you buy.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[FaInstagram, FaTwitter, FaTiktok, FaPinterest].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs text-[var(--text-muted)]">
            {new Date().getFullYear()} Wardrobe X. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <HiOutlineSparkles size={12} className="text-[var(--gold-dark)]" />
            AI-powered virtual styling
          </p>
        </div>
      </div>
    </footer>
  );
}

