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
    <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mb-20 text-center"
        >
          <span className="floating-data-tag mb-4 inline-block">System Architecture</span>
          <h2 className="section-title text-5xl lg:text-7xl text-[var(--text-primary)] mt-4">
            Material <span className="text-gradient-purple italic">DNA</span>
          </h2>
          <p className="text-[var(--text-secondary)] mt-6 max-w-2xl mx-auto text-lg font-light">
            Our proprietary synthesis engine bridges the gap between digital simulation and physical reality.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { 
              title: 'Neural Inference', 
              desc: 'Real-time cloth simulation powered by a deep neural network trained on over 500,000 material samples.',
              spec: 'LATENCY: 42ms'
            },
            { 
              title: 'PBR 2.0 Rendering', 
              desc: 'Physically Based Rendering with sub-surface scattering for hyper-realistic fabric texture and light response.',
              spec: 'ACCURACY: 99.4%'
            },
            { 
              title: 'Geometric Fit', 
              desc: 'Automated body-mesh alignment ensures the digital garment fits your unique proportions with surgical precision.',
              spec: 'MESH_V: 120k'
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="hud-element p-10 rounded-[32px] group hover:border-var(--purple)/50 transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-var(--purple)/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="text-var(--purple) font-mono text-xs">0{index + 1}</span>
              </div>
              <h3 className="font-display text-2xl text-[var(--text-primary)] mb-4">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 opacity-70">{item.desc}</p>
              <div className="pt-6 border-t border-var(--border) flex items-center justify-between">
                <span className="text-[10px] font-mono text-var(--purple)">{item.spec}</span>
                <HiOutlineSparkles className="text-var(--purple)/30" />
              </div>
            </motion.div>
          ))}
        </div>
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
              <Icon size={19} className="text-[var(--purple-dark)]" />
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
              <HiOutlineCube size={18} className="text-[var(--purple-dark)]" />
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

