import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ids, setIds] = useState(new Set());

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setCount(0);
      setIds(new Set());
      return [];
    }
    setLoading(true);
    try {
      const { data } = await api.get('/product/wishlist');
      const products = data.products || [];
      setItems(products);
      setCount(products.length);
      setIds(new Set(products.map((p) => String(p._id))));
      return products;
    } catch {
      setItems([]);
      setCount(0);
      setIds(new Set());
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!initializing) {
      refreshWishlist();
    }
  }, [initializing, refreshWishlist]);

  const isWishlisted = useCallback((productId) => ids.has(String(productId)), [ids]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { ok: false, needsAuth: true };
    }
    const id = String(productId);
    if (ids.has(id)) {
      try {
        await api.delete(`/product/remove-wishlist/${productId}/`);
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setItems((prev) => prev.filter((p) => String(p._id) !== id));
        setCount((c) => Math.max(0, c - 1));
        toast.success('Removed from wishlist');
        return { ok: true, removed: true };
      } catch {
        toast.error('Could not remove from wishlist');
        return { ok: false };
      }
    }
    try {
      const { data } = await api.get(`/product/addWhislis/${productId}`);
      if (data.status === 'included') {
        toast('Already in wishlist');
        return { ok: true, already: true };
      }
      await refreshWishlist();
      toast.success('Saved to wishlist');
      return { ok: true, added: true };
    } catch {
      toast.error('Could not update wishlist');
      return { ok: false };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/product/remove-wishlist/${productId}/`);
      const id = String(productId);
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setItems((prev) => prev.filter((p) => String(p._id) !== id));
      setCount((c) => Math.max(0, c - 1));
      toast.success('Removed from wishlist');
      return true;
    } catch {
      toast.error('Could not remove item');
      return false;
    }
  };

  const value = useMemo(
    () => ({
      items,
      count,
      loading,
      ids,
      isWishlisted,
      refreshWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [items, count, loading, ids, isWishlisted, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
