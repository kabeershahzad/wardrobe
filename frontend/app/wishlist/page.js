'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { Spinner } from '../../components/ui/Loaders';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { wishlistAPI, getImageUrl } from '../../lib/api';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toggleWishlist, addToCart } = useStore();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      wishlistAPI.get()
        .then(({ data }) => setItems(data.wishlist?.items?.filter(i => i.product) || []))
        .finally(() => setFetching(false));
    }
  }, [user, loading]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setItems(prev => prev.filter(i => i.product._id !== productId));
  };

  if (loading || fetching) return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Your Saves</span>
          <h1 className="font-display text-5xl font-bold text-[var(--text-primary)] mt-1">
            Wishlist <span className="text-gold-500">({items.length})</span>
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineHeart size={32} className="text-gold-500/50" />
            </div>
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">Your wishlist is empty</h3>
            <p className="text-[var(--text-secondary)] mb-6">Save items you love to come back to them later</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold font-semibold text-sm">
              <HiOutlineShoppingBag size={18} /> Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {items.map(({ product }) => {
                const imageUrl = product.images?.[0]?.gridId
                  ? getImageUrl(product.images[0].gridId)
                  : product.images?.[0]?.url;

                return (
                  <motion.div key={product._id} layout exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-2xl overflow-hidden border border-[var(--border)] card-hover"
                    style={{ background: 'var(--card-bg)' }}>
                    <Link href={`/shop/${product._id}`} className="block relative aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden">
                      {imageUrl && <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />}
                    </Link>
                    <div className="p-4">
                      <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{product.category}</p>
                      <Link href={`/shop/${product._id}`}>
                        <h3 className="font-display text-base font-semibold text-[var(--text-primary)] hover:text-gold-500 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="font-display text-lg font-bold text-[var(--text-primary)] mt-1 mb-3">
                        PKR {product.price?.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl btn-gold text-sm font-semibold">
                          <HiOutlineShoppingBag size={16} /> Add to Cart
                        </button>
                        <Link href={`/tryon?product=${product._id}`}
                          className="p-2.5 rounded-xl border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors">
                          <HiOutlineSparkles size={18} />
                        </Link>
                        <button onClick={() => handleRemove(product._id)}
                          className="p-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
