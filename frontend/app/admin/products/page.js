'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/ui/Navbar';
import { Spinner } from '../../../components/ui/Loaders';
import { useAuth } from '../../../context/AuthContext';
import { productsAPI, getImageUrl } from '../../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

const CATS = ['tops', 'bottoms', 'dresses', 'outerwear', 'suits', 'casual', 'formal', 'accessories', 'ethnic', 'activewear'];
const SIZES_ALL = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const EMPTY_PRODUCT = { name: '', description: '', price: '', originalPrice: '', category: 'tops', brand: 'Wardrobe X', sizes: ['M'], colors: '', tags: '', isFeatured: false, isNewArrival: false };

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [files, setFiles] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0); // which uploaded image is primary
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') router.push('/');
      else fetchProducts();
    }
  }, [user, loading, page]);

  const fetchProducts = async () => {
    setFetching(true);
    try {
      const { data } = await productsAPI.getAll({ page, limit: 10 });
      setProducts(data.products);
      setPagination(data.pagination);
    } finally { setFetching(false); }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setFiles([]);
    setPrimaryIndex(0);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: product.description, price: product.price,
      originalPrice: product.originalPrice || '', category: product.category,
      brand: product.brand, sizes: product.sizes, colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '', isFeatured: product.isFeatured, isNewArrival: product.isNewArrival
    });
    setFiles([]);
    setPrimaryIndex(0);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const productData = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()) : [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        toast.success('Product updated!');
      } else {
        const fd = new FormData();
        Object.entries(productData).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
          else if (v !== undefined) fd.append(k, v);
        });
        files.forEach(f => fd.append('images', f));
        fd.append('primaryIndex', primaryIndex);
        await productsAPI.create(fd);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deactivated');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Admin</span>
            <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">Products</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold font-semibold text-sm">
            <HiOutlinePlus size={18} /> Add Product
          </button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => {
                    const primaryImg = product.images?.find(i => i.isPrimary) || product.images?.[0];
                    const imgUrl = primaryImg?.gridId ? getImageUrl(primaryImg.gridId) : primaryImg?.url;
                    return (
                      <tr key={product._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                              {imgUrl ? <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" /> : <HiOutlinePhotograph size={20} className="text-[var(--text-muted)] m-auto mt-3" />}

                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)] line-clamp-1 max-w-40">{product.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 capitalize text-[var(--text-secondary)]">{product.category}</td>
                        <td className="px-5 py-3 font-mono font-semibold text-[var(--text-primary)]">PKR {product.price?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-[var(--text-secondary)]">{product.stock}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.isFeatured && <span className="px-2 py-0.5 rounded-full text-xs bg-gold-500/15 text-gold-500">Featured</span>}
                            {product.isNewArrival && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400">New</span>}
                            {!product.isFeatured && !product.isNewArrival && <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)]">Active</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-gold-500 hover:border-gold-500/50 transition-all">
                              <HiOutlinePencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(product._id)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 transition-all">
                              <HiOutlineTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-mono font-semibold transition-all ${page === i + 1 ? 'bg-gold-500 text-obsidian-950' : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-gold-500/50'
                      }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-gold-500/20 overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: 'var(--card-bg)' }}>
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors">
                  <HiOutlineX size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Product Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required className="input-luxury w-full px-4 py-3 rounded-xl text-sm" placeholder="Product name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Description *</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      required rows={3} className="input-luxury w-full px-4 py-3 rounded-xl text-sm resize-none" placeholder="Product description" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Price (PKR) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      required min="0" className="input-luxury w-full px-4 py-3 rounded-xl text-sm" placeholder="2500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Original Price</label>
                    <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                      min="0" className="input-luxury w-full px-4 py-3 rounded-xl text-sm" placeholder="3500 (optional)" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Category *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm">
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Brand</label>
                    <input type="text" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Colors (comma separated)</label>
                    <input type="text" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm" placeholder="Black, White, Navy" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-[var(--text-primary)]">Tags (comma separated)</label>
                    <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm" placeholder="summer, casual, trending" />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--text-primary)]">Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {SIZES_ALL.map(s => (
                      <button key={s} type="button"
                        onClick={() => setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }))}
                        className={`w-12 h-10 rounded-lg text-sm font-mono border transition-all ${form.sizes.includes(s) ? 'border-gold-500 bg-gold-500 text-obsidian-950 font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-gold-500/50'
                          }`}>{s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div className="flex gap-6">
                  {[
                    { key: 'isFeatured', label: 'Featured Product' },
                    { key: 'isNewArrival', label: 'New Arrival' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-gold-500" />
                      <span className="text-sm text-[var(--text-primary)]">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Images */}
                {!editingProduct && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-[var(--text-primary)]">Product Images</label>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Up to 5 images</span>
                    </div>

                    {/* AI Try-On note */}
                    <div className="p-3 rounded-xl border border-gold-500/25 bg-gold-500/5">
                      <p className="text-xs font-semibold text-gold-500 mb-1">⚡ AI Try-On Tip</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        The <span className="text-gold-400 font-semibold">Primary Image</span> is what Gemini AI uses for virtual try-on.
                        For best results, set a <span className="text-white font-medium">clear front-facing product shot on a white/plain background</span> — no model, no props, no clutter.
                        Avoid setting a model photo as primary as it confuses the AI.
                      </p>
                    </div>

                    <input
                      type="file" multiple accept="image/*"
                      onChange={e => { setFiles(Array.from(e.target.files)); setPrimaryIndex(0); }}
                      className="input-luxury w-full px-4 py-3 rounded-xl text-sm cursor-pointer"
                    />

                    {/* Image preview grid with primary selector */}
                    {files.length > 0 && (
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          Click an image to set it as <span className="text-gold-500 font-semibold">Primary</span> (used for AI try-on &amp; product card)
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {files.map((file, i) => {
                            const url = URL.createObjectURL(file);
                            const isPrimary = i === primaryIndex;
                            return (
                              <div
                                key={i}
                                onClick={() => setPrimaryIndex(i)}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                                style={{
                                  borderColor: isPrimary ? 'var(--gold)' : 'var(--border)',
                                  boxShadow: isPrimary ? '0 0 0 2px var(--gold)' : 'none',
                                }}
                              >
                                <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                                {isPrimary && (
                                  <div className="absolute inset-x-0 bottom-0 py-1 text-center"
                                    style={{ background: 'var(--gold)' }}>
                                    <span className="font-mono text-[9px] font-bold text-obsidian-950 uppercase tracking-widest">
                                      Primary
                                    </span>
                                  </div>
                                )}
                                {!isPrimary && (
                                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                                    <span className="font-mono text-[9px] text-white">{i + 1}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3.5 rounded-xl btn-gold font-semibold disabled:opacity-60">
                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] font-semibold transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}