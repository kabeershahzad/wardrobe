'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineArrowRight,
  HiOutlineCube,
  HiOutlineGlobe,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineTruck,
} from 'react-icons/hi';

const collections = [
  {
    title: 'Dresses Edit',
    desc: 'Everyday to event-ready silhouettes with easy styling options.',
    href: '/shop?category=dresses',
    label: 'Best seller',
  },
  {
    title: 'Ethnic Line',
    desc: 'Modern classics designed for festive and formal moments.',
    href: '/shop?category=ethnic',
    label: 'New drop',
  },
  {
    title: 'Work Formal',
    desc: 'Structured pieces for office hours, meetings, and after-hours.',
    href: '/shop?category=formal',
    label: 'Office ready',
  },
  {
    title: 'Outerwear',
    desc: 'Layering staples with seasonal colors and premium details.',
    href: '/shop?category=outerwear',
    label: 'Limited stock',
  },
  {
    title: 'Casual Fits',
    desc: 'Comfort-led pieces for daily wear and weekend looks.',
    href: '/shop?category=casual',
    label: 'Daily edit',
  },
  {
    title: 'Accessories',
    desc: 'Small upgrades that complete every outfit with intent.',
    href: '/shop?category=accessories',
    label: 'Trending',
  },
];

const storePromises = [
  {
    icon: HiOutlineTruck,
    title: 'Fast Delivery',
    desc: 'Quick nationwide shipping with proactive tracking updates.',
  },
  {
    icon: HiOutlineRefresh,
    title: 'Easy Returns',
    desc: 'Simple return flow so customers shop with confidence.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Secure Checkout',
    desc: 'Encrypted payments and trusted purchase protection.',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Always Available',
    desc: 'A smooth mobile-first storefront on every device.',
  },
];

const testimonials = [
  {
    quote: 'The layout feels just like a premium Shopify boutique, and checkout decisions are much faster.',
    name: 'Areeba H.',
    role: 'Lahore',
  },
  {
    quote: 'I can browse collections, try looks, and order without bouncing between pages. Super clean experience.',
    name: 'Hanan M.',
    role: 'Karachi',
  },
  {
    quote: 'The collection cards and featured picks make product discovery feel effortless.',
    name: 'Sana R.',
    role: 'Islamabad',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="section-kicker">Shop By Collection</p>
          <h2 className="section-title text-4xl sm:text-5xl text-[var(--text-primary)] mt-2">Storefront Sections That Convert</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="section-shell p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{collection.label}</p>
              <h3 className="font-display text-3xl text-[var(--text-primary)] mt-3">{collection.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{collection.desc}</p>
              <Link href={collection.href} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[var(--gold-dark)]">
                Shop category <HiOutlineArrowRight size={15} />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-shell mt-6 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Power feature</p>
            <h3 className="font-display text-4xl text-[var(--text-primary)] mt-2">Add Try-On Without Leaving the Storefront</h3>
            <p className="text-[var(--text-secondary)] mt-3 max-w-2xl">
              Keep the Shopify-style shopping rhythm while offering AI previews for higher purchase confidence.
            </p>
          </div>
          <Link href="/tryon" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-gold text-sm shrink-0">
            <HiOutlineSparkles size={15} /> Launch Try-On
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <p className="section-kicker">Store Confidence</p>
          <h2 className="section-title text-4xl sm:text-5xl text-[var(--text-primary)] mt-2">Everything Customers Expect From a Great Online Store</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {storePromises.map(({ icon: Icon, title, desc }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="section-shell p-5"
            >
              <Icon size={19} className="text-[var(--gold-dark)]" />
              <h3 className="font-display text-xl text-[var(--text-primary)] mt-4">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="section-shell p-6"
            >
              <HiOutlineCube size={18} className="text-[var(--gold-dark)]" />
              <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">"{item.quote}"</p>
              <p className="font-semibold text-sm text-[var(--text-primary)] mt-5">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

