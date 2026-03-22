'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineChevronDown,
} from 'react-icons/hi';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?new=true', label: 'New Arrivals' },
  { href: '/shop?featured=true', label: 'Featured' },
  { href: '/tryon', label: 'Try-On Studio', highlight: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useStore();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isShopPath = pathname.startsWith('/shop');

  if (!mounted) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5">
        <motion.div
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-3 max-w-7xl"
        >
          <div
            className="flex h-16 items-center justify-between rounded-[18px] border px-3.5 sm:px-5"
            style={{
              borderColor: scrolled ? 'color-mix(in srgb, var(--gold) 28%, var(--border))' : 'var(--border)',
              background: 'var(--nav-bg)',
              backdropFilter: 'blur(10px)',
              boxShadow: scrolled ? '0 14px 28px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-semibold"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                WX
              </span>
              <div className="leading-none min-w-0">
                <p className="font-display text-[1.05rem] text-[var(--text-primary)] truncate">Wardrobe X</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] mt-0.5">AI FASHION</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--bg-secondary)' }}>
              {navLinks.map(({ href, label, highlight }) => {
                const active = href === '/tryon'
                  ? pathname.startsWith('/tryon')
                  : href.includes('/shop')
                    ? isShopPath
                    : pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      active
                        ? 'text-white'
                        : highlight
                          ? 'text-[var(--gold-dark)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { background: 'var(--gold)' } : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                style={{ background: 'var(--bg-secondary)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
              </button>

              <Link
                href="/wishlist"
                className="relative h-9 w-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <HiOutlineHeart size={18} />
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'var(--gold)' }}
                  >
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative h-9 w-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <HiOutlineShoppingBag size={18} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'var(--gold)' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--gold)' }}
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                    <span className="text-sm text-[var(--text-primary)] max-w-20 truncate">{user.name?.split(' ')[0]}</span>
                    <HiOutlineChevronDown
                      size={14}
                      className={`text-[var(--text-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl border overflow-hidden"
                        style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <HiOutlineUser size={16} /> My Profile
                          </Link>
                          <Link href="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <HiOutlineShoppingBag size={16} /> My Orders
                          </Link>
                          <Link href="/tryon" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <HiOutlineSparkles size={16} /> Try-On History
                          </Link>
                          {user.role === 'admin' && (
                            <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                              <HiOutlineCog size={16} /> Admin Panel
                            </Link>
                          )}
                          <button onClick={logout} className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10">
                            <HiOutlineLogout size={16} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-full btn-gold text-sm">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center text-[var(--text-secondary)]"
                style={{ background: 'var(--bg-secondary)' }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <HiOutlineX size={20} /> : <HiOutlineMenuAlt3 size={20} />}
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.35)' }}
          >
            <motion.div
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-4 mt-20 rounded-2xl border p-4"
              style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
            >
              <div className="space-y-2">
                {navLinks.map(({ href, label, highlight }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                      highlight ? 'text-[var(--gold-dark)]' : 'text-[var(--text-primary)]'
                    }`}
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                {user ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{user.email}</p>
                    <Link href="/profile" className="block py-1.5 text-sm text-[var(--text-secondary)]">Profile</Link>
                    <Link href="/orders" className="block py-1.5 text-sm text-[var(--text-secondary)]">Orders</Link>
                    {user.role === 'admin' && <Link href="/admin" className="block py-1.5 text-sm text-[var(--text-secondary)]">Admin Panel</Link>}
                    <button onClick={logout} className="mt-1 text-sm text-red-500">Sign Out</button>
                  </>
                ) : (
                  <Link href="/auth/login" className="inline-flex items-center px-4 py-2 rounded-lg btn-gold text-sm">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
