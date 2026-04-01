import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Seo from '../components/Seo';
import { api } from '../services/api';

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Track your Belimaa order',
    description: 'Track Belimaa orders using tracking number, invoice number, or order id.'
  }), []);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/orders/track', { params: { identifier, email } });
      setOrder(data.order);
    } catch (requestError) {
      setOrder(null);
      setError(requestError.response?.data?.message || 'We could not find that order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Seo title="Track Order | Belimaa" description="Track your Belimaa order status and invoice details." schema={schema} />
      <Navbar activeCategory="" onFilterChange={() => {}} />
      <main className="checkout-panel tracking-layout">
        <section className="checkout-card">
          <p className="eyebrow">Order tracking</p>
          <h1>Track your order</h1>
          <p className="shop-header-copy">Use your tracking number, invoice number, or order id with the same email used at checkout.</p>
          <form className="form-grid" onSubmit={submit}>
            <label className="form-field full-span">
              <span>Tracking number / invoice / order id</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
            </label>
            <label className="form-field full-span">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            {error ? <div className="error-box full-span">{error}</div> : null}
            <button className="primary-button full-width" disabled={loading}>{loading ? 'Checking order...' : 'Track order'}</button>
          </form>
        </section>

        {order ? (
          <section className="checkout-card">
            <p className="eyebrow">Current status</p>
            <h2>{order.status}</h2>
            <div className="tracking-summary">
              <div><span>Invoice</span><strong>{order.invoiceNumber || order.invoice_number}</strong></div>
              <div><span>Tracking</span><strong>{order.trackingNumber || order.tracking_number}</strong></div>
              <div><span>Payment</span><strong>{order.paymentStatus || order.payment_status}</strong></div>
              <div><span>Total</span><strong>?{Number(order.total || 0).toLocaleString('en-IN')}</strong></div>
            </div>
            <div className="tracking-actions">
              <a className="secondary-button" href={`${api.defaults.baseURL}/orders/${order._id}/invoice?email=${encodeURIComponent(email)}`} target="_blank" rel="noreferrer">Open invoice</a>
              <Link to="/" className="ghost-button">Continue shopping</Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

