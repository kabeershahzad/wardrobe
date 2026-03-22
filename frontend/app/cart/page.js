'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineShoppingBag, HiOutlineTrash, HiOutlineArrowRight, HiOutlineSparkles } from 'react-icons/hi';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQty, clearCart, cartTotal } = useStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ name: '', street: '', city: '', country: 'Pakistan', postalCode: '', phone: '' });

  const shippingCost = cartTotal >= 5000 ? 0 : 250;
  const total = cartTotal + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to checkout'); router.push('/auth/login'); return; }
    setCheckingOut(true);
    try {
      const orderItems = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        size: item.size,
        color: item.color,
        quantity: item.qty,
        image: item.product.images?.[0]?.url || '',
      }));
      const { data } = await ordersAPI.create({
        items: orderItems,
        shippingAddress: shipping,
        paymentMethod: 'COD',
        subtotal: cartTotal,
        shippingCost,
        total,
      });
      clearCart();
      toast.success(`Order #${data.order.orderNumber} placed! 🎉`);
      router.push('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally { setCheckingOut(false); }
  };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="font-mono text-xs text-gold-500 tracking-widest uppercase">Shopping</span>
          <h1 className="font-display text-5xl font-bold text-[var(--text-primary)] mt-1">Your Cart</h1>
        </motion.div>

        {cart.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineShoppingBag size={32} className="text-gold-500/50" />
            </div>
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">Your cart is empty</h3>
            <p className="text-[var(--text-secondary)] mb-6">Add some beautiful pieces to get started</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold font-semibold text-sm">
              Browse Collection <HiOutlineArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item, i) => {
                  const img = item.product.images?.[0];
                  const imageUrl = img?.gridId ? getImageUrl(img.gridId) : img?.url;
                  return (
                    <motion.div key={`${item.product._id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}
                      className="flex gap-4 p-4 rounded-2xl border border-[var(--border)]"
                      style={{ background: 'var(--card-bg)' }}>
                      <Link href={`/shop/${item.product._id}`} className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-secondary)]">
                        {imageUrl && <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.product._id}`}>
                          <h3 className="font-display font-semibold text-[var(--text-primary)] hover:text-gold-500 transition-colors line-clamp-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="flex gap-3 mt-1 mb-3 text-xs text-[var(--text-muted)] font-mono">
                          <span>Size: {item.size}</span>
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
                            <button onClick={() => updateQty(item.product._id, item.size, item.color, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gold-500/10 text-[var(--text-secondary)] transition-colors">−</button>
                            <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.product._id, item.size, item.color, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gold-500/10 text-[var(--text-secondary)] transition-colors">+</button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-display font-bold text-[var(--text-primary)]">
                              PKR {(item.product.price * item.qty).toLocaleString()}
                            </span>
                            <button onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                              className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                              <HiOutlineTrash size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary + Checkout */}
            <div className="space-y-5">
              <div className="p-6 rounded-2xl border border-gold-500/20 sticky top-24"
                style={{ background: 'var(--card-bg)' }}>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-5">Order Summary</h2>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-400' : ''}>
                      {shippingCost === 0 ? 'FREE' : `PKR ${shippingCost}`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-gold-500">Add PKR {(5000 - cartTotal).toLocaleString()} more for free shipping</p>
                  )}
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex justify-between font-display text-lg font-bold text-[var(--text-primary)]">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                {step === 1 ? (
                  <button onClick={() => {
                    if (!user) { toast.error('Please login'); router.push('/auth/login'); return; }
                    setStep(2);
                  }} className="w-full py-4 rounded-xl btn-gold font-semibold flex items-center justify-center gap-2">
                    Proceed to Checkout <HiOutlineArrowRight size={18} />
                  </button>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-3">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">Shipping Address</h3>
                    {[
                      { key: 'name', placeholder: 'Full Name' },
                      { key: 'phone', placeholder: 'Phone Number' },
                      { key: 'street', placeholder: 'Street Address' },
                      { key: 'city', placeholder: 'City' },
                      { key: 'postalCode', placeholder: 'Postal Code' },
                    ].map(({ key, placeholder }) => (
                      <input key={key} type="text" placeholder={placeholder} required
                        value={shipping[key]} onChange={e => setShipping(s => ({ ...s, [key]: e.target.value }))}
                        className="input-luxury w-full px-4 py-2.5 rounded-xl text-sm" />
                    ))}
                    <button type="submit" disabled={checkingOut}
                      className="w-full py-3.5 rounded-xl btn-gold font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                      {checkingOut ? 'Placing Order...' : 'Place Order (COD)'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      ← Back to cart
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
