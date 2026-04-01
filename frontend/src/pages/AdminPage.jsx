import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';
import { categories } from '../data/categories';

const LOW_STOCK_THRESHOLD = 5;
const ORDER_SEEN_KEY = 'belimaa-admin-last-seen-order';
const ADMIN_SUPPORT_WORKFLOWS = [
  {
    title: 'Product discovery reply',
    body: 'If you share the category, budget, or where you want to place it, I can suggest the closest options from our live collection.'
  },
  {
    title: 'Payment and COD reply',
    body: 'Yes, COD is available on eligible orders. We also support secure online payment options for a smooth checkout experience.'
  },
  {
    title: 'Shipping and delivery reply',
    body: 'Delivery timelines can vary by location. For exact order-specific updates, please connect with our support team on WhatsApp.'
  },
  {
    title: 'Coupon and offer reply',
    body: 'If there is an active offer available for the order, it will apply based on eligibility at checkout.'
  }
];

const ADMIN_SUPPORT_RULES = [
  'Keep replies short, warm, premium, and conversion-focused.',
  'Recommend only products from the current live catalog.',
  'Encourage checkout when buying intent is clear.',
  'Escalate all order-specific issues, returns, custom work, and address changes to WhatsApp or human support.'
];
const PRODUCT_NOTIFICATION_TEMPLATES = [
  {
    title: 'New product published',
    body: 'Product live on the storefront. Review featured placement, category visibility, and conversion potential.'
  },
  {
    title: 'Low-stock product alert',
    body: 'Reconfirm inventory, prioritize restock, and protect orders from availability risk.'
  },
  {
    title: 'Best seller highlight',
    body: 'Strong product attention. Keep stock healthy and consider pairing with a related upsell.'
  },
  {
    title: 'Review-linked product alert',
    body: 'New customer sentiment is available. Moderate quickly to support trust and conversion.'
  }
];

function orderLabel(order) {
  return order.invoiceNumber || order.invoice_number || order._id;
}

function customerLabel(order) {
  return order.customer?.name || order.customer_name || 'customer';
}

