import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

const ROUTE_LABELS = {
  shop: 'Shop',
  product: 'Product',
  cart: 'Cart',
  wishlist: 'Wishlist',
  checkout: 'Checkout',
  profile: 'Account',
  login: 'Sign in',
  signup: 'Sign up',
  otp: 'Verify OTP',
};

const HIDDEN_PATHS = ['/', '/login', '/signup', '/otp'];

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const { id: productId } = useParams();

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', to: '/' }];

  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    let label = ROUTE_LABELS[segment] || segment;

    if (segment === productId && segments[index - 1] === 'product') {
      label = 'Product details';
    }

    crumbs.push({ label, to: path });
  });

  return (
    <nav className="breadcrumbs container" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.to} className="breadcrumb-item">
              {index === 0 && <Home size={14} aria-hidden="true" />}
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to}>{crumb.label}</Link>
              )}
              {!isLast && <ChevronRight size={14} className="breadcrumb-sep" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
