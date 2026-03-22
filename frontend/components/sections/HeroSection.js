'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineTruck,
} from 'react-icons/hi';
import { getImageUrl, productsAPI } from '../../lib/api';

function resolveProductImage(product) {
  const first = product?.images?.[0];
  if (!first) return null;
  if (first.gridId) return getImageUrl(first.gridId);
  return first.url || null;
}

export default function HeroSection() {
  const [slides, setSlides] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadingSlides, setLoadingSlides] = useState(true);

  useEffect(() => {
    let mounted = true;

    const toSlides = (items = []) =>
      items
        .map((product) => {
          const image = resolveProductImage(product);
          if (!image) return null;
          return {
            _id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            image,
          };
        })
        .filter(Boolean);

    const loadSlides = async () => {
      try {
        const featured = await productsAPI.getAll({ featured: true, limit: 8 });
        let mapped = toSlides(featured?.data?.products || []);

        if (mapped.length < 3) {
          const all = await productsAPI.getAll({ limit: 12 });
          mapped = toSlides(all?.data?.products || []);
        }

        if (mounted) {
          setSlides(mapped.slice(0, 8));
          setSlideIndex(0);
        }
      } catch {
        if (mounted) setSlides([]);
      } finally {
        if (mounted) setLoadingSlides(false);
      }
    };

    loadSlides();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [slides]);

  const activeSlide = useMemo(() => {
    if (!slides.length) return null;
    return slides[slideIndex % slides.length];
  }, [slides, slideIndex]);

  return (
    <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3"
          style={{
            borderColor: 'var(--border)',
            background: 'linear-gradient(90deg, color-mix(in srgb, var(--gold) 16%, transparent), transparent)',
          }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Free shipping over PKR 6,000
          </p>
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <span>30-day returns</span>
            <span className="opacity-40">|</span>
            <span>Secure checkout</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-center mt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-6"
          >
            <p className="section-kicker mb-4">Spring Storefront 2026</p>
            <h1 className="section-title text-5xl sm:text-6xl lg:text-7xl leading-[0.94] text-[var(--text-primary)]">
              Your Favorite
              <span className="block">Shop, Upgraded</span>
            </h1>
            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl">
              Discover curated drops, best sellers, and instant AI try-on in one clean storefront experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop?new=true" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-gold text-sm">
                <HiOutlineShoppingBag size={16} /> Shop New Arrivals
              </Link>
              <Link href="/tryon" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-outline-gold text-sm font-semibold">
                Try-On Studio <HiOutlineSparkles size={16} />
              </Link>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {[
                { icon: HiOutlineTruck, label: 'Fast dispatch', desc: 'Same-day handling' },
                { icon: HiOutlineShieldCheck, label: 'Easy returns', desc: '30-day support' },
                { icon: HiOutlineShoppingBag, label: 'Curated edits', desc: 'Updated weekly' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="section-shell p-4">
                  <Icon size={18} className="text-[var(--gold-dark)]" />
                  <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[
                { label: 'Dresses', href: '/shop?category=dresses' },
                { label: 'Ethnic', href: '/shop?category=ethnic' },
                { label: 'Formal', href: '/shop?category=formal' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-6"
          >
            <div className="section-shell overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide?._id || 'placeholder'}
                    initial={{ opacity: 0.2, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.2, scale: 1.01 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0"
                  >
                    {activeSlide?.image ? (
                      <img src={activeSlide.image} alt={activeSlide.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: 'linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary))' }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)' }} />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/18 border border-white/25 text-[10px] font-mono tracking-[0.16em] uppercase text-white">
                    Best Seller
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/80">
                    {loadingSlides ? 'Loading' : `${Math.min(slideIndex + 1, Math.max(slides.length, 1))}/${Math.max(slides.length, 1)}`}
                  </p>
                </div>

                <div className="absolute left-4 right-4 bottom-4">
                  {activeSlide ? (
                    <>
                      <p className="font-display text-3xl text-white leading-tight">{activeSlide.name}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-white/80 uppercase tracking-[0.14em]">
                          {activeSlide.category} - PKR {Number(activeSlide.price || 0).toLocaleString()}
                        </p>
                        <Link
                          href={`/shop/${activeSlide._id}`}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold bg-white/18 text-white border border-white/35 hover:bg-white/26 transition-colors"
                        >
                          View Product
                          <HiOutlineArrowRight size={12} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-3xl text-white leading-tight">Weekly Curated Drop</p>
                      <p className="text-xs text-white/80 uppercase tracking-[0.14em] mt-2">Store-ready catalog layout</p>
                    </>
                  )}
                </div>
              </div>

              {slides.length > 1 && (
                <div className="px-4 pb-4 pt-3 flex items-center gap-1.5" style={{ background: 'var(--card-bg)' }}>
                  {slides.map((slide, idx) => (
                    <button
                      key={slide._id}
                      onClick={() => setSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === slideIndex ? 'w-6' : 'w-2.5'}`}
                      style={{ background: idx === slideIndex ? 'var(--gold)' : 'var(--border)' }}
                      aria-label={`Show slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

