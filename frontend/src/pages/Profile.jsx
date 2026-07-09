import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { formatPrice } from '../utils/format';
import './Profile.css';

const TABS = [
  { id: 'profile', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'address', label: 'Addresses' },
  { id: 'wallet', label: 'Wallet' },
];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'home',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/profile', { params: { tab } });
      setData(res.data.data || null);
    } catch {
      setData(null);
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const user = data?.userData;
  const addresses = data?.userAddress?.Address || [];
  const orders = data?.orderData || [];
  const wallet = data?.wallet?.[0];
  const transactions = data?.transaction || [];

  const setTab = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    setSearchParams(next);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/user/addAddressProfile', addressForm);
      toast.success('Address saved');
      setAddressForm({
        name: '',
        phone: '',
        pincode: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        addressType: 'home',
      });
      setTab('address');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className="skeleton" style={{ height: 260 }} />;
    if (!data) {
      return (
        <div className="empty-state">
          <h3>Profile unavailable</h3>
          <Link to="/login" className="btn btn-primary">
            Sign in again
          </Link>
        </div>
      );
    }

    if (tab === 'orders') {
      return orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>When you checkout, your order history will show here.</p>
          <Link to="/shop" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card card">
              <div>
                <h3>Order #{String(order._id).slice(-8).toUpperCase()}</h3>
                <p>{order.status || 'Pending'}</p>
              </div>
              <div>
                <strong>{order.billTotal || formatPrice(order.total)}</strong>
                <p>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</p>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (tab === 'address') {
      return (
        <div className="address-panel">
          <div className="address-existing">
            {addresses.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No addresses saved.</p>
              </div>
            ) : (
              addresses.map((addr, i) => (
                <div key={i} className="card address-card">
                  <strong>
                    {addr.name} · {(addr.type || '').toUpperCase()}
                  </strong>
                  <p>
                    {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p>{addr.phone}</p>
                </div>
              ))
            )}
          </div>
          <form className="card address-form" onSubmit={saveAddress}>
            <h3>Add address</h3>
            {['name', 'phone', 'pincode', 'address', 'city', 'state', 'landmark'].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field}</label>
                <input
                  id={field}
                  className="form-control"
                  value={addressForm[field]}
                  onChange={(e) => setAddressForm((s) => ({ ...s, [field]: e.target.value }))}
                  required={field !== 'landmark'}
                />
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="addressType">Type</label>
              <select
                id="addressType"
                className="form-control"
                value={addressForm.addressType}
                onChange={(e) => setAddressForm((s) => ({ ...s, addressType: e.target.value }))}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="temp">Temporary</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save address'}
            </button>
          </form>
        </div>
      );
    }

    if (tab === 'wallet') {
      return (
        <div className="wallet-panel">
          <div className="card wallet-hero">
            <p className="eyebrow">Balance</p>
            <h2>{formatPrice(wallet?.totalWallet || 0)}</h2>
          </div>
          <div className="txn-list">
            {transactions.length === 0 ? (
              <p className="muted">No wallet transactions yet.</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn._id} className="card txn-row">
                  <div>
                    <strong>{txn.transactionType || txn.type || 'Txn'}</strong>
                    <p>{txn.transationId || txn._id}</p>
                  </div>
                  <strong>{formatPrice(txn.amount)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="overview card">
        <h3>Account</h3>
        <p>
          <strong>Name:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Phone:</strong> {user?.phoneNumber || '—'}
        </p>
      </div>
    );
  }, [loading, data, tab, orders, addresses, wallet, transactions, addressForm, saving, user]);

  return (
    <div className="container profile-page">
      <header className="fade-up">
        <p className="eyebrow">Account</p>
        <h1>Your profile</h1>
      </header>
      <div className="profile-layout">
        <aside className="profile-tabs card">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </aside>
        <section>{content}</section>
      </div>
    </div>
  );
};

export default Profile;
