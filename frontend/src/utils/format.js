export const formatPrice = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const getDisplayPrice = (product) => {
  if (!product) return { price: 0, original: null, discount: 0 };
  const original = Number(product.Price) || 0;
  const offer = Number(product.offerPrice) || 0;
  const hasOffer = offer > 0 && offer < original;
  const price = hasOffer ? offer : original;
  const discount =
    hasOffer
      ? Math.round(((original - offer) / original) * 100)
      : Number(product.discountPercentage) || 0;
  return { price, original: hasOffer ? original : null, discount };
};

export const trackRecentlyViewed = (product) => {
  if (!product?._id || typeof window === 'undefined') return;
  try {
    const key = 'ss_recent';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [product, ...prev.filter((p) => p._id !== product._id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('ss_recent') || '[]');
  } catch {
    return [];
  }
};
