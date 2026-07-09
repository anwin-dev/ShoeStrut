import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { assetUrl } from '../api/axios';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, drawerOpen, setDrawerOpen, updateQty, removeItem, loading } = useCart();
  const items = cart?.products || [];
  const subtotal = Number(cart?.total) || items.reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <>
      <div
        className={`cart-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <header className="cart-drawer-head">
          <div>
            <p className="eyebrow">Your bag</p>
            <h2>{items.length} item{items.length === 1 ? '' : 's'}</h2>
          </div>
          <button type="button" className="btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="cart-drawer-body">
          {loading && items.length === 0 && <div className="skeleton" style={{ height: 120 }} />}
          {!loading && items.length === 0 && (
            <div className="empty-state">
              <h3>Your bag is empty</h3>
              <p>Discover footwear crafted for movement and presence.</p>
              <Link to="/shop" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
                Browse collection
              </Link>
            </div>
          )}
          {items.map((item) => (
            <div className="cart-line" key={item._id}>
              <img
                src={assetUrl(item.image)}
                alt={item.title}
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
                    <button type="button" onClick={() => updateQty(item._id, 'decrement')} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item._id, 'increment')} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button type="button" className="remove" onClick={() => removeItem(item._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer-foot">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <Link to="/cart" className="btn btn-outline w-full" onClick={() => setDrawerOpen(false)}>
              View cart
            </Link>
            <Link to="/checkout" className="btn btn-primary w-full" onClick={() => setDrawerOpen(false)}>
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
