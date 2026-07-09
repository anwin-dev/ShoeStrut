import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { assetUrl } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, getDisplayPrice } from '../utils/format';
import './Wishlist.css';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { items, loading, removeFromWishlist } = useWishlist();

  return (
    <div className="container wish-page">
      <motion.header
        className="wish-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="eyebrow">Saved</p>
        <h1>Wishlist</h1>
        <p className="wish-sub">{items.length} item{items.length === 1 ? '' : 's'} saved</p>
      </motion.header>

      {loading ? (
        <div className="wish-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          className="empty-state wish-empty"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-illustration"><Heart size={48} strokeWidth={1.2} /></div>
          <h3>No saved items yet</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-accent">
            Explore shop
          </Link>
        </motion.div>
      ) : (
        <div className="wish-grid">
          {items.map((product, i) => {
            const { price, original } = getDisplayPrice(product);
            return (
              <motion.article
                key={product._id}
                className="wish-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                layout
              >
                <Link to={`/product/${product._id}`} className="wish-img-wrap">
                  <img
                    src={assetUrl(product.image)}
                    alt={product.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80';
                    }}
                  />
                </Link>
                <div className="wish-body">
                  <Link to={`/product/${product._id}`}>
                    <h3>{product.title}</h3>
                  </Link>
                  <p className="wish-brand">{product.brand || 'StepStyle'}</p>
                  <p className="wish-price">
                    {original && <span className="price-old">{formatPrice(original)}</span>}
                    <span className="price">{formatPrice(price)}</span>
                  </p>
                  <div className="wish-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-accent"
                      onClick={() => addToCart(product._id)}
                    >
                      Move to bag
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost wish-remove"
                      onClick={() => removeFromWishlist(product._id)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
