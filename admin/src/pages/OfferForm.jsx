import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const OfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({
    name: '',
    currentDate: new Date().toISOString().slice(0, 10),
    startingDate: '',
    endingDate: '',
    minimumAmount: '',
    discountamount: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/editCatOffer/${id}`)
      .then(({ data }) => {
        const c = data.data?.categoryName;
        setCategory(c);
        setForm((s) => ({
          ...s,
          name: c?.name || '',
          startingDate: c?.OfferStartDate !== 'false' ? c?.OfferStartDate : '',
          endingDate: c?.OfferEndDate !== 'false' ? c?.OfferEndDate : '',
          minimumAmount: String(c?.minimumAmount || c?.OfferStartingPrice || ''),
          discountamount: String(c?.OfferDiscountPrice || ''),
        }));
      })
      .catch(() => toast.error('Category not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/admin/editConfirm', form);
      toast.success('Offer saved');
      navigate('/offers');
    } catch {
      toast.error('Could not save offer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 360 }} />;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Offer — {category?.name}</h1>
          <p>Set discount and validity for this category</p>
        </div>
      </header>

      <form className="card" style={{ padding: '1.25rem', maxWidth: 520 }} onSubmit={submit}>
        {['currentDate', 'startingDate', 'endingDate', 'minimumAmount', 'discountamount'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{field}</label>
            <input
              id={field}
              type={field.includes('Date') ? 'date' : 'number'}
              className="form-control"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </div>
        ))}
        <input type="hidden" name="name" value={form.name} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Offer'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/offers')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
