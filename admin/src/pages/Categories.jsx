import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, ToggleLeft } from 'lucide-react';
import api from '../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/category');
      setCategories(data.data?.category || []);
    } catch {
      toast.error('Failed to load categories');
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
      await api.post('/admin/create/categoty', form);
      toast.success('Category created');
      setForm({ name: '', description: '' });
      load();
    } catch {
      toast.error('Could not create category');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (id) => {
    try {
      const { data } = await api.get(`/admin/editCategory/${id}`);
      const c = data.data?.category;
      setEditId(id);
      setEditForm({ name: c.name, description: c.description });
    } catch {
      toast.error('Could not load category');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/categoryEdited/${editId}`, editForm);
      toast.success('Category updated');
      setEditId(null);
      load();
    } catch {
      toast.error('Could not update category');
    }
  };

  const toggle = async (id) => {
    try {
      await api.get('/admin/categoryList', { params: { id } });
      toast.success('Category status updated');
      load();
    } catch {
      toast.error('Could not update category');
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Categories</h1>
          <p>Organize products into collections</p>
        </div>
      </header>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="card" style={{ padding: '1.15rem' }} onSubmit={create}>
          <h3 style={{ marginBottom: 12 }}><Plus size={16} /> Add Category</h3>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>Create</button>
        </form>

        {editId && (
          <form className="card" style={{ padding: '1.15rem' }} onSubmit={saveEdit}>
            <h3 style={{ marginBottom: 12 }}><Pencil size={16} /> Edit Category</h3>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ marginTop: 16, padding: 0 }}>
        {loading ? (
          <div className="skeleton" style={{ height: 200, margin: 16 }} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>
                      <span className={`badge ${c.isblock ? 'badge-danger' : 'badge-success'}`}>
                        {c.isblock ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => startEdit(c._id)}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => toggle(c._id)}>
                          <ToggleLeft size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
