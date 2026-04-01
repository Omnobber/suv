import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, updateItem, removeItem, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!items.length || !form.email) return undefined;

    const timeout = setTimeout(() => {
      api.post('/abandoned-carts', { ...form, items, subtotal, shipping, total }).catch(() => {});
    }, 1200);

    return () => clearTimeout(timeout);
  }, [form, items, shipping, subtotal, total]);

  const finishOrder = async (order, response) => {
    await api.post(`/orders/${order._id}/verify-payment`, response);
    clearCart();
    navigate(`/track-order?identifier=${encodeURIComponent(order.trackingNumber || order.tracking_number || order.invoiceNumber)}&email=${encodeURIComponent(form.email)}`);
  };

  const placeOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { customer: form, items, subtotal, shipping, total, paymentMethod: 'razorpay' });

      if (data.mockMode || !window.Razorpay || !import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID.includes('your_key')) {
        await finishOrder(data.order, {
          razorpay_order_id: data.razorpayOrder.id,
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        });
        return;
      }

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Belimaa',
        description: 'Premium handcrafted order',
        order_id: data.razorpayOrder.id,
        handler: async (response) => {
          await finishOrder(data.order, response);
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#0f6bdc' }
      });

      razorpay.open();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to place order right now.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <Seo title="Checkout | Belimaa" description="Complete your Belimaa order with secure checkout, tracking, and invoice support." />
      <section className="checkout-panel">
        <div className="checkout-head">
          <div>
            <p className="eyebrow">Checkout</p>
            <h1>Complete your Belimaa order</h1>
          </div>
          <div className="header-links-row">
            <Link to="/track-order" className="ghost-button">Track order</Link>
            <Link to="/" className="secondary-button">Continue shopping</Link>
          </div>
        </div>
        <div className="checkout-grid">
          <div className="checkout-card">
            <h2>Delivery details</h2>
            <div className="form-grid">
              {Object.keys(form).map((field) => (
                <label className="form-field" key={field}>
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <input value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} />
                </label>
              ))}
            </div>
            <p className="checkout-helper">If you leave checkout before paying, we can recover your cart and help you complete the order later.</p>
          </div>
          <div className="checkout-card">
            <h2>Your cart</h2>
            <div className="checkout-items">
              {items.map((item) => (
                <div className="checkout-item" key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>?{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="quantity-row">
                    <button type="button" onClick={() => updateItem(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateItem(item._id, item.quantity + 1)}>+</button>
                    <button type="button" className="remove-button" onClick={() => removeItem(item._id)}>Remove</button>
                  </div>
                </div>
              ))}
              {!items.length && <p>Your cart is empty.</p>}
            </div>
            <div className="summary-row"><span>Subtotal</span><strong>?{subtotal.toLocaleString('en-IN')}</strong></div>
            <div className="summary-row"><span>Shipping</span><strong>{shipping === 0 ? 'Free' : `?${shipping}`}</strong></div>
            <div className="summary-row total-row"><span>Total</span><strong>?{total.toLocaleString('en-IN')}</strong></div>
            <button className="primary-button full-width" disabled={placing || !items.length} onClick={placeOrder}>{placing ? 'Preparing payment...' : 'Pay with Razorpay'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
