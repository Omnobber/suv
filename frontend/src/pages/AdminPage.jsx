import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';
import { categories } from '../data/categories';

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
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState('');

  const loadData = async () => {
    const [{ data: productData }, { data: orderData }] = await Promise.all([
      api.get('/products'),
      api.get('/orders')
    ]);
    setProducts(productData.products || []);
    setOrders(orderData.orders || []);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="admin-page">
      <aside className="admin-sidebar-panel">
        <div>
          <p className="eyebrow">Belimaa admin</p>
          <h1>{user?.name || 'Admin dashboard'}</h1>
          <p>Product CRUD, orders and local image uploads from one clean workspace.</p>
        </div>
        <button className="secondary-button" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-main-panel">
        <section className="admin-stats">
          <div className="stat-card"><span>Products</span><strong>{products.length}</strong></div>
          <div className="stat-card"><span>Orders</span><strong>{orders.length}</strong></div>
          <div className="stat-card"><span>Revenue</span><strong>?{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('en-IN')}</strong></div>
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
                <div className="admin-list-row" key={order._id}>
                  <div>
                    <strong>{order.customer?.name}</strong>
                    <p>{order.customer?.email}</p>
                  </div>
                  <div>
                    <strong>?{order.total.toLocaleString('en-IN')}</strong>
                    <p>{order.paymentStatus}</p>
                  </div>
                </div>
              ))}
              {!orders.length && <p>No orders yet.</p>}
            </div>
          </div>
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
                  <p>?{product.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="inventory-actions">
                  <button type="button" className="secondary-button" onClick={() => startEdit(product)}>Edit</button>
                  <button type="button" className="ghost-button" onClick={() => deleteProduct(product._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
