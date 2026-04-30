'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HiOutlineDatabase, HiOutlineChip, HiOutlineBeaker } from 'react-icons/hi';

const synthesisSteps = [
  {
    icon: HiOutlineDatabase,
    title: 'Pattern Analysis',
    desc: 'Deep neural networks parse 2D garment architecture into high-dimensional geometric data.',
    metrics: ['DATA_NODES: 12.4k', 'PROBABILITY: 0.998']
  },
  {
    icon: HiOutlineChip,
    title: 'Neural Mapping',
    desc: 'Real-time alignment of garment topology with human skeletal and muscular coordinates.',
    metrics: ['VERT_SYNC: 42ms', 'TOLERANCE: 0.001mm']
  },
  {
    icon: HiOutlineBeaker,
    title: 'Material Synthesis',
    desc: 'PBR 2.0 rendering of light-material interactions across different fabric densities.',
    metrics: ['PHOTON_REF: 4k', 'DIFFUSION: HIGH']
  }
];

const floatingDataPoints = [
  { t: "-20%", l: "10%", label: "Density", value: "47.83" },
  { t: "10%", l: "-10%", label: "Friction", value: "60.86" },
  { b: "0%", r: "-15%", label: "Elasticity", value: "34.12" }
];

export default function FabricLabSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={containerRef} className="py-40 bg-[var(--bg-primary)] overflow-hidden relative">
      <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 lab-overlay pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-tech mb-4 block animate-pulse-soft">Core.Engine.Active</span>
              <h2 className="section-title text-5xl lg:text-7xl mb-8 leading-tight">
                The <span className="text-gradient-gold">Fabric</span> <br /> Laboratory
              </h2>
              <p className="text-[var(--text-secondary)] text-lg font-light leading-relaxed max-w-xl">
                Witness the intersection of computational geometry and high-end fashion. Our laboratory simulates 
                real-world physics to deliver hyper-realistic virtual try-on experiences.
              </p>

              <div className="mt-12 space-y-6">
                {synthesisSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex gap-6 p-6 rounded-2xl border border-var(--border) bg-var(--card-bg)/50 backdrop-blur-sm group hover:border-var(--gold)/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl border border-var(--gold)/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <step.icon size={24} className="text-var(--gold)" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl mb-2">{step.title}</h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                      <div className="flex gap-4 mt-4">
                        {step.metrics.map(m => (
                          <span key={m} className="text-[8px] font-mono text-var(--gold) px-2 py-1 rounded bg-var(--gold)/5 border border-var(--gold)/10">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 relative">
            <motion.div 
              style={{ x: x2 }}
              className="absolute -top-20 -right-20 w-64 h-64 border border-var(--gold)/10 rounded-full animate-spin-slow pointer-events-none" 
            />
            
            <div className="relative z-10 glass-morphism rounded-[40px] p-8 md:p-12 overflow-hidden border-var(--gold)/20 cyber-glow">
              {/* Internal Tech Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-var(--gold) to-transparent opacity-30" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-var(--gold) to-transparent opacity-30" />
              
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-tech opacity-60">System_Diagnostics</p>
                  <p className="text-xs font-mono text-var(--gold)">NODE_CONNECTED: CLOUD_RENDER_01</p>
                </div>
                <div className="text-right">
                  <p className="text-tech opacity-60">Uptime</p>
                  <p className="text-xs font-mono">99.999%</p>
                </div>
              </div>

              <div className="aspect-square relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-[2px] border-dashed border-var(--gold)/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 border border-dashed border-var(--gold)/10 rounded-full"
                />
                
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-var(--gold) to-var(--gold-dark) flex items-center justify-center shadow-[0_0_50px_rgba(8,145,178,0.3)]"
                  >
                    <HiOutlineBeaker size={64} className="text-white" />
                  </motion.div>
                  <p className="mt-8 font-display text-4xl text-gradient-gold">Active</p>
                  <p className="text-tech mt-2">Fabric_Synthesis_In_Progress</p>
                </div>

                {/* Floating Data Points */}
                {floatingDataPoints.map((pt, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, delay: idx * 0.5, repeat: Infinity }}
                    className="absolute hud-element px-3 py-1.5 rounded-lg text-[8px] font-mono text-var(--gold)"
                    style={{ top: pt.t, bottom: pt.b, left: pt.l, right: pt.r }}
                  >
                    {pt.label}::{pt.value}%
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              style={{ x: x1 }}
              className="absolute -bottom-20 -left-20 w-80 h-80 border border-var(--gold)/5 rounded-full pointer-events-none" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
