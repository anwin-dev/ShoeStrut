import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { getRecentlyViewed } from '../utils/format';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let alive = true;
    setRecent(getRecentlyViewed());
    api
      .get('/product/shop', { params: { page: 1, limit: 8 } })
      .then(({ data }) => {
        if (!alive) return;
        setProducts(data.newArrivals?.length ? data.newArrivals : data.product || []);
        setCategories(data.categories || []);
      })
      .catch(() => {
        if (alive) {
          setProducts([]);
          setCategories([]);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy container fade-up">
          <p className="hero-kicker">StepStyle Collection 2026</p>
          <h1>StepStyle</h1>
          <p className="hero-sub">
            Footwear with presence — quiet confidence, daily comfort, and details that feel
            intentional.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-primary">
              Shop the edit <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn btn-outline">
              Join StepStyle
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orb" />
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80"
            alt=""
          />
        </div>
      </section>

      <section className="trust container">
        <div>
          <Truck size={20} />
          <div>
            <h3>Fast delivery</h3>
            <p>Estimated 3–5 day dispatch</p>
          </div>
        </div>
        <div>
          <ShieldCheck size={20} />
          <div>
            <h3>Secure payments</h3>
            <p>Razorpay + COD options</p>
          </div>
        </div>
        <div>
          <RefreshCcw size={20} />
          <div>
            <h3>Easy returns</h3>
            <p>7-day exchange window</p>
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Curated</p>
            <h2>New arrivals</h2>
          </div>
          <Link to="/shop" className="btn btn-ghost">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 360 }} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="container home-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Browse</p>
              <h2>Categories</h2>
            </div>
          </div>
          <div className="cat-grid">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/shop?category=${cat._id}`} className="cat-tile">
                <span>{cat.name}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="container home-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Continue</p>
              <h2>Recently viewed</h2>
            </div>
          </div>
          <div className="product-grid">
            {recent.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
