import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { assetUrl } from '../api/axios';

const emptyForm = {
  title: '',
  color: '',
  size: '',
  type: '',
  description: '',
  brand: '',
  category: '',
  Price: '',
  stock: '',
  status: 'true',
  tag: '',
  OfferPrice: '',
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/product/add').then(({ data }) => {
      setCategories(data.data?.category || []);
    });

    if (!isEdit) return;

    api
      .get(`/admin/product/productListEdit/${id}`)
      .then(({ data }) => {
        const p = data.data?.product;
        if (!p) return;
        setForm({
          title: p.title || '',
          color: p.color || '',
          size: String(p.size || ''),
          type: p.type || '',
          description: p.description || '',
          brand: p.brand || '',
          category: p.categoryId?._id || p.categoryId || '',
          Price: String(p.Price || ''),
          stock: String(p.stock || ''),
          status: String(p.status ?? true),
          tag: p.tag || '',
          OfferPrice: String(p.offerPrice || ''),
        });
        setPreview(assetUrl(p.image));
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      if (isEdit) {
        await api.post(`/admin/product/productEdit/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      } else {
        await api.post('/admin/product/push', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      }
      navigate('/products');
    } catch {
      toast.error('Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p>Fill in product details and upload an image</p>
        </div>
      </header>

      <form className="card" style={{ padding: '1.25rem', maxWidth: 720 }} onSubmit={submit}>
        {preview && (
          <div style={{ marginBottom: 16 }}>
            <img src={preview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }} />
          </div>
        )}

        {['title', 'brand', 'type', 'color', 'size', 'tag', 'Price', 'OfferPrice', 'stock'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{field}</label>
            <input id={field} name={field} className="form-control" value={form[field]} onChange={onChange} required={['title', 'brand', 'Price', 'stock'].includes(field)} />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" className="form-control" value={form.category} onChange={onChange} required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-control" rows={4} value={form.description} onChange={onChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input id="image" type="file" accept="image/*" onChange={onFile} required={!isEdit} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
