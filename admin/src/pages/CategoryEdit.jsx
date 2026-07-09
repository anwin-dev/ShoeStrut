import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/editCategory/${id}`)
      .then(({ data }) => {
        const c = data.data?.category;
        if (c) setForm({ name: c.name, description: c.description });
      })
      .catch(() => toast.error('Category not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/categoryEdited/${id}`, form);
      toast.success('Category updated');
      navigate('/categories');
    } catch {
      toast.error('Could not update category');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Edit Category</h1>
        </div>
      </header>
      <form className="card" style={{ padding: '1.25rem', maxWidth: 520 }} onSubmit={submit}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-control" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} required />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default CategoryEdit;
