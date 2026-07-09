import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import StatCard from '../components/StatCard';
import '../components/StatCard.css';
import { formatDate, formatPrice } from '../utils/format';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [users, setUsers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      api.get('/admin/adminHome'),
      api.get('/admin/monthlyChart', { params: { year } }),
      api.get('/admin/product/user/list'),
      api.get('/admin/product/list', { params: { page: 1, limit: 100 } }),
    ])
      .then(([home, chart, userRes, productRes]) => {
        setData(home.data.data);
        setMonthly(chart.data.monthlyOrderCounts);
        setUsers(userRes.data.data?.user || []);
        const products = productRes.data.data?.product || [];
        setLowStock(products.filter((p) => Number(p.stock) <= 5));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!monthly) return [];
    return Object.entries(monthly).map(([month, count]) => ({ month: month.slice(0, 3), count }));
  }, [monthly]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="skeleton" style={{ height: 40, marginBottom: 24 }} />
        <div className="grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="empty-state"><h3>Could not load dashboard</h3></div>;
  }

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Store performance at a glance</p>
        </div>
      </header>

      <div className="grid-4">
        <StatCard label="Revenue (Delivered)" value={formatPrice(data.deliveredRevenue)} icon={DollarSign} tone="success" />
        <StatCard label="Delivered Orders" value={data.deliveredOrderCount} icon={ShoppingBag} />
        <StatCard label="Pending Orders" value={data.PendingOrderCount} icon={Package} tone="warning" />
        <StatCard label="Products" value={data.productCount} icon={Package} />
      </div>

      <div className="grid-2 dashboard-panels">
        <div className="card panel">
          <h3>Monthly Delivered Orders ({new Date().getFullYear()})</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#9aa3b5" fontSize={12} />
                <YAxis stroke="#9aa3b5" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1c2030', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card panel">
          <h3>Recent Orders</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data.latestOrders || []).map((order) => (
                  <tr key={order._id}>
                    <td>#{order.orderId}</td>
                    <td>{order.userId?.username || '—'}</td>
                    <td><span className={`badge badge-${order.status === 'Delivered' ? 'success' : 'warning'}`}>{order.status}</span></td>
                    <td>{order.billTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2 dashboard-panels">
        <div className="card panel">
          <h3><AlertTriangle size={18} /> Low Stock</h3>
          {lowStock.length === 0 ? (
            <p className="muted">All products are well stocked.</p>
          ) : (
            <ul className="mini-list">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p._id}>
                  <img src={assetUrl(p.image)} alt="" />
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.stock} left</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card panel">
          <h3>Top Selling Products</h3>
          <ul className="mini-list">
            {(data.populatedProducts || []).filter(Boolean).slice(0, 6).map((p) => (
              <li key={p._id}>
                <img src={assetUrl(p.image)} alt="" />
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.brand}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card panel">
        <h3><Users size={18} /> Latest Users</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td>
                    <span className={`badge ${u.isblock ? 'badge-danger' : 'badge-success'}`}>
                      {u.isblock ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
