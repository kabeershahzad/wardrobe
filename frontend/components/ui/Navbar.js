'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  HiOutlineChevronDown,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineMenuAlt4,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineX,
} from 'react-icons/hi';

const navLinks = [
  { href: '/shop', label: 'All' },
  { href: '/shop?category=men', label: 'Men' },
  { href: '/shop?category=women', label: 'Women' },
  { href: '/shop?category=kids', label: 'Kids' },
  { href: '/tryon', label: 'Try-On', accent: true },
];

function isActivePath(pathname, searchParams, href) {
  if (href === '/tryon') return pathname.startsWith('/tryon');
  if (href === '/shop') return pathname === '/shop' && !searchParams.get('category');
  if (href.startsWith('/shop?category=')) {
    const cat = href.split('=')[1];
    return pathname === '/shop' && searchParams.get('category') === cat;
  }
  return pathname === href;
}

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useStore();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const menuRef = useRef(null);
  const { scrollY } = useScroll();

  const navOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);
  const navScale = useTransform(scrollY, [0, 50], [1, 0.98]);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e) => menuRef.current && !menuRef.current.contains(e.target) && setUserMenuOpen(false);
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const userQuickLinks = useMemo(() => [
    { href: '/profile', icon: HiOutlineUser, label: 'Profile' },
    { href: '/orders', icon: HiOutlineShoppingBag, label: 'Orders' },
    { href: '/tryon', icon: HiOutlineSparkles, label: 'History' },
    ...(user?.role === 'admin' ? [{ href: '/admin', icon: HiOutlineCog, label: 'Admin' }] : []),
  ], [user?.role]);

  if (!mounted) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          style={{ opacity: navOpacity, scale: navScale }}
          className="w-full max-w-5xl pointer-events-auto"
        >
          <div className={`relative px-4 sm:px-6 h-[72px] rounded-[24px] border transition-all duration-500 flex items-center justify-between gap-4 ${
            scrolled 
              ? 'glass-morphism shadow-2xl py-2 h-[64px] border-[var(--gold)]/30' 
              : 'glass-morphism shadow-lg'
          }`}>
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[var(--gold-dark)] to-[var(--gold)]"
                  whileHover={{ rotate: 45, scale: 1.1 }}
                />
                <span className="relative z-10 font-display font-black text-white text-sm">W</span>
              </div>
              <div className="hidden sm:block overflow-hidden">
                <motion.span className="wx-logo-text block text-sm tracking-[0.2em] font-bold">
                  Wardrobe <span className="text-[var(--gold)]">X</span>
                </motion.span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 relative bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, searchParams, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                      active ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-[var(--gold-dark)] rounded-xl z-0"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)]">
                <HiOutlineSearch size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-2 border-x border-black/10 dark:border-white/10 px-2 mx-1">
                <Link href="/wishlist" className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)]">
                  <HiOutlineHeart size={18} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--gold)] text-[#051022] text-[9px] font-bold rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)]">
                  <HiOutlineShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--gold)] text-[#051022] text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)]"
                >
                  {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
                </button>

                {user ? (
                  <div ref={menuRef} className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 pr-3 rounded-full border border-black/10 dark:border-white/10 hover:border-[var(--gold)] transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--gold-dark)] to-[var(--gold)] flex items-center justify-center text-white font-bold text-xs">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <HiOutlineChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-56 glass-morphism p-2 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10"
                        >
                          {userQuickLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--gold)]/10 text-sm font-medium transition-colors"
                            >
                              <link.icon size={16} className="text-[var(--gold)]" />
                              {link.label}
                            </Link>
                          ))}
                          <div className="h-px bg-black/10 dark:bg-white/10 my-2 mx-2" />
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors"
                          >
                            <HiOutlineLogout size={16} /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                    Sign In
                  </Link>
                )}

                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2.5 rounded-full text-[var(--text-primary)]"
                >
                  {mobileOpen ? <HiOutlineX size={20} /> : <HiOutlineMenuAlt4 size={20} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[49] bg-[var(--bg-primary)] p-8 pt-28 flex flex-col gap-8 md:hidden"
          >
            <div className="grid gap-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold mb-4">Navigation</p>
              {navLinks.map((link, i) => {
                const active = isActivePath(pathname, searchParams, link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-4xl font-display font-black transition-colors ${
                        active ? 'text-[var(--gold)]' : 'text-[var(--text-primary)] hover:text-[var(--gold)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              <Link href="/wishlist" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-black/5 font-bold text-sm">
                <HiOutlineHeart size={20} /> Wishlist
              </Link>
              <Link href="/cart" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-black/5 font-bold text-sm">
                <HiOutlineShoppingBag size={20} /> Cart
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
