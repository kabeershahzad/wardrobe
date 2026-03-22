'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import ProductCard from '../../components/ui/ProductCard';
import { CardSkeleton } from '../../components/ui/Loaders';
import { productsAPI } from '../../lib/api';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineSearch, HiOutlineChevronDown } from 'react-icons/hi';

const CATEGORIES = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'suits', 'casual', 'formal', 'accessories', 'ethnic', 'activewear'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopPage() {
  const initialFilters = () => {
    if (typeof window === 'undefined') {
      return {
        category: 'all',
        size: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        search: '',
        page: 1,
        featured: '',
        newArrival: '',
      };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') || 'all',
      size: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: '',
      page: 1,
      featured: params.get('featured') || '',
      newArrival: params.get('new') || '',
    };
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState(initialFilters);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.category === 'all') delete params.category;
      if (!params.size) delete params.size;
      if (!params.minPrice) delete params.minPrice;
      if (!params.maxPrice) delete params.maxPrice;
      if (!params.search) delete params.search;
      if (!params.featured) delete params.featured;
      if (!params.newArrival) delete params.newArrival;
      const { data } = await productsAPI.getAll({ ...params, limit: 12 });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({
    category: 'all', size: '', minPrice: '', maxPrice: '',
    sort: 'newest', search: '', page: 1, featured: '', newArrival: ''
  });

  const activeFilterCount = [
    filters.category !== 'all', filters.size, filters.minPrice,
    filters.maxPrice, filters.featured, filters.newArrival
  ].filter(Boolean).length;

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Wardrobe X</span>
            <h1 className="font-display text-5xl font-bold text-[var(--text-primary)] mt-1 mb-2">
              {filters.featured ? 'Featured Collection' : filters.newArrival ? 'New Arrivals' : 'The Collection'}
            </h1>
            <p className="text-[var(--text-secondary)]">{pagination.total} pieces available</p>
          </motion.div>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Search outfits..."
              className="input-luxury w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="input-luxury pl-4 pr-10 py-3 rounded-xl text-sm appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-semibold text-sm ${
              showFilters || activeFilterCount > 0
                ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
            }`}
          >
            <HiOutlineAdjustments size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold-500 text-obsidian-950 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all capitalize ${
                filters.category === cat
                  ? 'bg-gold-500 text-obsidian-950'
                  : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50 hover:text-[var(--text-primary)]'
              }`}
            >
              {cat === 'all' ? 'All Pieces' : cat}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--card-bg)' }}>
                <div className="flex flex-wrap gap-8">
                  {/* Size Filter */}
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] mb-3">Size</p>
                    <div className="flex gap-2 flex-wrap">
                      {SIZES.map(s => (
                        <button
                          key={s}
                          onClick={() => updateFilter('size', filters.size === s ? '' : s)}
                          className={`w-10 h-10 rounded-lg text-sm font-mono font-semibold border transition-all ${
                            filters.size === s
                              ? 'border-gold-500 bg-gold-500 text-obsidian-950'
                              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] mb-3">Price Range (PKR)</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={e => updateFilter('minPrice', e.target.value)}
                        className="input-luxury w-28 px-3 py-2 rounded-lg text-sm"
                      />
                      <span className="text-[var(--text-muted)]">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={e => updateFilter('maxPrice', e.target.value)}
                        className="input-luxury w-28 px-3 py-2 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] mb-3">Quick Filters</p>
                    <div className="flex gap-2">
                      {[
                        { key: 'featured', label: 'Featured' },
                        { key: 'newArrival', label: 'New Arrivals' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => updateFilter(key, filters[key] === 'true' ? '' : 'true')}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            filters[key] === 'true'
                              ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <HiOutlineX size={14} /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <CardSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineSearch size={32} className="text-gold-500/50" />
            </div>
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">No products found</h3>
            <p className="text-[var(--text-secondary)] mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="px-6 py-3 rounded-xl btn-gold font-semibold text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                    className={`w-10 h-10 rounded-xl font-mono text-sm font-semibold transition-all ${
                      pagination.page === i + 1
                        ? 'bg-gold-500 text-obsidian-950'
                        : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
