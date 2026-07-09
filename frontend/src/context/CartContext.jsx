import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCount(0);
      return null;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/product/cart');
      const cartData = data?.data?.cartData || null;
      setCart(cartData);
      setCount(data?.data?.count || cartData?.products?.length || 0);
      return cartData;
    } catch {
      setCart(null);
      setCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, { openDrawer = true } = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items');
      return { ok: false, needsAuth: true };
    }
    try {
      const { data } = await api.get(`/product/addcart/${productId}`);
      if (data?.data?.cartData) {
        setCart(data.data.cartData);
        setCount(data.data.count || 0);
      } else {
        await refreshCart();
      }
      toast.success('Added to cart');
      if (openDrawer) setDrawerOpen(true);
      return { ok: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      return { ok: false };
    }
  };

  const updateQty = async (lineId, action) => {
    try {
      const { data } = await api.post(`/product/updateQuantity/${lineId}`, { action });
      if (data.status === 'exceeded') {
        toast.error('Not enough stock');
        return;
      }
      if (data.status === 'minimum') {
        toast.error('Maximum 5 per item');
        return;
      }
      await refreshCart();
    } catch {
      toast.error('Could not update quantity');
    }
  };

  const removeItem = async (lineId) => {
    try {
      await api.delete(`/product/remove/${lineId}`);
      await refreshCart();
      toast.success('Removed from cart');
    } catch {
      toast.error('Could not remove item');
    }
  };

  const value = useMemo(
    () => ({
      cart,
      count,
      loading,
      drawerOpen,
      setDrawerOpen,
      refreshCart,
      addToCart,
      updateQty,
      removeItem,
    }),
    [cart, count, loading, drawerOpen, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
