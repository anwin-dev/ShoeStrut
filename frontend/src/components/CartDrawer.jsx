import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { assetUrl } from '../api/axios';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, drawerOpen, setDrawerOpen, updateQty, removeItem, loading } = useCart();
  const items = cart?.products || [];
  const subtotal = Number(cart?.total) || items.reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="cart-backdrop open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <motion.aside
            className="cart-drawer open"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="Shopping cart"
          >
            <header className="cart-drawer-head">
              <div>
                <p className="eyebrow">Your bag</p>
                <h2>{items.length} item{items.length === 1 ? '' : 's'}</h2>
              </div>
              <button type="button" className="btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close cart">
                <X size={18} />
              </button>
            </header>

            <div className="cart-drawer-body">
              {loading && items.length === 0 && <div className="skeleton" style={{ height: 120 }} />}
              {!loading && items.length === 0 && (
                <div className="empty-state cart-empty">
                  <div className="empty-illustration"><ShoppingBag size={48} strokeWidth={1.2} /></div>
                  <h3>Your bag is empty</h3>
                  <p>Discover footwear crafted for movement and presence.</p>
                  <Link to="/shop" className="btn btn-accent" onClick={() => setDrawerOpen(false)}>
                    Browse collection
                  </Link>
                </div>
              )}
              {items.map((item) => (
                <motion.div
                  className="cart-line"
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <img
                    src={assetUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
                    }}
                  />
                  <div className="cart-line-info">
                    <h4>{item.title}</h4>
                    <p>{formatPrice(item.Price)}</p>
                    <div className="cart-line-actions">
                      <div className="qty">
                        <button type="button" onClick={() => updateQty(item._id, 'decrement')} aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item._id, 'increment')} aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button type="button" className="remove" onClick={() => removeItem(item._id)} aria-label="Remove item">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <footer className="cart-drawer-foot">
                <div className="cart-subtotal">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <p className="cart-shipping-note">Shipping calculated at checkout</p>
                <Link to="/cart" className="btn btn-outline w-full" onClick={() => setDrawerOpen(false)}>
                  View cart
                </Link>
                <Link to="/checkout" className="btn btn-accent w-full" onClick={() => setDrawerOpen(false)}>
                  Checkout
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
