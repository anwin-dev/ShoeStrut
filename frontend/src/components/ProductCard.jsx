import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetUrl } from '../api/axios';
import api from '../api/axios';
import { formatPrice, getDisplayPrice } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { price, original, discount } = getDisplayPrice(product);
  const outOfStock = Number(product?.stock) <= 0;

  const onAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const result = await addToCart(product._id);
    if (result.needsAuth) navigate('/login');
  };

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to save items');
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.get(`/product/addWhislis/${product._id}`);
      if (data.status === 'included') toast('Already in wishlist');
      else toast.success('Saved to wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <article className="pcard fade-up">
      <Link to={`/product/${product._id}`} className="pcard-media">
        {discount > 0 && <span className="badge badge-sale pcard-badge">-{discount}%</span>}
        {outOfStock && <span className="badge badge-out pcard-badge-alt">Sold out</span>}
        <img
          src={assetUrl(product.image)}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
          }}
        />
        <div className="pcard-actions">
          <button type="button" className="btn-icon" aria-label="Wishlist" onClick={onWish}>
            <Heart size={16} />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={onAdd}
            disabled={outOfStock}
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </Link>
      <div className="pcard-body">
        <p className="pcard-brand">{product.brand || product.type || 'StepStyle'}</p>
        <Link to={`/product/${product._id}`} className="pcard-title">
          {product.title}
        </Link>
        <div className="pcard-price">
          {original && <span className="price-old">{formatPrice(original)}</span>}
          <span className="price">{formatPrice(price)}</span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
