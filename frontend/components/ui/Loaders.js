'use client';
import { motion } from 'framer-motion';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(154,107,66,0.22)' }} />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--gold)] animate-spin" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(154,107,66,0.35)' }}>
          <Spinner size="md" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)]">Loading</p>
      </motion.div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}>
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-16 skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="h-5 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

