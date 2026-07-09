import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, ToggleLeft } from 'lucide-react';
import api from '../api/axios';
import { formatDate } from '../utils/format';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '',
    name: '',
    discount: '',
    validFrom: '',
    validUntil: '',
    minimum: '',
    maximum: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product/couponList');
      setCoupons(data.data?.CouponData || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/product/addCoupon', form);
      toast.success('Coupon created');
      setForm({ code: '', name: '', discount: '', validFrom: '', validUntil: '', minimum: '', maximum: '' });
      load();
    } catch {
      toast.error('Could not create coupon (code may already exist)');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    try {
      await api.get('/admin/product/blocCoupon', { params: { id } });
      toast.success('Coupon status updated');
      load();
    } catch {
      toast.error('Could not update coupon');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount codes</p>
        </div>
      </header>

      <form className="card" style={{ padding: '1.15rem', marginBottom: 16 }} onSubmit={create}>
        <h3 style={{ marginBottom: 12 }}><Plus size={16} /> New Coupon</h3>
        <div className="grid-2">
          {['code', 'name', 'discount', 'minimum', 'maximum'].map((field) => (
            <div className="form-group" key={field}>
              <label>{field}</label>
              <input
                className="form-control"
                type={field === 'discount' || field.includes('min') || field.includes('max') ? 'number' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="form-group">
            <label>Valid From</label>
            <input type="date" className="form-control" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Valid Until</label>
            <input type="date" className="form-control" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>Create Coupon</button>
      </form>

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Discount</th>
                <th>Valid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}</td>
                  <td>{c.discount}%</td>
                  <td>{formatDate(c.validFrom)} — {formatDate(c.validUntil)}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => toggle(c._id)}>
                      <ToggleLeft size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Coupons;
