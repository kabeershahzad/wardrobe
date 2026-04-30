'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiOutlineSparkles, HiStar } from 'react-icons/hi';
import { useStore } from '../../context/StoreContext';
import { getImageUrl } from '../../lib/api';

function getStableMeshVersion(id = '') {
  const hash = Array.from(id).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000, 0);
  return hash + 500;
}

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
  const meshVersion = getStableMeshVersion(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border card-hover hover-glow"
      style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <Link
          href={`/shop/${product._id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        />

        {/* HUD Layer - Appears on Hover */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="floating-data-tag hud-element backdrop-blur-md border-white/10 text-white text-[8px]">
              MESH_V: {meshVersion}
            </span>
            <span className="floating-data-tag hud-element backdrop-blur-md border-white/10 text-white text-[8px]">
              AI_FIT: 0.982
            </span>
          </div>
          
          <div className="absolute bottom-20 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {!imgError ? (
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            whileHover={{ scale: 1.08 }}
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
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        >
          {wishlisted ? (
            <HiHeart size={16} className="text-red-500" />
          ) : (
            <HiOutlineHeart size={16} className="text-[var(--text-muted)] hover:text-red-400" />
          )}
        </button>

        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-black border border-black/10">
              New
            </span>
          )}
          {discount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white">-{discount}%</span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            href={`/tryon?product=${product._id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl btn-gold text-xs font-bold shadow-lg"
          >
            <HiOutlineSparkles size={16} /> Try On Virtually
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

