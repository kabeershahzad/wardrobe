'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag,
  HiOutlineHeart, HiOutlineUser, HiOutlineMenuAlt3,
  HiOutlineX, HiOutlineSparkles, HiOutlineLogout,
  HiOutlineCog, HiOutlineChevronDown,
} from 'react-icons/hi';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?new=true', label: 'New Arrivals' },
  { href: '/shop?featured=true', label: 'Featured' },
  { href: '/tryon', label: 'Try-On Studio', highlight: true },
];

/* ── Animated nav link with sliding gold underline ───────────────────────── */
function NavLink({ href, label, highlight, active }) {
  return (
    <Link
      href={href}
      className="relative group px-1 py-0.5 text-[13px] tracking-wide transition-colors duration-200"
      style={{
        color: active
          ? 'var(--gold)'
          : highlight
            ? 'var(--gold-dark)'
            : 'var(--text-secondary)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.06em',
      }}
    >
      {label}
      {/* Sliding underline */}
      <span
        className="absolute bottom-0 left-0 h-px transition-all duration-300 ease-out"
        style={{
          background: 'var(--gold)',
          width: active ? '100%' : '0%',
        }}
      />
      <span
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out"
        style={{ background: 'var(--gold)', opacity: active ? 0 : 1 }}
      />
    </Link>
  );
}

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [pathname]);

  const isShopPath = pathname.startsWith('/shop');
  const isTryOn = pathname.startsWith('/tryon');

  if (!mounted) return null;

  return (
    <>
      {/* ── Inject Google Font for logo ──────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        .wx-logo-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.14em;
        }
        .wx-logo-x {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-style: normal;
          letter-spacing: -0.02em;
        }
        .wx-nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold);
          transition: width 0.3s ease;
        }
        .wx-nav-link-underline:hover::after { width: 100%; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-7xl"
        >
          <div
            className="flex h-[60px] items-center justify-between rounded-2xl border px-5"
            style={{
              borderColor: scrolled
                ? 'color-mix(in srgb, var(--gold) 35%, transparent)'
                : 'var(--border)',
              background: scrolled
                ? 'color-mix(in srgb, var(--nav-bg) 96%, transparent)'
                : 'var(--nav-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: scrolled
                ? '0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px color-mix(in srgb, var(--gold) 20%, transparent)'
                : 'none',
              transition: 'all 0.35s ease',
            }}
          >

            {/* ── LOGO ───────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-0 select-none">
              <span
                className="wx-logo-text text-[1.45rem] leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                wardrobe
              </span>
              <span
                className="wx-logo-x text-[1.55rem] leading-none ml-0.5"
                style={{
                  color: 'var(--gold)',
                  textShadow: '0 0 20px color-mix(in srgb, var(--gold) 40%, transparent)',
                }}
              >
                X
              </span>
            </Link>

            {/* ── DESKTOP NAV ────────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(({ href, label, highlight }) => {
                const active =
                  href === '/tryon' ? isTryOn
                    : href.includes('/shop') ? isShopPath
                      : pathname === href;
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    highlight={highlight}
                    active={active}
                  />
                );
              })}
            </nav>

            {/* ── RIGHT ACTIONS ───────────────────────────────────────── */}
            <div className="flex items-center gap-2">

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <HiOutlineSun size={16} />
                  : <HiOutlineMoon size={16} />}
              </motion.button>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/wishlist"
                  className="relative h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  <HiOutlineHeart size={16} />
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'var(--gold)' }}
                    >
                      {wishlist.length > 9 ? '9+' : wishlist.length}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/cart"
                  className="relative h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  <HiOutlineShoppingBag size={16} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'var(--gold)' }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* ── User menu / Sign in ─────────────────────────────── */}
              {user ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all"
                    style={{
                      borderColor: userMenuOpen
                        ? 'color-mix(in srgb, var(--gold) 60%, transparent)'
                        : 'var(--border)',
                      background: 'var(--card-bg)',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 60%, #000))',
                      }}
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span
                      className="text-[13px] max-w-[80px] truncate"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {user.name?.split(' ')[0]}
                    </span>
                    <HiOutlineChevronDown
                      size={12}
                      style={{
                        color: 'var(--text-muted)',
                        transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-60 rounded-2xl border overflow-hidden"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--gold) 25%, var(--border))',
                          background: 'var(--card-bg)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                        }}
                      >
                        {/* User info header */}
                        <div
                          className="px-4 py-3 border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 55%, #000))',
                              }}
                            >
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                              >
                                {user.name}
                              </p>
                              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-2">
                          {[
                            { href: '/profile', icon: HiOutlineUser, label: 'My Profile' },
                            { href: '/orders', icon: HiOutlineShoppingBag, label: 'My Orders' },
                            { href: '/tryon', icon: HiOutlineSparkles, label: 'Try-On History' },
                            ...(user.role === 'admin'
                              ? [{ href: '/admin', icon: HiOutlineCog, label: 'Admin Panel' }]
                              : []),
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Icon size={15} style={{ color: 'var(--text-muted)' }} />
                              <span style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</span>
                            </Link>
                          ))}

                          {/* Divider */}
                          <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

                          <button
                            onClick={logout}
                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                            style={{ color: '#f87171' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <HiOutlineLogout size={15} />
                            <span style={{ fontFamily: "'Outfit', sans-serif" }}>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                    style={{
                      background: 'var(--gold)',
                      color: '#fff',
                      fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 12px color-mix(in srgb, var(--gold) 40%, transparent)',
                    }}
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(p => !p)}
                className="lg:hidden h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <HiOutlineX size={18} /> : <HiOutlineMenuAlt3 size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── MOBILE MENU ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mx-4 mt-[80px] rounded-2xl border p-5"
              style={{
                borderColor: 'color-mix(in srgb, var(--gold) 30%, var(--border))',
                background: 'var(--card-bg)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile logo */}
              <div className="flex items-baseline gap-0.5 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="wx-logo-text text-xl" style={{ color: 'var(--text-primary)' }}>wardrobe</span>
                <span className="wx-logo-x text-[1.3rem]" style={{ color: 'var(--gold)' }}>X</span>
              </div>

              {/* Nav links */}
              <div className="space-y-1 mb-5">
                {navLinks.map(({ href, label, highlight }, i) => (
                  <motion.div
                    key={href}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={href}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: highlight ? 'var(--gold)' : 'var(--text-primary)',
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: '0.03em',
                      }}
                    >
                      {label}
                      {highlight && <HiOutlineSparkles size={14} style={{ color: 'var(--gold)' }} />}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* User section */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 55%, #000))' }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link href="/profile" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif" }}>
                        <HiOutlineUser size={15} />Profile
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif" }}>
                        <HiOutlineShoppingBag size={15} />Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif" }}>
                          <HiOutlineCog size={15} />Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm w-full"
                        style={{ color: '#f87171', fontFamily: "'Outfit', sans-serif" }}
                      >
                        <HiOutlineLogout size={15} />Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: 'var(--gold)',
                      color: '#fff',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Sign In to Wardrobe X
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