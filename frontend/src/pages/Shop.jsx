import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'Featured' },
  { label: 'Price: Low to High', value: 'Low to High' },
  { label: 'Price: High to Low', value: 'High to Low' },
  { label: 'Newest', value: 'New newArrivals' },
  { label: 'A–Z', value: 'aA-zZ' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'Featured';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    const run = async () => {
      try {
        if (q) {
          const { data } = await api.post('/product/shopSearch', { search: q });
          if (!alive) return;
          console.log('[Shop] shopSearch response count=', Array.isArray(data) ? data.length : 0);
          setProducts(Array.isArray(data) ? data : []);
          setTotalPages(1);
          setPage(1);
        } else if (category) {
          const { data } = await api.get('/product/categoryFiltering', {
            params: { category },
          });
          if (!alive) return;
          console.log('[Shop] categoryFiltering response count=', Array.isArray(data) ? data.length : 0);
          setProducts(Array.isArray(data) ? data : []);
          setTotalPages(1);
        } else if (sort && sort !== 'Featured') {
          const { data } = await api.post('/product/ShopPageSort', { sortOption: sort });
          if (!alive) return;
          console.log('[Shop] ShopPageSort response count=', Array.isArray(data) ? data.length : 0);
          setProducts(Array.isArray(data) ? data : []);
          setTotalPages(1);
        } else {
          const { data } = await api.get('/product/shop', { params: { page, limit: 8 } });
          if (!alive) return;
          console.log('[Shop] shop response product count=', data.product?.length || 0, 'categories=', data.categories?.length || 0);
          setProducts(data.product || []);
          setCategories(data.categories || []);
          setTotalPages(data.totalPages || 1);
        }

        if (!categories.length) {
          const shopMeta = await api.get('/product/shop', { params: { page: 1, limit: 1 } });
          if (alive) setCategories(shopMeta.data.categories || []);
        }
      } catch (err) {
        if (!alive) return;
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load products');
        setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, q, sort]);

  useEffect(() => {
    console.log('[Shop] rendered product count=', products.length);
  }, [products]);

  const activeCategoryName = useMemo(() => {
    return categories.find((c) => c._id === category)?.name;
  }, [categories, category]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'sort') next.delete('sort');
    setPage(1);
    setSearchParams(next);
  };

  return (
    <div className="shop-page container">
      <header className="shop-hero fade-up">
        <div>
          <p className="eyebrow">Collection</p>
          <h1>{q ? `Results for “${q}”` : activeCategoryName || 'All footwear'}</h1>
          <p>Find the pair that moves with you — filter by category or sort the edit.</p>
        </div>
      </header>

      <div className="shop-layout">
        <aside className="shop-filters card">
          <h3>Filters</h3>
          <button
            type="button"
            className={`filter-chip ${!category ? 'active' : ''}`}
            onClick={() => {
              setFilter('category', '');
              setFilter('q', '');
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`filter-chip ${category === cat._id ? 'active' : ''}`}
              onClick={() => {
                setFilter('q', '');
                setFilter('category', cat._id);
              }}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        <section className="shop-main">
          <div className="shop-toolbar">
            <p>{loading ? 'Loading…' : `${products.length} styles`}</p>
            <select
              className="form-control sort-select"
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              disabled={Boolean(q || category)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 340 }} />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try another search or clear filters.</p>
              <button type="button" className="btn btn-primary" onClick={() => setSearchParams({})}>
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {!q && !category && sort === 'Featured' && totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
