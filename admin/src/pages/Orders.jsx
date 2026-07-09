import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { formatDate } from '../utils/format';
import { ORDER_STATUSES } from '../utils/format';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product/orderList', { params: { page: p, limit: 12 } });
      setOrders(data.data?.orderData || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      load(1);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product/OrderSearch', { params: { query } });
      setOrders(data.data || []);
      setTotalPages(1);
      setPage(1);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (orderId, newStatus) => {
    try {
      await api.post('/admin/product/changeStatus', { orderId, newStatus });
      toast.success('Status updated');
      load(page);
    } catch {
      toast.error('Could not update status');
    }
  };

  const remove = async (mongoId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await api.get(`/admin/product/orderDelete/${mongoId}`);
      toast.success('Order deleted');
      load(page);
    } catch {
      toast.error('Could not delete order');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Track and manage customer orders</p>
        </div>
        <form onSubmit={search} style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-control"
            placeholder="Search by order ID or status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 240 }}
          />
          <button type="submit" className="btn btn-outline">
            <Search size={16} />
          </button>
        </form>
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 320 }} />
      ) : orders.length === 0 ? (
        <div className="empty-state card"><h3>No orders found</h3></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Return</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>#{o.orderId}</td>
                    <td>{o.userId?.username || '—'}</td>
                    <td>{formatDate(o.createdAt || o.orderDate)}</td>
                    <td>{o.billTotal}</td>
                    <td>{o.paymentOption || o.paymentMethod || '—'}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.82rem', minWidth: 120 }}
                        value={o.status}
                        onChange={(e) => changeStatus(o.orderId, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {o.returnRequest ? (
                        <span className="badge badge-warning">Requested</span>
                      ) : (
                        <span className="badge badge-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/orders/${o.orderId}`} className="btn btn-sm btn-outline">
                          <Eye size={14} />
                        </Link>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(o._id)}>
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

export default Orders;
