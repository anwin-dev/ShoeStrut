import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { assetUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getDisplayPrice } from '../utils/format';
import './Wishlist.css';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/product/wishlist');
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Sign in to view wishlist</h3>
          <p>Save styles you love and shop them later.</p>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const remove = async (id) => {
    try {
      await api.delete(`/product/remove-wishlist/${id}/`);
      toast.success('Removed from wishlist');
      load();
    } catch {
      toast.error('Could not remove item');
    }
  };

  return (
    <div className="container wish-page">
      <header className="fade-up">
        <p className="eyebrow">Saved</p>
        <h1>Wishlist</h1>
      </header>

      {loading ? (
        <div className="wish-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 180 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No saved items yet</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Explore shop
          </Link>
        </div>
      ) : (
        <div className="wish-grid">
          {products.map((product) => {
            const { price, original } = getDisplayPrice(product);
            return (
              <article key={product._id} className="wish-card card">
                <Link to={`/product/${product._id}`}>
                  <img
                    src={assetUrl(product.image)}
                    alt={product.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80';
                    }}
                  />
                </Link>
                <div>
                  <Link to={`/product/${product._id}`}>
                    <h3>{product.title}</h3>
                  </Link>
                  <p>
                    {original && <span className="price-old">{formatPrice(original)}</span>}
                    <span className="price">{formatPrice(price)}</span>
                  </p>
                  <div className="wish-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={async () => {
                        const result = await addToCart(product._id);
                        if (result.needsAuth) navigate('/login');
                      }}
                    >
                      Move to bag
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(product._id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
