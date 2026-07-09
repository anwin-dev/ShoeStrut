import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { assetUrl } from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getDisplayPrice, trackRecentlyViewed } from '../utils/format';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/product/details/${id}`)
      .then(({ data }) => {
        if (!alive) return;
        setProduct(data.product);
        setRelated(data.relatedProducts || []);
        trackRecentlyViewed(data.product);
      })
      .catch(() => {
        if (alive) setProduct(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container pd-page">
        <div className="pd-grid">
          <div className="skeleton" style={{ minHeight: 480 }} />
          <div className="skeleton" style={{ minHeight: 320 }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>This style may have been removed.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const { price, original, discount } = getDisplayPrice(product);
  const outOfStock = Number(product.stock) <= 0;

  const onAdd = async () => {
    const result = await addToCart(product._id);
    if (result.needsAuth) {
      navigate('/login');
      return;
    }
    if (!result.ok) return;
    // Extra units via quantity endpoint after first insert
    if (qty > 1) {
      try {
        const { data } = await api.get('/product/cart');
        const line = data?.data?.cartData?.products?.find(
          (p) => String(p.productId) === String(product._id)
        );
        if (line?._id) {
          for (let i = 1; i < qty; i++) {
            // eslint-disable-next-line no-await-in-loop
            await api.post(`/product/updateQuantity/${line._id}`, { action: 'increment' });
          }
          toast.success(`Added ${qty} to bag`);
        }
      } catch {
        // first item already added
      }
    }
  };

  const onWish = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items');
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.get(`/product/addWhislis/${product._id}`);
      if (data.status === 'included') toast('Already in wishlist');
      else toast.success('Saved to wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <div className="container pd-page">
      <div className="pd-grid fade-up">
        <div
          className={`pd-gallery ${zoom ? 'zoomed' : ''}`}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
        >
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
          <img
            src={assetUrl(product.image)}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80';
            }}
          />
        </div>

        <div className="pd-info">
          <p className="eyebrow">{product.brand || 'StepStyle'}</p>
          <h1>{product.title}</h1>
          <div className="pd-price">
            {original && <span className="price-old">{formatPrice(original)}</span>}
            <span className="price">{formatPrice(price)}</span>
          </div>

          <div className="pd-meta">
            <span className={`badge ${outOfStock ? 'badge-out' : 'badge-stock'}`}>
              {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </span>
            {product.color && <span>Color: {product.color}</span>}
            {product.size && <span>Size: {product.size}</span>}
          </div>

          <p className="pd-desc">{product.description || 'Premium footwear crafted for everyday movement.'}</p>

          <div className="pd-delivery">
            <Truck size={18} />
            <div>
              <strong>Estimated delivery</strong>
              <p>3–5 business days after dispatch</p>
            </div>
          </div>

          <div className="pd-actions">
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(5, q + 1))} aria-label="Increase">
                <Plus size={16} />
              </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={onAdd} disabled={outOfStock}>
              <ShoppingBag size={16} /> Add to bag
            </button>
            <button type="button" className="btn btn-outline" onClick={onWish}>
              <Heart size={16} /> Wishlist
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pd-related">
          <div className="section-head">
            <div>
              <p className="eyebrow">More to explore</p>
              <h2>Related styles</h2>
            </div>
          </div>
          <div className="product-grid related-grid">
            {related
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
