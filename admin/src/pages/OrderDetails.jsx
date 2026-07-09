import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import { formatDate, formatPrice } from '../utils/format';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/product/orderDetails/${id}`);
      setOrder(data.data?.order);
      setUser(data.data?.userData);
    } catch {
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const confirmReturn = async () => {
    try {
      await api.post(`/admin/product/confirmReturn/${id}`);
      toast.success('Return confirmed');
      load();
    } catch {
      toast.error('Could not confirm return');
    }
  };

  const rejectReturn = async () => {
    try {
      await api.get(`/admin/product/reject/${id}`);
      toast.success('Return rejected');
      load();
    } catch {
      toast.error('Could not reject return');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

  const addr = order.deliveryAddress;

  return (
    <div>
      <header className="page-header">
        <div>
          <Link to="/orders" className="btn btn-outline btn-sm" style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <h1>Order #{order.orderId}</h1>
          <p>Placed {formatDate(order.createdAt || order.orderDate)}</p>
        </div>
        <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-warning'}`}>
          {order.status}
        </span>
      </header>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <h3 style={{ marginBottom: 12 }}>Customer</h3>
          <p><strong>{user?.username || '—'}</strong></p>
          <p>{user?.email}</p>
          <p>{user?.phoneNumber || '—'}</p>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <h3 style={{ marginBottom: 12 }}>Delivery</h3>
          {addr ? (
            <>
              <p>{addr.addressType} · {addr.city}, {addr.State}</p>
              <p>Pincode: {addr.pincode}</p>
              {addr.Landmark && <p>Landmark: {addr.Landmark}</p>}
            </>
          ) : (
            <p className="muted">No address</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, padding: '1.15rem' }}>
        <h3 style={{ marginBottom: 12 }}>Payment</h3>
        <p>Method: <strong>{order.paymentOption || order.paymentMethod || '—'}</strong></p>
        <p>Payment ID: {order.paymentId || '—'}</p>
        <p>Total: <strong>{order.billTotal}</strong></p>
        {order.couponCode && order.couponCode !== 'No Coupon' && (
          <p>Coupon: {order.couponCode} ({order.discount}% off)</p>
        )}
      </div>

      {order.returnRequest && (
        <div className="card" style={{ marginTop: 16, padding: '1.15rem', borderColor: 'rgba(245,158,11,0.4)' }}>
          <h3 style={{ marginBottom: 8 }}>Return Request</h3>
          <p>Reason: {order.returnReason || '—'}</p>
          <p>Status: {order.returnStatus || 'Pending'}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={confirmReturn}>
              <Check size={14} /> Confirm Return
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={rejectReturn}>
              <X size={14} /> Reject
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={assetUrl(item.image || item.productId?.image)} alt="" />
                      <span>{item.name || item.productId?.title || 'Product'}</span>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price || item.productPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
