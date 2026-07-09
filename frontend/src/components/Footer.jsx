import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid container">
        <div className="footer-brand">
          <h3>StepStyle</h3>
          <p>
            Premium footwear designed for daily motion — refined silhouettes, lasting comfort, and
            materials that age with character.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Create account</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div>
          <h4>Support</h4>
          <p>Free exchanges within 7 days</p>
          <p>Secure Razorpay checkout</p>
          <p>COD available on eligible orders</p>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} StepStyle. Crafted for modern walkers.</p>
      </div>
    </footer>
  );
};

export default Footer;
