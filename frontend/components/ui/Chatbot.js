'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChatAlt2, HiOutlineX, HiOutlinePaperAirplane, 
  HiOutlineSparkles, HiOutlineShoppingBag
} from 'react-icons/hi';
import { assistantAPI, getImageUrl } from '../../lib/api';
import Link from 'next/link';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Wardrobe X. I am your personal AI stylist. How may I assist you in finding your perfect look today?', suggestions: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = { role: 'user', content: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await assistantAPI.chat({ message, history });
      
      const assistantMsg = { 
        role: 'assistant', 
        content: data.text, 
        suggestions: data.suggestions || [] 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I am experiencing a brief connection issue. Please try again in a moment.',
        suggestions: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="pointer-events-auto w-[calc(100vw-32px)] sm:w-[340px] h-[55vh] sm:h-[450px] mb-4 rounded-3xl border overflow-hidden shadow-2xl flex flex-col relative"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
            }}
          >
            {/* Header - Compact */}
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--purple-dark), var(--purple))' }}>
                  <HiOutlineSparkles className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>AI Stylist</h3>
                  <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--purple)' }}>Bespoke Service</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              >
                <HiOutlineX size={14} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ background: 'var(--bg-primary)' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'font-semibold rounded-tr-none text-white' 
                      : 'border rounded-tl-none'
                  }`}
                  style={msg.role === 'user' ? {
                    background: 'var(--purple)',
                  } : {
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}>
                    <p>{msg.content}</p>
                    
                    {msg.suggestions?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.suggestions.map((s, idx) => (
                          <div key={idx} className="rounded-lg border p-2 flex items-center gap-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                            <div className="w-10 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--bg-tertiary)' }}>
                              {s.product?.image && <img src={getImageUrl(s.product.image)} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-[9px] font-bold truncate uppercase" style={{ color: 'var(--text-primary)' }}>{s.product?.name}</p>
                              <Link href={`/shop/${s.product?._id}`} className="text-[8px] font-bold uppercase tracking-widest hover:underline" style={{ color: 'var(--purple)' }}>View Piece</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="border rounded-xl p-2 flex gap-1" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--purple)' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--purple)', animationDelay: '0.2s' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--purple)', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your stylist..."
                  className="flex-1 border rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-all"
                  style={{ 
                    background: 'var(--bg-primary)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-sm"
                  style={{ 
                    background: 'var(--purple)',
                    color: 'white',
                    opacity: (!message.trim() || loading) ? 0.5 : 1
                  }}
                >
                  <HiOutlinePaperAirplane className="rotate-90" size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 hover:scale-105 active:scale-95`}
        style={{ 
          background: isOpen ? 'var(--bg-primary)' : 'var(--purple)',
          color: isOpen ? 'var(--purple)' : 'white',
          border: isOpen ? '1px solid var(--purple)' : 'none'
        }}
      >
        {isOpen ? <HiOutlineX size={24} /> : <HiOutlineChatAlt2 size={28} />}
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--purple); opacity: 0.2; border-radius: 10px; }
      `}</style>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
