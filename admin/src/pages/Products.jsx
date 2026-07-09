import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import { formatPrice } from '../utils/format';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product/list', { params: { page: p, limit: 10 } });
      setProducts(data.data?.product || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const toggleBlock = async (id) => {
    try {
      await api.get('/admin/product/productList', { params: { id } });
      toast.success('Product status updated');
      load(page);
    } catch {
      toast.error('Could not update product');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/admin/product/editDeleteImage/${id}`);
      toast.success('Product deleted');
      load(page);
    } catch {
      toast.error('Could not delete product');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage catalog, stock, and pricing</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>No products</h3>
          <p>Add your first product to get started.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={assetUrl(p.image)} alt="" />
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>{formatPrice(p.offerPrice || p.Price)}</td>
                    <td>
                      <span className={Number(p.stock) <= 5 ? 'badge badge-warning' : ''}>{p.stock}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.isblock ? 'badge-danger' : 'badge-success'}`}>
                        {p.isblock ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/products/${p._id}/edit`} className="btn btn-sm btn-outline">
                          <Pencil size={14} />
                        </Link>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => toggleBlock(p._id)}>
                          <ToggleLeft size={14} />
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(p._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
