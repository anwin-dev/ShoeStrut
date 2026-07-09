import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import api from '../api/axios';
import Hero from '../components/Hero';
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
      <Hero />

      <section className="trust container">
        {[
          { icon: Truck, title: 'Fast delivery', desc: 'Estimated 3–5 day dispatch' },
          { icon: ShieldCheck, title: 'Secure payments', desc: 'Razorpay + COD options' },
          { icon: RefreshCcw, title: 'Easy returns', desc: '7-day exchange window' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <item.icon size={22} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </motion.div>
        ))}
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
            {products.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
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
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/shop?category=${cat._id}`} className="cat-tile">
                  <span>{cat.name}</span>
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
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
            {recent.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
