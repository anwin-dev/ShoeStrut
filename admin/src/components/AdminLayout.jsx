import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout = () => (
  <div className="admin-shell">
    <Sidebar />
    <main className="admin-main">
      <Outlet />
    </main>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: '#1c2030', color: '#f4f6fb', border: '1px solid rgba(255,255,255,0.08)' },
      }}
    />
  </div>
);

export default AdminLayout;
