import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { assetUrl } from '../api/axios';
import { formatPrice, getDisplayPrice } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = memo(({ product, index = 0 }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const { price, original, discount } = getDisplayPrice(product);
  const outOfStock = Number(product?.stock) <= 0;
  const wished = isWishlisted(product._id);
  const rating = product.rating || 4;

  const onAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const result = await addToCart(product._id);
    if (result.needsAuth) navigate('/login', { state: { from: `/product/${product._id}` } });
  };

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${product._id}` } });
      return;
    }
    await toggleWishlist(product._id);
  };

  return (
    <motion.article
      className="pcard"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/product/${product._id}`} className="pcard-media">
        {discount > 0 && <span className="badge badge-sale pcard-badge">-{discount}%</span>}
        {outOfStock && <span className="badge badge-out pcard-badge-alt">Sold out</span>}
        <img
          src={assetUrl(product.image)}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
          }}
        />
        <div className="pcard-overlay" />
        <div className="pcard-actions">
          <motion.button
            type="button"
            className={`btn-icon pcard-wish ${wished ? 'active' : ''}`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={onWish}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
          </motion.button>
          <Link
            to={`/product/${product._id}`}
            className="btn btn-sm btn-outline pcard-quick"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={14} /> Quick view
          </Link>
          <motion.button
            type="button"
            className="btn btn-sm btn-accent"
            onClick={onAdd}
            disabled={outOfStock}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag size={14} /> Add
          </motion.button>
        </div>
      </Link>
      <div className="pcard-body">
        <p className="pcard-brand">{product.brand || product.type || 'StepStyle'}</p>
        <Link to={`/product/${product._id}`} className="pcard-title">
          {product.title}
        </Link>
        <div className="pcard-rating" aria-label={`Rating ${rating} out of 5`}>
          <Star size={12} fill="var(--gold)" color="var(--gold)" />
          <span>{Number(rating).toFixed(1)}</span>
        </div>
        <div className="pcard-price">
          {original && <span className="price-old">{formatPrice(original)}</span>}
          <span className="price">{formatPrice(price)}</span>
        </div>
        {product.color && (
          <div className="pcard-swatches" aria-hidden="true">
            <span className="swatch" style={{ background: product.color.toLowerCase() }} title={product.color} />
          </div>
        )}
      </div>
    </motion.article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
