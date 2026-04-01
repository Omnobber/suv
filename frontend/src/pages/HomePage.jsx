import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import MobileCartBar from '../components/MobileCartBar';
import WhatsAppButton from '../components/WhatsAppButton';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';

const RECENTLY_VIEWED_KEY = 'belimaa-recently-viewed';
const SUPPORT_FAQS = [
  {
    question: 'Do you offer COD and secure online payment?',
    answer: 'Yes, COD is available on eligible orders. We also support secure online payment options for a smooth checkout experience.'
  },
  {
    question: 'How long does delivery usually take?',
    answer: 'Delivery timelines can vary by location. You will see the most accurate estimate during checkout, and our team can help further on WhatsApp if needed.'
  },
  {
    question: 'Can you help me choose the right product?',
    answer: 'Yes. Share your category, budget, or where you want to place it, and we will suggest the closest options from our live handcrafted collection.'
  },
  {
    question: 'How do returns or order-specific issues work?',
    answer: 'For returns, tracking, delivery updates, address changes, or any order-specific request, please connect with our support team on WhatsApp for quick assistance.'
  }
];

const QUICK_REPLY_TEMPLATES = [
  'For a compact home prayer setup, the Light Wood Table Mandir and Om Cutwork Twin Mandir Set are strong choices.',
  'For festive styling, the Diwali Cutwork Panel Set, Ganesha Rangoli Board, and Hand Painted Mandala Decor Disc are lovely picks.',
  'For decorative wall styling, the Tree of Life Wall Panel and Mandala Heritage Clock Panel are two of the best options.',
  'For custom name plates, engraving requests, bulk gifting, or personalized orders, WhatsApp support is the best next step.'
];
const PREMIUM_BANNER_LINES = [
  'Premium handcrafted pieces for sacred, festive, and elegant spaces.',
  'Thoughtful gifting. Refined craftsmanship. Timeless presence.',
  'Handcrafted detail that brings warmth, meaning, and beauty home.'
];

