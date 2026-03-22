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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-10"
        >
          <div>
            <p className="section-kicker">Featured Collection</p>
            <h2 className="section-title text-4xl sm:text-5xl text-[var(--text-primary)] mt-2">Best Sellers This Week</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-xl">
              A curated grid inspired by high-converting Shopify storefronts: clear picks, clean cards, and fast routes to checkout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/shop?featured=true" className="px-3 py-2 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              Featured
            </Link>
            <Link href="/shop?new=true" className="px-3 py-2 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              New arrivals
            </Link>
            <Link href="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-gold text-xs">
              Shop all products <HiOutlineArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="section-shell p-12 text-center">
            <p className="font-display text-2xl text-[var(--text-primary)]">No products available right now.</p>
            <Link href="/shop" className="inline-flex mt-5 items-center gap-2 px-6 py-3 rounded-lg btn-gold text-sm">
              Browse Collection
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

