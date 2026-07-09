import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ToggleLeft } from 'lucide-react';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product/user/list');
      setUsers(data.data?.user || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await api.get('/admin/product/blockUser', { params: { id } });
      toast.success('User status updated');
      load();
    } catch {
      toast.error('Could not update user');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage customer accounts</p>
        </div>
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td>
                    <span className={`badge ${u.isblock ? 'badge-danger' : 'badge-success'}`}>
                      {u.isblock ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => toggleBlock(u._id)}>
                      <ToggleLeft size={14} /> Toggle
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

export default Users;
