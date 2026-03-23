'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { Spinner } from '../../components/ui/Loaders';
import { tryonAPI, productsAPI, getImageUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import TryOn360Viewer from '../../components/ui/TryOn360Viewer';
import TryOnAnalysis from '../../components/ui/TryOnAnalysis';
import {
  HiOutlineUpload, HiOutlineSparkles, HiOutlineDownload,
  HiOutlineRefresh, HiOutlineX, HiOutlinePhotograph,
  HiOutlineClock, HiOutlineShoppingBag, HiOutlineLockClosed,
  HiOutlineFilm, HiOutlineHeart, HiHeart, HiStar,
  HiOutlineChevronRight
} from 'react-icons/hi';

function TryOnPageInner() {
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useStore();
  const [productId, setProductId] = useState(null);

  // ── Try-on studio state ──────────────────────────────────────────────────
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [result, setResult] = useState(null);

  // ── Video state ──────────────────────────────────────────────────────────
  const [videoResult, setVideoResult] = useState(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 360° animation handled inside TryOn360Viewer component

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('studio');
  const [history, setHistory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ── Read productId from URL on client side ───────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProductId(params.get('product'));
  }, []);

  // ── Load initial data ────────────────────────────────────────────────────
  useEffect(() => {
    productsAPI.getAll({ limit: 40 })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => { })
      .finally(() => setLoadingProducts(false));

    if (productId) {
      productsAPI.getOne(productId)
        .then(({ data }) => setSelectedProduct(data.product))
        .catch(() => { });
    }
  }, [productId]);

  useEffect(() => {
    if (user) {
      tryonAPI.getHistory()
        .then(({ data }) => setHistory(data.tryOns || []))
        .catch(() => { });
    }
  }, [user]);

  // ── Dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUserImage(file);
    setUserImagePreview(URL.createObjectURL(file));
    setResult(null);
    setVideoResult(null);
    setShowVideo(false);
    setShow3D(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTryOn = async () => {
    if (!user) { toast.error('Please sign in to use AI try-on'); return; }
    if (!userImage) { toast.error('Please upload your photo first'); return; }
    if (!selectedProduct) { toast.error('Please select an outfit first'); return; }

    setProcessing(true);
    setResult(null);
    setVideoResult(null);
    setShowVideo(false);
    setShow3D(false);
    setAnalysis(null);
    setShowAnalysis(false);
    setProcessingTime(0);

    let elapsed = 0;
    const timer = setInterval(() => { elapsed++; setProcessingTime(elapsed); }, 1000);

    try {
      const formData = new FormData();
      formData.append('userImage', userImage);
      formData.append('productId', selectedProduct._id);
      const { data } = await tryonAPI.perform(formData);
      setResult(data);
      toast.success(`✨ Try-on ready in ${data.processingTime ? (data.processingTime / 1000).toFixed(1) : elapsed}s!`);
      // Refresh history
      tryonAPI.getHistory().then(({ data: h }) => setHistory(h.tryOns || [])).catch(() => { });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Try-on failed. Please try again.');
    } finally {
      clearInterval(timer);
      setProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!result?.tryOnId) return;
    setGeneratingVideo(true);
    setShow3D(true);   // show the panel immediately with loading state
    setVideoResult(null);
    setVideoTimer(0);

    let elapsed = 0;
    const timer = setInterval(() => { elapsed++; setVideoTimer(elapsed); }, 1000);

    try {
      toast('🎬 Generating 360° view — capturing AI angles...', { duration: 8000 });
      const { data } = await tryonAPI.generateVideo({ tryOnId: result.tryOnId });
      setVideoResult(data);
      const aiCount = data.aiFrames || 0;
      toast.success(`🎬 360° ready! ${aiCount} AI angles · ${data.frameCount} frames total`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Video generation failed.');
      setShow3D(false);
    } finally {
      clearInterval(timer);
      setGeneratingVideo(false);
    }
  };

  const handleDownloadImage = () => {
    if (!result?.resultImage) return;
    const a = document.createElement('a');
    a.href = result.resultImage;
    a.download = `wardrobex-tryon-${Date.now()}.png`;
    a.click();
    toast.success('Try-on image downloaded!');
  };

  const handleDownloadVideo = () => {
    if (!videoResult?.frames?.length) return;
    const a = document.createElement('a');
    a.href = videoResult.frames[0]; // front view
    a.download = `wardrobex-360-${Date.now()}.jpg`;
    a.click();
    toast.success('Image downloaded!');
  };

  const handleAnalyse = async () => {
    if (!result?.tryOnId) return;
    setAnalysing(true);
    setShowAnalysis(true);
    try {
      toast('🧠 AI stylist is analysing your look...', { duration: 10000 });
      const { data } = await tryonAPI.analyse({ tryOnId: result.tryOnId });
      setAnalysis(data.analysis);
      toast.success('✨ Analysis ready!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed.');
      setShowAnalysis(false);
    } finally {
      setAnalysing(false);
    }
  };

  const resetStudio = () => {
    setUserImage(null);
    setUserImagePreview(null);
    setResult(null);
    setVideoResult(null);
    setShowVideo(false);
    setShow3D(false);
    setAnalysis(null);
    setShowAnalysis(false);
    setProcessingTime(0);
    if (!productId) setSelectedProduct(null);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = categoryFilter === 'all'
    ? products
    : products.filter(p => p.category === categoryFilter);

  const getProductImg = (p) => {
    const img = p?.images?.[0];
    return img?.gridId ? getImageUrl(img.gridId) : img?.url || null;
  };

  // ═════════════════════════════════════════════════════════════════════════
  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">
            Wardrobe X AI
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-[var(--text-primary)] mt-1 mb-2">
            Virtual Try-On Studio
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Upload your photo · Pick an outfit · See the magic
          </p>
        </motion.div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-xl border border-[var(--border)] w-fit mb-10"
          style={{ background: 'var(--bg-secondary)' }}>
          {[
            { id: 'studio', label: '✨ Try-On Studio' },
            { id: 'history', label: `📋 History (${history.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'bg-gold-500 text-obsidian-950'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STUDIO TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'studio' && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: Steps ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* STEP 1 — Upload Photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: userImagePreview ? 'rgba(212,175,55,0.4)' : 'var(--border)',
                }}
              >
                {/* Step header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${userImagePreview ? 'bg-gold-500 text-obsidian-950' : 'bg-gold-500/20 text-gold-500'
                    }`}>
                    {userImagePreview ? '✓' : '1'}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                      Upload Your Photo
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Clear, front-facing photo works best
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  {userImagePreview ? (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-gold-500/30">
                        <img src={userImagePreview} alt="Your photo"
                          className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)] mb-1">
                          ✅ Photo ready
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mb-3 truncate max-w-xs">
                          {userImage?.name}
                        </p>
                        <button
                          onClick={() => {
                            setUserImage(null);
                            setUserImagePreview(null);
                            setResult(null);
                            setVideoResult(null);
                            setShowVideo(false);
                          }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <HiOutlineX size={13} /> Remove photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-[var(--border)] hover:border-gold-500/50 hover:bg-gold-500/5'
                        }`}
                    >
                      <input {...getInputProps()} />
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDragActive ? 'bg-gold-500/20' : 'bg-[var(--bg-secondary)]'
                        }`}>
                        <HiOutlineUpload size={28} className={isDragActive ? 'text-gold-500' : 'text-[var(--text-muted)]'} />
                      </div>
                      <p className="font-semibold text-[var(--text-primary)] mb-1 text-lg">
                        {isDragActive ? 'Drop your photo here' : 'Upload Your Photo'}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mb-3">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        JPG, PNG, WebP · Max 10MB
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* STEP 2 — Select Outfit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: selectedProduct ? 'rgba(212,175,55,0.4)' : 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${selectedProduct ? 'bg-gold-500 text-obsidian-950' : 'bg-gold-500/20 text-gold-500'
                    }`}>
                    {selectedProduct ? '✓' : '2'}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                      Select an Outfit
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Choose any item from the collection
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  {/* Selected product preview */}
                  {selectedProduct && (
                    <div className="flex items-center gap-4 mb-4 p-3 rounded-xl border border-gold-500/20 bg-gold-500/5">
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-[var(--bg-secondary)] shrink-0"
                        style={{ height: '72px' }}>
                        {getProductImg(selectedProduct) && (
                          <img src={getProductImg(selectedProduct)} alt={selectedProduct.name}
                            className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] truncate text-sm">
                          {selectedProduct.name}
                        </p>
                        <p className="text-xs text-gold-500 capitalize">{selectedProduct.category}</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          PKR {selectedProduct.price?.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all shrink-0"
                      >
                        <HiOutlineX size={16} />
                      </button>
                    </div>
                  )}

                  {/* Category filter tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                    {categories.slice(0, 8).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize shrink-0 ${categoryFilter === cat
                          ? 'bg-gold-500 text-obsidian-950'
                          : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-gold-500/50 hover:text-[var(--text-primary)]'
                          }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Product grid */}
                  {loadingProducts ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredProducts.map(p => (
                        <button
                          key={p._id}
                          onClick={() => setSelectedProduct(p)}
                          className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${selectedProduct?._id === p._id
                            ? 'border-gold-500 shadow-gold'
                            : 'border-transparent hover:border-gold-500/60'
                            }`}
                          style={{ background: 'var(--bg-secondary)' }}
                        >
                          {getProductImg(p) ? (
                            <img src={getProductImg(p)} alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <HiOutlinePhotograph size={20} className="text-[var(--text-muted)]" />
                            </div>
                          )}
                          {selectedProduct?._id === p._id && (
                            <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                              <span className="w-6 h-6 rounded-full bg-gold-500 text-obsidian-950 flex items-center justify-center text-xs font-bold">✓</span>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{p.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Link href="/shop"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-gold-500 hover:text-gold-400 transition-colors font-semibold">
                    <HiOutlineShoppingBag size={14} />
                    Browse full collection
                    <HiOutlineChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>

              {/* STEP 3 — Result */}
              <AnimatePresence>
                {(processing || result) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border overflow-hidden"
                    style={{
                      background: 'var(--card-bg)',
                      borderColor: 'rgba(212,175,55,0.4)',
                    }}
                  >
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-obsidian-950 flex items-center justify-center font-bold text-sm shrink-0">
                        {processing ? <Spinner size="sm" /> : '✓'}
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                          {processing ? 'AI is Working...' : '✨ Try-On Result'}
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          {processing ? 'Gemini is fitting the outfit onto your photo' : `Generated successfully · ${result?.processingTime ? (result.processingTime / 1000).toFixed(1) + 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Processing state */}
                      {processing && (
                        <div className="text-center py-10">
                          <div className="relative w-20 h-20 mx-auto mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-gold-500/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-500 animate-spin" />
                            <div className="absolute inset-2 rounded-full bg-gold-500/10 flex items-center justify-center">
                              <HiOutlineSparkles className="text-gold-500" size={22} />
                            </div>
                          </div>
                          <p className="font-display text-2xl text-[var(--text-primary)] mb-1">
                            Generating try-on...
                          </p>
                          <p className="text-sm text-[var(--text-muted)] mb-4">
                            This usually takes 15–30 seconds
                          </p>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20">
                            <HiOutlineClock size={14} className="text-gold-500" />
                            <span className="font-mono text-sm text-gold-500">{processingTime}s elapsed</span>
                          </div>
                        </div>
                      )}

                      {/* Result */}
                      {!processing && result?.resultImage && (
                        <>
                          {/* 3-panel comparison — hidden when 360 view is open */}
                          <div className={`grid grid-cols-3 gap-3 mb-5 ${show3D || generatingVideo ? 'hidden' : ''}`}>
                            {/* Panel 1 — Original */}
                            <div>
                              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2 text-center">
                                Your Photo
                              </p>
                              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <img src={userImagePreview} alt="Your photo"
                                  className="w-full h-full object-cover" />
                              </div>
                            </div>

                            {/* Panel 2 — Outfit */}
                            <div>
                              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2 text-center">
                                Outfit
                              </p>
                              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)]">
                                {getProductImg(selectedProduct) && (
                                  <img src={getProductImg(selectedProduct)} alt="Outfit"
                                    className="w-full h-full object-cover" />
                                )}
                              </div>
                            </div>

                            {/* Panel 3 — Result */}
                            <div>
                              <p className="font-mono text-[10px] text-gold-500 uppercase tracking-widest mb-2 text-center">
                                ✨ Result
                              </p>
                              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-gold-500/50 shadow-gold relative">
                                <img src={result.resultImage} alt="Try-on result"
                                  className="w-full h-full object-cover" />
                                <div className="absolute top-1.5 right-1.5">
                                  <button
                                    onClick={() => selectedProduct && toggleWishlist(selectedProduct._id)}
                                    className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                                  >
                                    {selectedProduct && isWishlisted(selectedProduct._id)
                                      ? <HiHeart size={14} className="text-red-400" />
                                      : <HiOutlineHeart size={14} className="text-white" />
                                    }
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 360° Video display */}
                          <AnimatePresence>
                            {(show3D || generatingVideo) && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-5 rounded-2xl border border-gold-500/20 overflow-hidden"
                                style={{ background: 'var(--bg-secondary)' }}
                              >
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gold-500/10">
                                  <span className="text-lg">🧍</span>
                                  <p className="font-display text-base font-semibold text-[var(--text-primary)]">
                                    360° Try-On View
                                  </p>
                                  <span className="ml-auto font-mono text-xs text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full">
                                    AI Angles · Smooth Rotation
                                  </span>
                                  <button onClick={() => { setShow3D(false); setVideoResult(null); }}
                                    className="ml-2 p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors">
                                    <HiOutlineX size={16} />
                                  </button>
                                </div>
                                <div className="p-4">
                                  <TryOn360Viewer
                                    frames={videoResult?.frames || []}
                                    delay={videoResult?.delay || 400}
                                  />
                                </div>
                                {videoResult && (
                                  <p className="text-xs text-[var(--text-muted)] text-center pb-3">
                                    {videoResult.aiFrames} AI-generated angles · {videoResult.frameCount} smooth frames · drag to scrub
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-3">
                            {/* Download image */}
                            <button
                              onClick={handleDownloadImage}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold font-semibold text-sm"
                            >
                              <HiOutlineDownload size={16} />
                              Download Image
                            </button>

                            {/* Generate 360° View */}
                            {!show3D ? (
                              <button
                                onClick={handleGenerateVideo}
                                disabled={generatingVideo}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-obsidian-950 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #d4af37, #b8952e)' }}
                              >
                                {generatingVideo
                                  ? <><span className="animate-spin inline-block">🔄</span> {videoTimer}s...</>
                                  : <><span>🔄</span> Generate 360° View</>
                                }
                              </button>
                            ) : (
                              <button
                                onClick={() => { setShow3D(false); setVideoResult(null); }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-outline-gold font-semibold text-sm"
                              >
                                <HiOutlineX size={16} /> Close 360°
                              </button>
                            )}

                            {/* Try another */}
                            <button
                              onClick={resetStudio}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-outline-gold font-semibold text-sm"
                            >
                              <HiOutlineRefresh size={16} />
                              Try Another
                            </button>

                            {/* AI Analyse button */}
                            <button
                              onClick={handleAnalyse}
                              disabled={analysing}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                              {analysing
                                ? <><span className="animate-pulse">🧠</span> Analysing...</>
                                : <><span>🧠</span> AI Style Analysis</>
                              }
                            </button>
                          </div>

                          {/* AI Analysis panel */}
                          <AnimatePresence>
                            {showAnalysis && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-5"
                              >
                                {analysing && !analysis ? (
                                  <div className="flex items-center gap-3 p-5 rounded-2xl border border-[var(--border)]"
                                    style={{ background: 'var(--bg-secondary)' }}>
                                    <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-purple-500 animate-spin shrink-0" />
                                    <div>
                                      <p className="font-semibold text-sm text-[var(--text-primary)]">
                                        AI Stylist is analysing your look…
                                      </p>
                                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        Checking fabric, colour, fit and finding alternatives
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <TryOnAnalysis
                                    analysis={analysis}
                                    onClose={() => { setShowAnalysis(false); setAnalysis(null); }}
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right Panel ─────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Generate button card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl border border-gold-500/20 sticky top-24"
                style={{ background: 'var(--card-bg)' }}
              >
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4">
                  Ready to Try On?
                </h3>

                {/* Checklist */}
                <div className="space-y-2.5 mb-5">
                  {[
                    { label: 'Photo uploaded', done: !!userImagePreview },
                    { label: 'Outfit selected', done: !!selectedProduct },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-gold-500' : 'bg-[var(--border)]'
                        }`}>
                        {done
                          ? <span className="text-obsidian-950 text-xs font-bold">✓</span>
                          : <span className="text-[var(--text-muted)] text-xs">○</span>
                        }
                      </div>
                      <span className={done ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {!user ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
                      <HiOutlineLockClosed size={22} className="text-gold-500" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      Sign in to use AI try-on
                    </p>
                    <Link href="/auth/login"
                      className="block w-full py-3 rounded-xl btn-gold text-center font-semibold text-sm">
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleTryOn}
                    disabled={!userImage || !selectedProduct || processing}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-sm transition-all ${userImage && selectedProduct && !processing
                      ? 'btn-gold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                      }`}
                  >
                    {processing
                      ? <><Spinner size="sm" /> Processing...</>
                      : <><HiOutlineSparkles size={18} /> Generate Try-On</>
                    }
                  </button>
                )}

                <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                  Powered by Google Gemini AI
                </p>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 rounded-2xl border border-[var(--border)]"
                style={{ background: 'var(--card-bg)' }}
              >
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  📸 Tips for Best Results
                </h3>
                <ul className="space-y-2">
                  {[
                    'Face the camera directly',
                    'Good, even lighting',
                    'Plain background preferred',
                    'Full body visible in frame',
                    'Wear form-fitting clothing',
                  ].map(tip => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                      <span className="text-gold-500 mt-0.5 shrink-0">·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* 360° Video info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-2xl border border-purple-500/20"
                style={{ background: 'var(--card-bg)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineFilm className="text-purple-400" size={18} />
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    360° Video Feature
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  After your try-on is ready, click{' '}
                  <span className="text-purple-400 font-semibold">Generate 360° Video</span>{' '}
                  to create an animated GIF showing a full rotation of you wearing the outfit.
                  Uses perspective transform — ready in ~3 seconds.
                </p>
              </motion.div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            HISTORY TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div>
            {!user ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineLockClosed size={32} className="text-gold-500/50" />
                </div>
                <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">
                  Sign in to view history
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  Your past try-ons will appear here
                </p>
                <Link href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold font-semibold text-sm">
                  Sign In
                </Link>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <HiOutlinePhotograph size={32} className="text-gold-500/50" />
                </div>
                <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">
                  No try-ons yet
                </h3>
                <p className="text-[var(--text-secondary)] mb-5">
                  Start your first virtual try-on in the studio
                </p>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold font-semibold text-sm"
                >
                  <HiOutlineSparkles size={16} />
                  Open Studio
                </button>
              </div>
            ) : (
              <>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  {history.length} try-on{history.length !== 1 ? 's' : ''} in your history
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {history.map((tryon, i) => (
                    <motion.div
                      key={tryon._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl border overflow-hidden card-hover"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                      {/* Result image */}
                      <div className="relative aspect-[3/4] bg-[var(--bg-secondary)]">
                        {tryon.resultImageBase64 ? (
                          <img
                            src={tryon.resultImageBase64}
                            alt="Try-on result"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiOutlineSparkles size={32} className="text-[var(--text-muted)]" />
                          </div>
                        )}
                        {/* Status badge */}
                        <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${tryon.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400'
                          : tryon.status === 'failed' ? 'bg-red-500/20 text-red-400'
                            : 'bg-gold-500/20 text-gold-500'
                          }`}>
                          {tryon.status}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {tryon.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">
                          {tryon.product?.category}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-[var(--text-muted)]">
                            {new Date(tryon.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          {tryon.resultImageBase64 && (
                            <button
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = tryon.resultImageBase64;
                                a.download = `wardrobex-${tryon._id}.png`;
                                a.click();
                              }}
                              className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 font-semibold transition-colors"
                            >
                              <HiOutlineDownload size={13} />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={null}>
      <TryOnPageInner />
    </Suspense>
  );
}