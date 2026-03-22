'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/ui/Navbar';
import Footer from '../../../components/ui/Footer';
import { Spinner } from '../../../components/ui/Loaders';
import { productsAPI, getImageUrl } from '../../../lib/api';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineHeart, HiHeart, HiOutlineSparkles, HiStar,
  HiOutlineShoppingBag, HiOutlineShare, HiOutlineCheck, HiOutlineChevronLeft
} from 'react-icons/hi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    productsAPI.getOne(id)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0]);
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
      })
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    </main>
  );

  if (!product) return null;

  const imageUrl = (img) => img?.gridId ? getImageUrl(img.gridId) : img?.url || '/placeholder-product.jpg';
  const wishlisted = isWishlisted(product._id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    addToCart(product, selectedSize, selectedColor, qty);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(id, newReview);
      toast.success('Review submitted!');
      const { data } = await productsAPI.getOne(id);
      setProduct(data.product);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-[var(--text-muted)]">
          <Link href="/shop" className="flex items-center gap-1 hover:text-gold-500 transition-colors">
            <HiOutlineChevronLeft size={16} /> Shop
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] truncate max-w-48">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Images */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex flex-col gap-3 w-16 shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-gold-500' : 'border-[var(--border)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--bg-secondary)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={imageUrl(product.images?.[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {discount && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                  -{discount}%
                </div>
              )}
              {product.isNewArrival && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold-500 text-obsidian-950 text-sm font-bold">
                  NEW
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">{product.brand} · {product.category}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-2 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} size={18} className={i < Math.round(product.rating) ? 'text-gold-500' : 'text-[var(--border)]'} />
                ))}
              </div>
              <span className="text-sm text-[var(--text-muted)]">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-[var(--text-primary)]">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-[var(--text-muted)] line-through">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
              {discount && (
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 text-sm font-semibold">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Color: <span className="font-normal text-[var(--text-secondary)]">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        selectedColor === color
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/40'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Size: <span className="font-normal text-[var(--text-secondary)]">{selectedSize}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl font-mono font-semibold text-sm border transition-all ${
                        selectedSize === size
                          ? 'border-gold-500 bg-gold-500 text-obsidian-950'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Qty:</p>
              <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gold-500/10 text-[var(--text-secondary)] transition-colors font-bold text-lg">−</button>
                <span className="w-10 text-center font-mono font-semibold text-sm text-[var(--text-primary)]">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gold-500/10 text-[var(--text-secondary)] transition-colors font-bold text-lg">+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl btn-gold font-semibold">
                <HiOutlineShoppingBag size={20} />
                Add to Cart
              </button>
              <Link
                href={`/tryon?product=${product._id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl btn-outline-gold font-semibold text-sm"
              >
                <HiOutlineSparkles size={18} />
                Try It On
              </Link>
            </div>

            <div className="flex gap-3">
              <button onClick={() => toggleWishlist(product._id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] hover:border-gold-500/50 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-all">
                {wishlisted ? <HiHeart className="text-red-400" size={18} /> : <HiOutlineHeart size={18} />}
                {wishlisted ? 'Saved' : 'Save'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] hover:border-gold-500/50 text-sm text-[var(--text-secondary)] transition-all">
                <HiOutlineShare size={18} />
                Share
              </button>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[var(--border)]">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)] font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-6 border-b border-[var(--border)] mb-8">
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab} {tab === 'reviews' && `(${product.reviewCount})`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[var(--text-secondary)] leading-relaxed max-w-3xl">{product.description}</p>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Write Review */}
                {user && (
                  <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl border border-[var(--border)] mb-8 max-w-xl"
                    style={{ background: 'var(--card-bg)' }}>
                    <h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setNewReview(r => ({ ...r, rating: s }))}>
                          <HiStar size={24} className={s <= newReview.rating ? 'text-gold-500' : 'text-[var(--border)]'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={3}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm resize-none mb-3"
                      required
                    />
                    <button type="submit" disabled={submittingReview}
                      className="px-6 py-2.5 rounded-xl btn-gold font-semibold text-sm disabled:opacity-60">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {product.reviews?.length === 0 ? (
                  <p className="text-[var(--text-muted)]">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4 max-w-2xl">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">{review.name}</span>
                          <div className="flex">{[...Array(5)].map((_, j) => (
                            <HiStar key={j} size={14} className={j < review.rating ? 'text-gold-500' : 'text-[var(--border)]'} />
                          ))}</div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </main>
  );
}
