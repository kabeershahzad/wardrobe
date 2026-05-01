'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiOutlineArrowRight } from 'react-icons/hi';

const categories = [
  {
    name: 'Men',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2071&auto=format&fit=crop',
    count: '240+ Pieces'
  },
  {
    name: 'Women',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1972&auto=format&fit=crop',
    count: '380+ Pieces'
  },
  {
    name: 'Kids',
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=2072&auto=format&fit=crop',
    count: '120+ Pieces'
  }
];

export default function CategorySection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="section-kicker">Browse Collections</span>
            <h2 className="section-title text-5xl lg:text-7xl mt-4">
              Shop by <span className="text-gradient-purple italic">Department</span>
            </h2>
          </div>
          <Link href="/shop" className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:text-purple-500 transition-colors group">
            View All Categories <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-[32px] border border-var(--border) cursor-pointer"
            >
              <Link href={`/shop?category=${cat.slug}`}>
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xs font-mono text-var(--purple) tracking-[0.3em] uppercase mb-2">{cat.count}</p>
                  <h3 className="text-4xl font-display font-bold text-white mb-4">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                    Explore <HiOutlineArrowRight />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