function currencyLabel(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function getNotificationTemplate(type, payload) {
  switch (type) {
    case 'new-order':
      return {
        badge: 'New unseen order',
        title: `Order ${orderLabel(payload.order)} from ${customerLabel(payload.order)}`,
        detail: 'Payment check: Verify current payment status. Stock check: Confirm all items are available. Packing status: Not started.',
        action: 'Dispatch target: Plan dispatch today. Customer follow-up: Send order confirmation if needed.'
      };
    case 'pending-payment':
      return {
        badge: 'Pending action',
        title: `Payment pending for ${orderLabel(payload.order)}`,
        detail: 'Payment check: Pending, verify now. Stock check: Hold and confirm stock availability. Packing status: Start only after payment check.',
        action: 'Dispatch target: Dispatch after payment confirmation. Customer follow-up: Send payment reminder if required.'
      };
    case 'delayed-order':
      return {
        badge: 'Delayed dispatch risk',
        title: `Dispatch delay risk on ${orderLabel(payload.order)}`,
        detail: 'Payment check: Confirm cleared status. Stock check: Reconfirm item readiness. Packing status: Check if packing is complete.',
        action: 'Dispatch target: Escalate dispatch delay today. Customer follow-up: Inform customer about shipment status.'
      };
    case 'low-stock':
      return {
        badge: 'Low-stock risk',
        title: `${payload.product.name} is running low`,
        detail: 'Payment check: Confirm status before allocation. Stock check: Low stock on one or more items, verify immediately. Packing status: Hold until stock is confirmed.',
        action: 'Dispatch target: Dispatch only after inventory clearance. Customer follow-up: Update customer if any item needs confirmation.'
      };
    case 'customer-follow-up':
      return {
        badge: 'Customer follow-up needed',
        title: `Follow up with ${customerLabel(payload.order)}`,
        detail: 'Payment check: Confirm status is clear. Stock check: Confirm order readiness. Packing status: Check latest progress.',
        action: 'Dispatch target: Share expected dispatch timeline. Customer follow-up: Contact customer now.'
      };
    case 'post-delivery':
      return {
        badge: 'Post-delivery support',
        title: `Delivery follow-up for ${orderLabel(payload.order)}`,
        detail: 'Payment check: Completed. Stock check: Closed. Packing status: Closed.',
        action: 'Delivery confirmation: Mark delivered and verified. Post-delivery support: Share support message and invite feedback.'
      };
    case 'review':
      return {
        badge: 'Pending action',
        title: `Review awaiting moderation for ${payload.review.productName}`,
        detail: `Customer rating: ${payload.review.rating}/5. Check review content and product fit before approval.`,
        action: 'Customer follow-up: Approve or reject today to keep storefront trust current.'
      };
    case 'cart':
      return {
        badge: 'Customer follow-up needed',
        title: `Abandoned cart from ${payload.cart.email}`,
        detail: `Cart value: ${currencyLabel(payload.cart.total)}. Follow-up needed on ${payload.cart.items?.length || 0} items.`,
        action: 'Customer follow-up: Reach out with product help, offer guidance, or WhatsApp assistance.'
      };
    default:
      return {
        badge: 'Pending action',
        title: 'Admin reminder',
        detail: 'Review the next action for this store event.',
        action: 'Take follow-up action from the dashboard.'
      };
  }
}

const emptyForm = {
  name: '',
  category: categories[0],
  price: '',
  description: '',
  stock: '',
  featured: false
};

export default function AdminPage() {
  const { logout, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [lastSeenOrderAt, setLastSeenOrderAt] = useState(() => new Date(localStorage.getItem(ORDER_SEEN_KEY) || 0).getTime());
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState('');

  const loadData = async () => {
    const [productRes, orderRes, enquiryRes, reviewRes, abandonedRes] = await Promise.all([
      api.get('/products'),
      api.get('/orders'),
      api.get('/enquiries'),
      api.get('/reviews/admin'),
      api.get('/abandoned-carts')
    ]);
    setProducts(productRes.data.products || []);
    setOrders(orderRes.data.orders || []);
    setEnquiries(enquiryRes.data.enquiries || []);
    setReviews(reviewRes.data.reviews || []);
    setAbandonedCarts(abandonedRes.data.carts || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const lowStockProducts = useMemo(() => (
    products.filter((product) => Number(product.stock) <= LOW_STOCK_THRESHOLD).sort((left, right) => Number(left.stock) - Number(right.stock))
  ), [products]);

  const newOrders = useMemo(() => (
    orders.filter((order) => new Date(order.created_at || order.createdAt || 0).getTime() > lastSeenOrderAt)
  ), [orders, lastSeenOrderAt]);

  const pendingReviews = useMemo(() => reviews.filter((review) => review.status === 'pending'), [reviews]);
  const activeAbandonedCarts = useMemo(() => abandonedCarts.filter((cart) => cart.status === 'active'), [abandonedCarts]);
  const pendingEnquiries = useMemo(() => enquiries.filter((enquiry) => enquiry.status === 'new'), [enquiries]);
  const pendingPaymentOrders = useMemo(() => (
    orders.filter((order) => {
      const paymentStatus = String(order.paymentStatus || order.payment_status || '').toLowerCase();
      return paymentStatus && paymentStatus !== 'paid';
    })
  ), [orders]);
  const delayedOrders = useMemo(() => (
    orders.filter((order) => {
      const status = String(order.status || '').toLowerCase();
      const createdAt = new Date(order.created_at || order.createdAt || 0).getTime();
      const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
      return ['pending', 'confirmed'].includes(status) && ageHours >= 48;
    })
  ), [orders]);
  const deliveredOrders = useMemo(() => (
    orders.filter((order) => String(order.status || '').toLowerCase() === 'delivered').slice(0, 5)
  ), [orders]);
  const featuredProducts = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);

  const markOrdersAsSeen = () => {
    const seenAt = Date.now();
    localStorage.setItem(ORDER_SEEN_KEY, new Date(seenAt).toISOString());
    setLastSeenOrderAt(seenAt);
  };

  const notifications = useMemo(() => ([
    ...newOrders.map((order) => ({
      id: `order-${order._id}`,
      type: 'new-order',
      meta: currencyLabel(order.total),
      ...getNotificationTemplate('new-order', { order })
    })),
    ...pendingPaymentOrders.slice(0, 5).map((order) => ({
      id: `payment-${order._id}`,
      type: 'pending-payment',
      meta: String(order.paymentStatus || order.payment_status || 'pending'),
      ...getNotificationTemplate('pending-payment', { order })
    })),
    ...delayedOrders.slice(0, 5).map((order) => ({
      id: `delay-${order._id}`,
      type: 'delayed-order',
      meta: String(order.status || 'pending'),
      ...getNotificationTemplate('delayed-order', { order })
    })),
    ...lowStockProducts.map((product) => ({
      id: `stock-${product._id}`,
      type: 'low-stock',
      meta: `${product.stock} left in stock`,
      ...getNotificationTemplate('low-stock', { product })
    })),
    ...pendingEnquiries.slice(0, 5).map((enquiry) => ({
      id: `followup-${enquiry._id}`,
      type: 'customer-follow-up',
      meta: enquiry.email || enquiry.phone || 'New enquiry',
      ...getNotificationTemplate('customer-follow-up', {
        order: {
          _id: enquiry._id,
          customer: { name: enquiry.name || 'customer' }
        }
      })
    })),
    ...pendingReviews.map((review) => ({
      id: `review-${review._id}`,
      type: 'review',
      meta: `${review.rating}/5 rating`,
      ...getNotificationTemplate('review', { review })
    })),
    ...activeAbandonedCarts.map((cart) => ({
      id: `cart-${cart._id}`,
      type: 'cart',
      meta: currencyLabel(cart.total),
      ...getNotificationTemplate('cart', { cart })
    })),
    ...deliveredOrders.map((order) => ({
      id: `delivered-${order._id}`,
      type: 'post-delivery',
      meta: currencyLabel(order.total),
      ...getNotificationTemplate('post-delivery', { order })
    }))
  ]), [activeAbandonedCarts, delayedOrders, deliveredOrders, lowStockProducts, newOrders, pendingEnquiries, pendingPaymentOrders, pendingReviews]);

  const submitProduct = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (imageFile) payload.append('image', imageFile);

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post('/products', payload);
    }

    setForm(emptyForm);
    setImageFile(null);
    setEditingId('');
    await loadData();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    await loadData();
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
      featured: product.featured
    });
  };

  const moderateReview = async (reviewId, status) => {
    await api.patch(`/reviews/admin/${reviewId}`, { status });
    await loadData();
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar-panel">
        <div>
          <p className="eyebrow">Belimaa admin</p>
          <h1>{user?.name || 'Admin dashboard'}</h1>
          <p>Products, orders, support, review moderation, abandoned carts, and live store alerts from one workspace.</p>
        </div>
        <button className="secondary-button" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-main-panel">
        <section className="admin-stats">
          <div className="stat-card"><span>Products</span><strong>{products.length}</strong></div>
          <div className="stat-card"><span>Orders</span><strong>{orders.length}</strong></div>
          <div className="stat-card"><span>Notifications</span><strong>{notifications.length}</strong></div>
          <div className="stat-card"><span>Revenue</span><strong>?{orders.reduce((sum, order) => sum + Number(order.total || 0), 0).toLocaleString('en-IN')}</strong></div>
        </section>

        <section className="admin-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Notifications</p>
              <h2>Orders, stock, reviews, and recovery alerts</h2>
            </div>
            <button type="button" className="secondary-button" onClick={markOrdersAsSeen}>Mark new orders as seen</button>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <article className={`notification-card ${notification.type}`} key={notification.id}>
                <div>
                  <p className="eyebrow">{notification.badge}</p>
                  <strong>{notification.title}</strong>
                  <p>{notification.detail}</p>
                  <p>{notification.action}</p>
                </div>
                <span>{notification.meta}</span>
              </article>
            ))}
            {!notifications.length && <p>No new notifications right now.</p>}
          </div>
        </section>

        <section className="admin-grid">
          <form className="admin-card" onSubmit={submitProduct}>
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Product form</p>
                <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Category</span>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Price</span>
                <input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Stock</span>
                <input type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
              </label>
              <label className="form-field full-span">
                <span>Description</span>
                <textarea rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <label className="form-field full-span">
                <span>Image upload</span>
                <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
              </label>
            </div>
            <button className="primary-button full-width">{editingId ? 'Update product' : 'Create product'}</button>
          </form>

          <div className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Orders</p>
                <h2>Recent orders</h2>
              </div>
            </div>
            <div className="admin-list">
              {orders.map((order) => (
                <div className="admin-list-row stacked-row" key={order._id}>
                  <div>
                    <strong>{order.customer?.name || order.customer_name}</strong>
                    <p>{order.customer?.email || order.customer_email}</p>
                  </div>
                  <div className="admin-message-copy">
                    <strong>{order.trackingNumber || order.tracking_number || 'Tracking pending'}</strong>
                    <p>?{Number(order.total || 0).toLocaleString('en-IN')} · {order.paymentStatus || order.payment_status}</p>
                  </div>
                </div>
              ))}
              {!orders.length && <p>No orders yet.</p>}
            </div>
          </div>
        </section>

        <section className="admin-two-up">
          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Reviews</p>
                <h2>Moderate customer reviews</h2>
              </div>
            </div>
            <div className="admin-list">
              {reviews.map((review) => (
                <div className="admin-list-row stacked-row" key={review._id}>
                  <div>
                    <strong>{review.productName}</strong>
                    <p>{review.name} · {review.rating}/5 · {review.status}</p>
                  </div>
                  <div className="inventory-actions">
                    <button type="button" className="secondary-button" onClick={() => moderateReview(review._id, 'approved')}>Approve</button>
                    <button type="button" className="ghost-button" onClick={() => moderateReview(review._id, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
              {!reviews.length && <p>No product reviews yet.</p>}
            </div>
          </section>

          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Recovery</p>
                <h2>Abandoned carts</h2>
              </div>
            </div>
            <div className="admin-list">
              {abandonedCarts.map((cart) => (
                <div className="admin-list-row stacked-row" key={cart._id}>
                  <div>
                    <strong>{cart.email}</strong>
                    <p>{cart.items?.length || 0} items · {cart.status}</p>
                  </div>
                  <div className="admin-message-copy">
                    <strong>?{Number(cart.total || 0).toLocaleString('en-IN')}</strong>
                    <p>{cart.name || cart.phone || 'Recovery lead saved'}</p>
                  </div>
                </div>
              ))}
              {!abandonedCarts.length && <p>No abandoned carts captured yet.</p>}
            </div>
          </section>
        </section>

        <section className="admin-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Support</p>
              <h2>Customer enquiries</h2>
            </div>
            <span className="result-pill">{pendingEnquiries.length} new enquiries</span>
          </div>
          <div className="admin-list">
            {enquiries.map((enquiry) => (
              <div className="admin-list-row stacked-row" key={enquiry._id}>
                <div>
                  <strong>{enquiry.name || 'Website visitor'}</strong>
                  <p>{enquiry.email || enquiry.phone || 'No contact details shared'}</p>
                </div>
                <div className="admin-message-copy">
                  <strong>{enquiry.status}</strong>
                  <p>{enquiry.message}</p>
                </div>
              </div>
            ))}
            {!enquiries.length && <p>No support requests yet.</p>}
          </div>
        </section>

        <section className="admin-two-up">
          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Support workflow</p>
                <h2>Fast reply guidance</h2>
              </div>
            </div>
            <div className="admin-list">
              {ADMIN_SUPPORT_WORKFLOWS.map((item) => (
                <div className="admin-list-row stacked-row" key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Escalation rules</p>
                <h2>When to move to human support</h2>
              </div>
            </div>
            <div className="admin-list">
              {ADMIN_SUPPORT_RULES.map((rule) => (
                <div className="admin-list-row stacked-row" key={rule}>
                  <div className="admin-message-copy">
                    <p>{rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="admin-card">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Products</p>
              <h2>Inventory</h2>
            </div>
          </div>
          <div className="inventory-grid">
            {products.map((product) => (
              <article className="inventory-card" key={product._id}>
                <img src={assetUrl(product.image)} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.category}</p>
                  <p>?{Number(product.price || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="inventory-actions">
                  <button type="button" className="secondary-button" onClick={() => startEdit(product)}>Edit</button>
                  <button type="button" className="ghost-button" onClick={() => deleteProduct(product._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-two-up">
          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Product notifications</p>
                <h2>Premium product alert templates</h2>
              </div>
            </div>
            <div className="admin-list">
              {PRODUCT_NOTIFICATION_TEMPLATES.map((item) => (
                <div className="admin-list-row stacked-row" key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Premium picks</p>
                <h2>Products to spotlight</h2>
              </div>
            </div>
            <div className="admin-list">
              {featuredProducts.map((product) => (
                <div className="admin-list-row stacked-row" key={product._id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.category} · {currencyLabel(product.price)}</p>
                  </div>
                  <div className="admin-message-copy">
                    <p>Use for best seller, premium banner, and high-interest product alerts.</p>
                  </div>
                </div>
              ))}
              {!featuredProducts.length && <p>No featured products yet.</p>}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

