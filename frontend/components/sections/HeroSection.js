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
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background HUD Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-10 w-64 h-px bg-gradient-to-r from-var(--purple) to-transparent" />
        <div className="absolute top-1/3 right-10 w-px h-64 bg-gradient-to-b from-var(--purple) to-transparent" />
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full border border-var(--purple)/20 mask-radial" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="floating-data-tag">Protocol v.2026</span>
              <span className="w-8 h-px bg-var(--border)" />
              <p className="section-kicker">Spring Launch</p>
            </div>

            <h1 className="section-title text-6xl sm:text-7xl lg:text-9xl leading-[0.85] text-[var(--text-primary)] text-balance">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  Fashion
                </motion.span>
              </span>
              <span className="block overflow-hidden mt-2">
                <motion.span
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-gradient-purple italic"
                >
                  Synthesized
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed font-light"
            >
              Experience the next evolution of retail. High-fidelity AI try-on meets a curated storefront designed for the modern aesthetic.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-6 items-center"
            >
              <Link href="/shop" className="group relative px-10 py-5 rounded-full btn-purple text-sm font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-105">
                <span className="relative z-10">Enter Studio</span>
                <motion.div 
                  className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{ skewX: '-20deg' }}
                />
              </Link>
              <Link href="/tryon" className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest group">
                <span className="w-12 h-12 rounded-full border border-var(--border) flex items-center justify-center group-hover:border-var(--purple) transition-colors">
                  <HiOutlineSparkles className="text-var(--purple)" />
                </span>
                AI Prototype
              </Link>
            </motion.div>

            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { val: '98%', label: 'Match Accuracy' },
                { val: '0.4s', label: 'Inference Time' },
                { val: '24/7', label: 'Availability' },
                { val: '1k+', label: 'SKU Catalog' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (i * 0.1) }}
                >
                  <p className="font-display text-2xl text-[var(--text-primary)]">{stat.val}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* HUD Overlay Elements */}
            <div className="absolute -top-6 -left-6 z-20 hud-element p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white/70 tracking-tighter">LIVE_RENDER_ACTIVE</span>
              </div>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: ['20%', '90%', '40%', '70%'] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="h-full bg-var(--purple)" 
                />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 z-20 hud-element p-4 rounded-xl flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-mono text-white/50">GRID_COORD</p>
                <p className="text-xs font-mono text-var(--purple)">40.7128° N</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <HiOutlineShieldCheck className="text-var(--purple)" size={24} />
            </div>

            <div className="relative group section-shell overflow-hidden aspect-[3/4] cyber-glow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide?._id || 'fallback'}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {activeSlide?.image ? (
                    <img src={activeSlide.image} alt="" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full bg-var(--bg-tertiary) flex items-center justify-center">
                      <HiOutlineShoppingBag size={48} className="text-var(--purple)/20" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Scanning Line */}
              <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-var(--purple) to-transparent z-10 shadow-[0_0_15px_var(--purple)]" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <motion.div
                  key={activeSlide?._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="font-mono text-[10px] text-var(--purple) tracking-[0.3em] uppercase mb-2">Selected SKU</p>
                  <h3 className="font-display text-3xl text-white leading-none">{activeSlide?.name || 'Curated Batch'}</h3>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

