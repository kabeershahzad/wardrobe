'use client';
import { useState, useEffect, useRef } from 'react';

export default function TryOn360Viewer({ frames = [], delay = 500 }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef(null);
  const resumeRef = useRef(null);
  const dragStartX = useRef(0);
  const dragStartIdx = useRef(0);
  const total = frames.length;

  useEffect(() => {
    if (total === 0) return;

    setLoaded(false);
    setLoadProgress(0);
    setIndex(0);

    let done = 0;
    frames.forEach((src) => {
      const img = new window.Image();
      const onDone = () => {
        done += 1;
        const pct = Math.round((done / total) * 100);
        setLoadProgress(pct);
        if (done === total) setLoaded(true);
      };

      img.onload = onDone;
      img.onerror = onDone;
      img.src = src;
    });
  }, [frames, total]);

  useEffect(() => {
    if (!loaded || !isPlaying || isDragging || total === 0) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, delay);

    return () => clearInterval(timerRef.current);
  }, [loaded, isPlaying, isDragging, total, delay]);

  const startDrag = (clientX) => {
    clearInterval(timerRef.current);
    clearTimeout(resumeRef.current);
    setIsDragging(true);
    setIsPlaying(false);
    dragStartX.current = clientX;
    dragStartIdx.current = index;
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || total === 0) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const delta = Math.round((dragStartX.current - x) / 8);
      setIndex(((dragStartIdx.current + delta) % total + total) % total);
    };

    const onUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      resumeRef.current = setTimeout(() => setIsPlaying(true), 1100);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, total]);

  if (total === 0 || !loaded) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-[20px] border"
        style={{
          height: 420,
          background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-primary))',
          borderColor: 'var(--border)',
        }}
      >
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'color-mix(in srgb, var(--gold) 32%, transparent)' }} />
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
        </div>

        <p className="font-display text-xl text-[var(--text-primary)] mb-1">
          {total === 0 ? 'Generating 360 view' : `Loading frames ${loadProgress}%`}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {total === 0 ? 'Preparing multi-angle output' : `${total} frames in buffer`}
        </p>
      </div>
    );
  }

  const progress = total > 1 ? (index / (total - 1)) * 100 : 0;

  return (
    <div className="w-full select-none">
      <div
        className="relative rounded-[20px] overflow-hidden border"
        style={{
          background: '#0f0f10',
          borderColor: 'color-mix(in srgb, var(--gold) 30%, var(--border))',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX);
        }}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      >
        <img
          src={frames[index]}
          alt="360 view"
          draggable={false}
          style={{ display: 'block', width: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.34), transparent 40%)' }} />

        <div className="absolute top-3 left-3" style={{ zIndex: 5 }}>
          <span className="font-mono text-[10px] text-white bg-black/55 px-2.5 py-1 rounded-full tracking-[0.16em] uppercase">
            360 mode
          </span>
        </div>

        <button
          style={{ zIndex: 5 }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/55 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            clearTimeout(resumeRef.current);
            setIsPlaying((p) => !p);
          }}
        >
          {isPlaying ? (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="white"><rect x="1" y="1" width="3.5" height="9" rx="1" /><rect x="6.5" y="1" width="3.5" height="9" rx="1" /></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="white"><path d="M2 1l8 4.5L2 10V1z" /></svg>
          )}
        </button>

        <div className="absolute bottom-3 inset-x-0 flex justify-center" style={{ zIndex: 5, pointerEvents: 'none' }}>
          <div className="flex items-center gap-1.5 bg-black/55 px-3 py-1 rounded-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M18 8L22 12L18 16M6 8L2 12L6 16M2 12H22" />
            </svg>
            <span className="font-mono text-[10px] text-white tracking-[0.12em] uppercase">Drag to rotate</span>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), #c6a47f)',
              transition: 'width 80ms linear',
            }}
          />
        </div>

        <div className="flex justify-between mt-2 px-1">
          {['Front', '3/4 R', 'Side', 'Back', 'Side', '3/4 L'].map((label, i) => {
            const target = Math.round((i / 6) * (total - 1));
            const active = Math.abs(index - target) <= Math.max(1, Math.floor(total / 12));
            return (
              <button
                key={label}
                className={`font-mono text-[10px] px-1 transition-colors ${active ? 'text-[var(--gold-dark)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                onClick={() => {
                  clearInterval(timerRef.current);
                  setIndex(target);
                  setIsPlaying(false);
                  clearTimeout(resumeRef.current);
                  resumeRef.current = setTimeout(() => setIsPlaying(true), 1800);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center font-mono text-[10px] text-[var(--text-muted)] mt-1.5 uppercase tracking-[0.1em]">
        {index + 1}/{total} {isPlaying ? '| Playing' : '| Paused'}
      </p>
    </div>
  );
}
