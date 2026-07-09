import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Banknote, CreditCard } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { loadRazorpayScript } from '../utils/razorpay';
import './Checkout.css';

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [addressDoc, setAddressDoc] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountTotal, setDiscountTotal] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;

    const boot = async () => {
      try {
        await api.get('/product/checkout/verify');
        const { data } = await api.get('/product/checkout');
        if (!alive) return;
        if (data.redirect) {
          navigate('/cart');
          return;
        }
        setProducts(data.data?.products || []);
        setSubtotal(Number(data.data?.subtotal) || 0);
        setAddressDoc(data.data?.userAddress || null);
        setCoupons(data.data?.coupons || []);
      } catch {
        if (alive) navigate('/cart');
      } finally {
        if (alive) setLoading(false);
      }
    };

    boot();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Sign in to checkout</h3>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const addresses = addressDoc?.Address || [];
  const payable = discountTotal ?? subtotal;

  const buildPayloadProducts = () =>
    products.map((p) => ({
      productId: p.productId,
      quantity: p.quantity,
      price: p.Price,
      image: p.image,
    }));

  const applyCoupon = async () => {
    try {
      const { data } = await api.post('/product/apply-coupon', {
        code: couponCode,
        total: subtotal,
      });
      if (data.status === 'success') {
        setDiscountTotal(data.discountTotal);
        setDiscountValue(data.discountValue || 0);
        toast.success('Coupon applied');
      } else if (data.status === 'valueMatch') {
        toast.error('Order total is outside coupon limits');
      } else {
        toast.error('Invalid coupon');
      }
    } catch {
      toast.error('Could not apply coupon');
    }
  };

  const openRazorpayCheckout = async ({ order, key, selected, payloadProducts }) => {
    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) {
      toast.error('Could not load Razorpay. Check your network and try again.');
      return;
    }

    const options = {
      key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'StepStyle',
      description: 'Footwear order payment',
      order_id: order.id,
      prefill: {
        name: selected?.name || user?.username || '',
        email: user?.email || '',
        contact: String(selected?.phone || ''),
      },
      theme: {
        color: '#c45c26',
      },
      handler: async (response) => {
        try {
          const verify = await api.post('/user/verify-payment/', {
            paymentData: response,
            totalAmount: payable,
            index: selectedIndex,
            products: payloadProducts,
            address: selected.type,
            couponCode: couponCode || undefined,
            discountValue,
          });

          if (verify.data?.success) {
            await refreshCart();
            toast.success('Payment successful');
            navigate('/profile?tab=orders');
          } else {
            toast.error(verify.data?.message || 'Payment verification failed');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed');
        } finally {
          setPlacing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setPlacing(false);
          toast('Payment cancelled');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setPlacing(false);
      toast.error(response?.error?.description || 'Payment failed');
    });
    rzp.open();
  };

  const placeOrder = async () => {
    if (!addresses.length) {
      toast.error('Add a delivery address in your profile first');
      navigate('/profile?tab=address');
      return;
    }
    if (!products.length) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setPlacing(true);
    try {
      const selected = addresses[selectedIndex];
      const payloadProducts = buildPayloadProducts();
      const { data } = await api.post('/user/orderCOD', {
        index: selectedIndex,
        selectedAddressType: selected.type,
        paymentOptionName: paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
        totalAmount: payable,
        couponCode: couponCode || undefined,
        products: payloadProducts,
      });

      if (paymentMethod === 'cod') {
        if (data.status === 'Cash on Delivery' || data.success) {
          await refreshCart();
          toast.success('Order placed with Cash on Delivery');
          navigate('/profile?tab=orders');
        } else {
          toast.error(data.message || data.status || 'Could not place order');
        }
        setPlacing(false);
        return;
      }

      if (data.status === 'Razorpay' && data.order) {
        await openRazorpayCheckout({
          order: data.order,
          key: data.key,
          selected,
          payloadProducts,
        });
        return;
      }

      toast.error(data.message || data.status || 'Could not start Razorpay payment');
      setPlacing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      setPlacing(false);
    }
  };

  return (
    <div className="container checkout-page">
      <header className="fade-up">
        <p className="eyebrow">Checkout</p>
        <h1>Complete your order</h1>
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 280 }} />
      ) : (
        <div className="checkout-layout">
          <section className="card checkout-panel">
            <h3>Delivery address</h3>
            {addresses.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No address yet.</p>
                <Link to="/profile?tab=address" className="btn btn-outline btn-sm">
                  Manage addresses
                </Link>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((addr, index) => (
                  <label key={index} className={`address-item ${selectedIndex === index ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedIndex === index}
                      onChange={() => setSelectedIndex(index)}
                    />
                    <div>
                      <strong>
                        {addr.name} · {addr.type}
                      </strong>
                      <p>
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p>{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <h3 className="mt-block">Items</h3>
            <div className="checkout-items">
              {products.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img src={assetUrl(item.image)} alt={item.title} />
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      Qty {item.quantity} · {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="card checkout-summary">
            <h3>Payment</h3>

            <div className="pay-methods">
              <button
                type="button"
                className={`pay-method ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <CreditCard size={18} />
                <span>
                  <strong>Razorpay</strong>
                  <small>UPI, cards, netbanking, wallets</small>
                </span>
              </button>
              <button
                type="button"
                className={`pay-method ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <Banknote size={18} />
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
              </button>
            </div>

            <div className="coupon-row">
              <input
                className="form-control"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="button" className="btn btn-outline" onClick={applyCoupon}>
                Apply
              </button>
            </div>
            {coupons.length > 0 && (
              <p className="hint">
                Available: {coupons.filter((c) => c.isActive).map((c) => c.code).join(', ') || '—'}
              </p>
            )}
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {discountTotal != null && (
              <div className="summary-line">
                <span>After coupon</span>
                <strong>{formatPrice(discountTotal)}</strong>
              </div>
            )}
            <button type="button" className="btn btn-primary w-full" disabled={placing} onClick={placeOrder}>
              {placing
                ? paymentMethod === 'razorpay'
                  ? 'Opening Razorpay…'
                  : 'Placing…'
                : paymentMethod === 'razorpay'
                  ? `Pay with Razorpay · ${formatPrice(payable)}`
                  : `Place COD order · ${formatPrice(payable)}`}
            </button>
            <p className="hint">
              {paymentMethod === 'razorpay'
                ? 'You will complete payment securely in the Razorpay popup.'
                : 'Cash on Delivery is available for all order amounts.'}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Checkout;
