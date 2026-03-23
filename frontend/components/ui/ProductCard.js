'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiOutlineSparkles, HiStar } from 'react-icons/hi';
import { useStore } from '../../context/StoreContext';
import { getImageUrl } from '../../lib/api';

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const [imgError, setImgError] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const imageUrl = product.images?.[0]?.gridId
    ? getImageUrl(product.images[0].gridId)
    : product.images?.[0]?.url || '/placeholder-product.jpg';

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border card-hover"
      style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
    >
      <div className="relative aspect-[3/4]" style={{ background: 'var(--bg-secondary)' }}>
        <Link
          href={`/shop/${product._id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        />

        {!imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-6xl text-[var(--text-muted)] opacity-35">W</span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full border flex items-center justify-center"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        >
          {wishlisted ? (
            <HiHeart size={16} className="text-red-500" />
          ) : (
            <HiOutlineHeart size={16} className="text-[var(--text-muted)]" />
          )}
        </button>

        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-primary)] text-[var(--text-secondary)] border" style={{ borderColor: 'var(--border)' }}>
              New
            </span>
          )}
          {discount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white">-{discount}%</span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <Link
            href={`/tryon?product=${product._id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg btn-gold text-xs"
          >
            <HiOutlineSparkles size={14} /> Try On
          </Link>
        </div>
      </div>

      <div className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] mb-1.5">
          {product.category}
        </p>

        <Link href={`/shop/${product._id}`}>
          <h3 className="font-display text-lg leading-tight text-[var(--text-primary)] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <HiStar key={i} size={12} className={i < Math.round(product.rating) ? 'text-[var(--gold)]' : 'text-[var(--border)]'} />
          ))}
          {product.reviewCount > 0 && <span className="text-xs text-[var(--text-muted)] ml-1">({product.reviewCount})</span>}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xl text-[var(--text-primary)]">PKR {product.price.toLocaleString()}</p>
            {product.originalPrice && <p className="text-xs text-[var(--text-muted)] line-through">PKR {product.originalPrice.toLocaleString()}</p>}
          </div>
          <div className="flex gap-1">
            {product.sizes?.slice(0, 3).map((size) => (
              <span key={size} className="text-[10px] px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

