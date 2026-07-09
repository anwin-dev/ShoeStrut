import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="layout">
      <Navbar />
      <main key={location.pathname} className="main-content page-enter">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-premium',
          duration: 2800,
          style: {
            background: '#0c0b0a',
            color: '#faf7f2',
          },
        }}
      />
    </div>
  );
};

export default Layout;
