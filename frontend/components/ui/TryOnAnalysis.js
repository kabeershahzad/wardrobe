'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getImageUrl } from '../../lib/api';

const Score = ({ value }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 10}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: value >= 8 ? '#22c55e' : value >= 6 ? '#d4af37' : '#ef4444' }}
            />
        </div>
        <span className="font-mono text-sm font-bold" style={{
            color: value >= 8 ? '#22c55e' : value >= 6 ? '#d4af37' : '#ef4444'
        }}>{value}/10</span>
    </div>
);

const Badge = ({ label, color = 'gold' }) => {
    const colors = {
        gold: 'bg-gold-500/15 text-gold-400 border-gold-500/30',
        green: 'bg-green-500/15 text-green-400 border-green-500/30',
        red: 'bg-red-500/15 text-red-400 border-red-500/30',
        blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.gold}`}>
            {label}
        </span>
    );
};

const fitColor = f => f === 'Excellent' ? 'green' : f === 'Good' ? 'gold' : 'red';
const matchColor = m => m === 'Excellent' ? 'green' : m === 'Good' ? 'gold' : m === 'Fair' ? 'blue' : 'red';

export default function TryOnAnalysis({ analysis, onClose }) {
    if (!analysis) return null;
    const { fabricAnalysis, colourAnalysis, fitAnalysis, overallVerdict, suggestions } = analysis;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--card-bg)', borderColor: 'rgba(212,175,55,0.3)' }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-full bg-gold-500/15 flex items-center justify-center text-lg shrink-0">🧠</div>
                <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">AI Stylist Analysis</h3>
                    <p className="text-xs text-[var(--text-muted)]">Fabric · Colour · Fit · Store Picks</p>
                </div>
                <button onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 2l12 12M14 2L2 14" />
                    </svg>
                </button>
            </div>

            <div className="p-5 space-y-5">

                {/* Overall verdict */}
                {overallVerdict && (
                    <div className={`p-4 rounded-xl border ${overallVerdict.looksGood
                            ? 'border-green-500/25 bg-green-500/5'
                            : 'border-amber-500/25 bg-amber-500/5'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{overallVerdict.looksGood ? '✨' : '🤔'}</span>
                            <p className="font-semibold text-sm text-[var(--text-primary)]">
                                {overallVerdict.looksGood ? 'This looks great on you!' : "Stylist's honest take"}
                            </p>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{overallVerdict.summary}</p>
                        {overallVerdict.occasions?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {overallVerdict.occasions.map(o => <Badge key={o} label={o} color="blue" />)}
                            </div>
                        )}
                    </div>
                )}

                {/* Style score */}
                {fitAnalysis?.styleScore && (
                    <div>
                        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Style Score</p>
                        <Score value={fitAnalysis.styleScore} />
                    </div>
                )}

                {/* 3-column cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {fabricAnalysis && (
                        <div className="p-3.5 rounded-xl border border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Fabric</p>
                            <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">{fabricAnalysis.material}</p>
                            <p className="text-xs text-[var(--text-muted)] mb-2 leading-relaxed">{fabricAnalysis.texture}</p>
                            <Badge label={fabricAnalysis.quality} color="gold" />
                        </div>
                    )}
                    {colourAnalysis && (
                        <div className="p-3.5 rounded-xl border border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Colour</p>
                            <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">{colourAnalysis.dominant}</p>
                            <p className="text-xs text-[var(--text-muted)] mb-2">
                                Skin tone match: <span className="font-semibold">{colourAnalysis.skinToneMatch}</span>
                            </p>
                            <Badge label={colourAnalysis.skinToneMatch} color={matchColor(colourAnalysis.skinToneMatch)} />
                        </div>
                    )}
                    {fitAnalysis && (
                        <div className="p-3.5 rounded-xl border border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Fit</p>
                            <Badge label={fitAnalysis.overallFit} color={fitColor(fitAnalysis.overallFit)} />
                            <ul className="mt-2 space-y-1">
                                {fitAnalysis.positives?.slice(0, 2).map(p => (
                                    <li key={p} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                                        <span className="text-green-400 shrink-0 mt-0.5">✓</span>{p}
                                    </li>
                                ))}
                                {fitAnalysis.concerns?.slice(0, 1).map(c => (
                                    <li key={c} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                                        <span className="text-amber-400 shrink-0 mt-0.5">!</span>{c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Skin tone detail */}
                {colourAnalysis?.skinToneReason && (
                    <div className="p-3 rounded-xl border border-[var(--border)] bg-blue-500/5">
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            <span className="text-blue-400 font-semibold">Colour & skin: </span>
                            {colourAnalysis.skinToneReason}
                        </p>
                    </div>
                )}

                {/* ── Store suggestions ────────────────────────────────────────────── */}
                {suggestions?.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest px-2">
                                🛍️ Suggested from our store
                            </p>
                            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        </div>

                        <div className="space-y-3">
                            {suggestions.map((s, i) => {
                                const imgSrc = s.product?.gridId
                                    ? getImageUrl(s.product.gridId)
                                    : null;

                                return (
                                    <motion.div
                                        key={s.productId || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 * i }}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-gold-500/40 transition-all group"
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]"
                                            style={{ background: 'var(--bg-tertiary)' }}>
                                            {imgSrc ? (
                                                <img src={imgSrc} alt={s.product?.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                                                {s.product?.name || s.productName}
                                            </p>
                                            <p className="text-xs text-gold-500 capitalize mt-0.5 mb-1">
                                                {s.product?.category}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                                                {s.reason}
                                            </p>
                                        </div>

                                        {/* CTA */}
                                        <div className="shrink-0 text-right space-y-1.5">
                                            <p className="font-bold text-sm text-[var(--text-primary)] whitespace-nowrap">
                                                PKR {s.product?.price?.toLocaleString()}
                                            </p>
                                            <Link
                                                href={`/tryon?product=${s.product?._id}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full btn-gold"
                                            >
                                                Try on →
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* No suggestions fallback */}
                {(!suggestions || suggestions.length === 0) && (
                    <div className="text-center py-4">
                        <p className="text-sm text-[var(--text-muted)]">
                            No store suggestions available right now.
                        </p>
                        <Link href="/shop"
                            className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-gold-500 hover:text-gold-400 transition-colors">
                            Browse full collection →
                        </Link>
                    </div>
                )}

            </div>
        </motion.div>
    );
}