import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import './Cart.css';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateQty, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const items = cart?.products || [];
  const subtotal = Number(cart?.total) || items.reduce((s, i) => s + Number(i.total || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Sign in to view your bag</h3>
          <p>Your saved items will appear here after login.</p>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <header className="cart-head fade-up">
        <p className="eyebrow">Bag</p>
        <h1>Your cart</h1>
      </header>

      {loading && items.length === 0 ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse the collection and add a pair you love.</p>
          <Link to="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list card">
            {items.map((item) => (
              <div className="cart-row" key={item._id}>
                <img
                  src={assetUrl(item.image)}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
                  }}
                />
                <div>
                  <h3>{item.title}</h3>
                  <p>{formatPrice(item.Price)}</p>
                  <div className="cart-row-actions">
                    <div className="qty">
                      <button type="button" onClick={() => updateQty(item._id, 'decrement')}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item._id, 'increment')}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button type="button" className="remove" onClick={() => removeItem(item._id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <strong>{formatPrice(item.total)}</strong>
              </div>
            ))}
          </div>

          <aside className="cart-summary card">
            <h3>Order summary</h3>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="summary-line muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={async () => {
                try {
                  await api.get('/product/checkout/verify');
                  await refreshCart();
                } catch {
                  // still allow navigation; checkout page re-verifies
                }
                navigate('/checkout');
              }}
            >
              Proceed to checkout
            </button>
            <Link to="/shop" className="btn btn-ghost w-full">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
