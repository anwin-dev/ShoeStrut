import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Users,
  ShoppingCart,
  Ticket,
  BarChart3,
  LogOut,
  Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: FolderTree, label: 'Categories' },
  { to: '/offers', icon: Percent, label: 'Offers' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/sales', icon: BarChart3, label: 'Sales Report' },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">S</span>
        <div>
          <strong>StepStyle</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={logout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
