'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  HiOutlineChevronDown,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineMenuAlt3,
  HiOutlineMoon,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineX,
} from 'react-icons/hi';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?new=true', label: 'New Arrivals' },
  { href: '/shop?featured=true', label: 'Featured' },
  { href: '/tryon', label: 'Try-On Studio', accent: true },
];

function isActivePath(pathname, href) {
  if (href === '/tryon') return pathname.startsWith('/tryon');
  if (href.startsWith('/shop')) return pathname.startsWith('/shop');
  return pathname === href;
}

function CircleAction({ href, children, badge, ariaLabel }) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200"
      style={{
        background: 'color-mix(in srgb, var(--bg-secondary) 72%, transparent)',
        border: '1px solid color-mix(in srgb, var(--gold) 20%, var(--border))',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
      {badge > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
          style={{
            background: 'var(--gold)',
            color: '#051022',
            boxShadow: '0 0 12px color-mix(in srgb, var(--gold) 50%, transparent)',
          }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useStore();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  const userQuickLinks = useMemo(
    () => [
      { href: '/profile', icon: HiOutlineUser, label: 'My Profile' },
      { href: '/orders', icon: HiOutlineShoppingBag, label: 'My Orders' },
      { href: '/tryon', icon: HiOutlineSparkles, label: 'Try-On History' },
      ...(user?.role === 'admin' ? [{ href: '/admin', icon: HiOutlineCog, label: 'Admin Panel' }] : []),
    ],
    [user?.role]
  );

  if (!mounted) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-7xl"
        >
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{
              borderColor: scrolled
                ? 'color-mix(in srgb, var(--gold) 45%, var(--border))'
                : 'color-mix(in srgb, var(--gold) 24%, var(--border))',
              background: 'color-mix(in srgb, var(--nav-bg) 84%, transparent)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              boxShadow: scrolled
                ? '0 10px 34px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.12)'
                : '0 8px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, color-mix(in srgb, var(--gold) 16%, transparent), transparent 35%, color-mix(in srgb, var(--gold) 10%, transparent))',
              }}
            />

            <div className="relative h-[66px] px-4 sm:px-5 flex items-center justify-between gap-3">
              <Link href="/" className="shrink-0 inline-flex items-center gap-2 select-none">
                <span
                  className="w-6 h-6 rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold) 0%, color-mix(in srgb, var(--gold) 38%, #7f6bff) 100%)',
                    boxShadow: '0 0 16px color-mix(in srgb, var(--gold) 58%, transparent)',
                  }}
                />
                <span className="wx-logo-text text-[1.06rem] leading-none" style={{ color: 'var(--text-primary)' }}>
                  Wardrobe
                </span>
                <span className="wx-logo-x text-[1.1rem] leading-none" style={{ color: 'var(--gold)' }}>
                  X
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 rounded-xl text-[12px] uppercase tracking-[0.12em] transition-all duration-200"
                      style={{
                        color: active ? '#061225' : link.accent ? 'var(--gold-light)' : 'var(--text-secondary)',
                        background: active
                          ? 'linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 56%, #8f73ff))'
                          : 'transparent',
                        border: `1px solid ${active
                          ? 'color-mix(in srgb, var(--gold) 70%, transparent)'
                          : 'transparent'}`,
                        boxShadow: active ? '0 0 18px color-mix(in srgb, var(--gold) 45%, transparent)' : 'none',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--gold) 20%, var(--border))',
                    background: 'color-mix(in srgb, var(--bg-secondary) 72%, transparent)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  <CircleAction href="/wishlist" badge={wishlist.length} ariaLabel="Wishlist">
                    <HiOutlineHeart size={16} />
                  </CircleAction>
                  <CircleAction href="/cart" badge={cartCount} ariaLabel="Cart">
                    <HiOutlineShoppingBag size={16} />
                  </CircleAction>
                </div>

                {user ? (
                  <div ref={menuRef} className="relative hidden sm:block">
                    <button
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className="h-9 pl-1.5 pr-2.5 rounded-full flex items-center gap-2 transition-all duration-200"
                      style={{
                        border: `1px solid ${userMenuOpen
                          ? 'color-mix(in srgb, var(--gold) 60%, transparent)'
                          : 'color-mix(in srgb, var(--gold) 24%, var(--border))'}`,
                        background: 'color-mix(in srgb, var(--card-bg) 80%, transparent)',
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{
                          color: '#071123',
                          background:
                            'linear-gradient(135deg, var(--gold) 0%, color-mix(in srgb, var(--gold) 45%, #7f6bff) 100%)',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                      <span className="text-[13px] max-w-[88px] truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.name?.split(' ')[0]}
                      </span>
                      <HiOutlineChevronDown
                        size={13}
                        style={{
                          color: 'var(--text-muted)',
                          transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl border overflow-hidden"
                          style={{
                            borderColor: 'color-mix(in srgb, var(--gold) 35%, var(--border))',
                            background: 'color-mix(in srgb, var(--card-bg) 92%, transparent)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 64px rgba(0, 0, 0, 0.36)',
                          }}
                        >
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {user.name}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                              {user.email}
                            </p>
                          </div>

                          <div className="p-2">
                            {userQuickLinks.map(({ href, icon: Icon, label }) => (
                              <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'color-mix(in srgb, var(--gold) 10%, transparent)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                              >
                                <Icon size={15} />
                                <span>{label}</span>
                              </Link>
                            ))}

                            <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

                            <button
                              onClick={logout}
                              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                              style={{ color: '#fb7185' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(251, 113, 133, 0.12)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <HiOutlineLogout size={15} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/auth/login" className="hidden sm:inline-flex px-4 h-9 rounded-full items-center text-[13px] font-semibold btn-gold">
                    Sign In
                  </Link>
                )}

                <button
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--gold) 20%, var(--border))',
                    background: 'color-mix(in srgb, var(--bg-secondary) 72%, transparent)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <HiOutlineX size={17} /> : <HiOutlineMenuAlt3 size={17} />}
                </button>
              </div>
            </div>

            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--gold) 62%, transparent) 30%, color-mix(in srgb, var(--gold) 30%, transparent) 65%, transparent 100%)',
              }}
            />
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(4, 8, 18, 0.58)', backdropFilter: 'blur(8px)' }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="mx-4 mt-[82px] rounded-2xl border p-5"
              style={{
                borderColor: 'color-mix(in srgb, var(--gold) 38%, var(--border))',
                background: 'color-mix(in srgb, var(--card-bg) 86%, transparent)',
                boxShadow: '0 26px 64px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(24px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="section-kicker">Navigation Grid</p>
                <div className="flex items-center gap-2">
                  <CircleAction href="/wishlist" badge={wishlist.length} ariaLabel="Wishlist">
                    <HiOutlineHeart size={15} />
                  </CircleAction>
                  <CircleAction href="/cart" badge={cartCount} ariaLabel="Cart">
                    <HiOutlineShoppingBag size={15} />
                  </CircleAction>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {navLinks.map((link, index) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm uppercase tracking-[0.09em]"
                        style={{
                          color: active ? '#051022' : 'var(--text-primary)',
                          background: active
                            ? 'linear-gradient(135deg, var(--gold), color-mix(in srgb, var(--gold) 55%, #7f6bff))'
                            : 'color-mix(in srgb, var(--bg-secondary) 70%, transparent)',
                          border: `1px solid ${active
                            ? 'color-mix(in srgb, var(--gold) 64%, transparent)'
                            : 'color-mix(in srgb, var(--gold) 20%, var(--border))'}`,
                        }}
                      >
                        {link.label}
                        {link.accent && <HiOutlineSparkles size={15} style={{ color: active ? '#051022' : 'var(--gold)' }} />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          color: '#061223',
                          background:
                            'linear-gradient(135deg, var(--gold) 0%, color-mix(in srgb, var(--gold) 45%, #7f6bff) 100%)',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {userQuickLinks.map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm"
                          style={{
                            color: 'var(--text-secondary)',
                            background: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)',
                          }}
                        >
                          <Icon size={15} />
                          {label}
                        </Link>
                      ))}

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm"
                        style={{
                          color: '#fb7185',
                          background: 'rgba(251, 113, 133, 0.08)',
                        }}
                      >
                        <HiOutlineLogout size={15} />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <Link href="/auth/login" className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold btn-gold">
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