export default function HomePage() {
  const [products, setProducts] = useState(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [supportState, setSupportState] = useState({ loading: false, message: '', error: false });
  const { addItem } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.products?.length ? data.products : fallbackProducts);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const recentlyViewed = useMemo(() => {
    const ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    return ids.map((id) => products.find((product) => product._id === id)).filter(Boolean).slice(0, 4);
  }, [products]);

  const recommendationFlows = useMemo(() => {
    const matches = (names) => names
      .map((name) => products.find((product) => product.name === name))
      .filter(Boolean);

    return [
      {
        title: 'Compact prayer setup',
        description: 'Best for apartment mandirs, side tables, and daily pooja spaces.',
        products: matches(['Light Wood Table Mandir', 'Om Cutwork Twin Mandir Set', 'Wall Mounted Om Shrine'])
      },
      {
        title: 'Festive styling',
        description: 'Ideal for entrances, pooja corners, gifting, and celebration decor.',
        products: matches(['Diwali Cutwork Panel Set', 'Ganesha Rangoli Board', 'Hand Painted Mandala Decor Disc'])
      },
      {
        title: 'Statement wall decor',
        description: 'Strong picks for living rooms, foyers, and warm premium interiors.',
        products: matches(['Tree of Life Wall Panel', 'Mandala Heritage Clock Panel', 'Floral Jali Decorative Panel'])
      }
    ].filter((flow) => flow.products.length);
  }, [products]);

  const premiumHighlights = useMemo(() => {
    const pickByName = (name) => products.find((product) => product.name === name);
    return [
      {
        label: 'New arrival',
        line: 'New arrival spotlight for premium handcrafted living.',
        product: pickByName('Mandala Heritage Clock Panel') || products[0]
      },
      {
        label: 'Back in stock',
        line: 'A loved handcrafted pick is ready to order again.',
        product: pickByName('Om Cutwork Twin Mandir Set') || products[1]
      },
      {
        label: 'Best seller',
        line: 'Customer favorite for elegant spaces and meaningful gifting.',
        product: pickByName('Tree of Life Wall Panel') || products[2]
      },
      {
        label: 'Festive pick',
        line: 'Strong choice for celebration styling, gifting, and warm decor.',
        product: pickByName('Diwali Cutwork Panel Set') || products[3]
      }
    ].filter((item) => item.product);
  }, [products]);

  const submitSupport = async (event) => {
    event.preventDefault();
    setSupportState({ loading: true, message: '', error: false });

    try {
      await api.post('/enquiries', supportForm);
      setSupportForm({ name: '', email: '', phone: '', message: '' });
      setSupportState({ loading: false, message: 'Your support request has been sent. Our team will contact you shortly.', error: false });
    } catch (error) {
      setSupportState({
        loading: false,
        message: error.response?.data?.message || 'We could not send your request right now. Please try again in a moment.',
        error: true
      });
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Belimaa',
    description: 'Premium handcrafted products for sacred spaces and refined homes.',
    url: window.location.href
  };

  return (
    <div className="page-shell">
      <Seo title="Belimaa | Premium handcrafted commerce" description="Premium handcrafted products, support, order tracking, and a polished Belimaa shopping experience." schema={schema} />
      <Navbar activeCategory={activeCategory} onFilterChange={setActiveCategory} />
      <main className="content">
        <section className="shop-header">
          <div>
            <p className="eyebrow">Belimaa handcrafted collections</p>
            <h1>Premium essentials for sacred spaces and refined homes.</h1>
          </div>
          <div className="shop-header-copy">
            Shop handcrafted products, track orders, and get support from one polished premium storefront.
            <div className="header-links-row">
              <Link to="/track-order" className="secondary-button">Track an order</Link>
            </div>
          </div>
        </section>

        <section className="premium-banner-strip">
          {PREMIUM_BANNER_LINES.map((line) => (
            <article className="premium-banner-item" key={line}>
              <p>{line}</p>
            </article>
          ))}
        </section>

        <section className="products-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Premium product notifications</p>
              <h2>Highlights from the live catalog</h2>
            </div>
            <span className="result-pill">Best picks for conversion</span>
          </div>
          <div className="support-reply-grid premium-notification-grid">
            {premiumHighlights.map((item) => (
              <article className="support-reply-item premium-notification-item" key={`${item.label}-${item.product._id}`}>
                <span className="result-pill">{item.label}</span>
                <strong>{item.product.name}</strong>
                <p>{item.line}</p>
                <Link to={`/product/${item.product._id}`} className="support-chip">View product</Link>
              </article>
            ))}
          </div>
        </section>

        {recentlyViewed.length ? (
          <section className="products-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Recently viewed</p>
                <h2>Pick up where you left off</h2>
              </div>
              <span className="result-pill">{recentlyViewed.length} items</span>
            </div>
            <div className="product-grid">
              {recentlyViewed.map((product) => <ProductCard key={product._id} product={product} onAdd={addItem} />)}
            </div>
          </section>
        ) : null}

        <section className="products-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Shop all products</p>
              <h2>{activeCategory || 'Curated product listing'}</h2>
            </div>
            <span className="result-pill">{filteredProducts.length} items</span>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, index) => <div className="skeleton-card" key={index} />)}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => <ProductCard key={product._id} product={product} onAdd={addItem} />)}
            </div>
          )}
        </section>

        <section className="support-section" id="support">
          <div className="section-head">
            <div>
              <p className="eyebrow">Help and support</p>
              <h2>Need help with an order, product, or custom requirement?</h2>
            </div>
            <span className="result-pill">Fast response from Belimaa support</span>
          </div>

          <div className="support-grid">
            <div className="support-card">
              <div className="support-points">
                <article>
                  <strong>Order assistance</strong>
                  <p>Track order status, payment support, shipping help, and delivery updates.</p>
                </article>
                <article>
                  <strong>Product guidance</strong>
                  <p>Get help choosing the right handcrafted design, finish, size, and material.</p>
                </article>
                <article>
                  <strong>Custom work</strong>
                  <p>Share your idea for name plates, mandirs, wall art, or bespoke laser-cut products.</p>
                </article>
              </div>

              <div className="support-direct">
                <div>
                  <span>Call us</span>
                  <strong>+91 98765 43210</strong>
                </div>
                <div>
                  <span>Email us</span>
                  <strong>support@belimaa.com</strong>
                </div>
              </div>
            </div>

            <form className="support-card support-form-card" onSubmit={submitSupport}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Name</span>
                  <input required value={supportForm.name} onChange={(event) => setSupportForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input type="email" required value={supportForm.email} onChange={(event) => setSupportForm((current) => ({ ...current, email: event.target.value }))} />
                </label>
                <label className="form-field">
                  <span>Phone</span>
                  <input value={supportForm.phone} onChange={(event) => setSupportForm((current) => ({ ...current, phone: event.target.value }))} />
                </label>
                <label className="form-field full-span">
                  <span>How can we help?</span>
                  <textarea rows="5" required value={supportForm.message} onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} />
                </label>
              </div>

              {supportState.message ? <div className={supportState.error ? 'error-box' : 'success-box'}>{supportState.message}</div> : null}

              <button className="primary-button full-width" disabled={supportState.loading}>
                {supportState.loading ? 'Sending request...' : 'Send support request'}
              </button>
            </form>
          </div>

          <div className="support-grid support-grid-secondary">
            <div className="support-card">
              <div className="section-head compact">
                <div>
                  <p className="eyebrow">Quick answers</p>
                  <h2>Storefront support FAQs</h2>
                </div>
              </div>
              <div className="support-faq-list">
                {SUPPORT_FAQS.map((item) => (
                  <article className="support-faq-item" key={item.question}>
                    <strong>{item.question}</strong>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="support-card">
              <div className="section-head compact">
                <div>
                  <p className="eyebrow">Recommendation flows</p>
                  <h2>Find the right product faster</h2>
                </div>
              </div>
              <div className="support-flow-list">
                {recommendationFlows.map((flow) => (
                  <article className="support-flow-item" key={flow.title}>
                    <div>
                      <strong>{flow.title}</strong>
                      <p>{flow.description}</p>
                    </div>
                    <div className="support-chip-wrap">
                      {flow.products.map((product) => (
                        <Link key={product._id} to={`/product/${product._id}`} className="support-chip">
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="support-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">WhatsApp-ready</p>
                <h2>Short replies for fast support</h2>
              </div>
            </div>
            <div className="support-reply-grid">
              {QUICK_REPLY_TEMPLATES.map((reply) => (
                <article className="support-reply-item" key={reply}>
                  <p>{reply}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <WhatsAppButton />
      <MobileCartBar />
    </div>
  );
}
