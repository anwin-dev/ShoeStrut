import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import './Layout.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const HIDDEN_BREADCRUMB_PATHS = ['/', '/login', '/signup', '/otp'];

const Layout = () => {
  const location = useLocation();
  const showBreadcrumbs = !HIDDEN_BREADCRUMB_PATHS.includes(location.pathname);

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        {showBreadcrumbs && <Breadcrumbs />}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="main-content"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <Footer />
      <CartDrawer />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-premium',
          duration: 2800,
          style: {
            background: '#111827',
            color: '#f8fafc',
          },
        }}
      />
    </div>
  );
};

export default Layout;
