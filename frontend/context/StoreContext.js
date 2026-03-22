'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const StoreContext = createContext({});

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wx_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) loadWishlist();
    else setWishlist([]);
  }, [user]);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('wx_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, size, color, qty = 1) => {
    const existingIdx = cart.findIndex(i => i.product._id === product._id && i.size === size && i.color === color);
    let newCart;
    if (existingIdx > -1) {
      newCart = cart.map((item, idx) =>
        idx === existingIdx ? { ...item, qty: item.qty + qty } : item
      );
    } else {
      newCart = [...cart, { product, size, color, qty }];
    }
    saveCart(newCart);
    toast.success('Added to cart!');
  };

  const removeFromCart = (productId, size, color) => {
    saveCart(cart.filter(i => !(i.product._id === productId && i.size === size && i.color === color)));
  };

  const updateQty = (productId, size, color, qty) => {
    if (qty < 1) return removeFromCart(productId, size, color);
    saveCart(cart.map(i =>
      i.product._id === productId && i.size === size && i.color === color ? { ...i, qty } : i
    ));
  };

  const clearCart = () => saveCart([]);

  const cartTotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const loadWishlist = async () => {
    setWishlistLoading(true);
    try {
      const { data } = await wishlistAPI.get();
      setWishlist(data.wishlist?.items?.map(i => i.product?._id || i.product) || []);
    } catch {} finally {
      setWishlistLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Please login to use wishlist'); return; }
    try {
      const { data } = await wishlistAPI.toggle(productId);
      if (data.added) {
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist ♡');
      } else {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating wishlist');
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount,
      wishlist, toggleWishlist, isWishlisted, wishlistLoading, loadWishlist
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
