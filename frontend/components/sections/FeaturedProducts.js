'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { productsAPI } from '../../lib/api';
import ProductCard from '../ui/ProductCard';
import { ProductSkeleton } from '../ui/Loaders';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const featured = await productsAPI.getAll({ featured: true, limit: 8 });
        const featuredProducts = featured?.data?.products || [];

        if (featuredProducts.length > 0) {
          if (mounted) setProducts(featuredProducts);
          return;
        }

        const fallback = await productsAPI.getAll({ limit: 8 });
        if (mounted) setProducts(fallback?.data?.products || []);
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-var(--purple)/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-px bg-var(--purple)" />
              <p className="section-kicker">Curated Batch</p>
            </div>
            <h2 className="section-title text-5xl lg:text-7xl text-[var(--text-primary)] leading-tight">
              Selected <span className="text-gradient-purple italic">Artifacts</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mt-6 leading-relaxed font-light">
              Explore our latest synthesis of high-performance materials and AI-driven design. Each piece is optimized for the future storefront.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/shop" className="group flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
              Browse All
              <span className="w-14 h-14 rounded-full border border-var(--border) flex items-center justify-center group-hover:bg-var(--text-primary) group-hover:text-[var(--bg-primary)] transition-all">
                <HiOutlineArrowRight size={20} />
              </span>
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="relative group">
            {/* Custom Horizontal Container */}
            <div className="flex gap-8 overflow-x-auto pb-12 snap-x no-scrollbar">
              {products.map((p, i) => (
                <div key={p._id} className="min-w-[320px] md:min-w-[400px] snap-center">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
            
            {/* Navigation HUD */}
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2">
              <div className="hud-element px-4 py-2 rounded-full flex items-center gap-4">
                <span className="text-[10px] font-mono text-var(--purple)">SCROLL_TO_EXPLORE</span>
                <div className="w-24 h-px bg-var(--purple)/30 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-var(--purple)" 
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="section-shell p-20 text-center glass-morphism">
            <p className="font-display text-3xl text-[var(--text-primary)]">System Offline: No data found.</p>
            <Link href="/shop" className="inline-flex mt-8 items-center gap-3 px-8 py-4 rounded-full btn-purple text-sm font-bold uppercase">
              Restore Catalog
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

