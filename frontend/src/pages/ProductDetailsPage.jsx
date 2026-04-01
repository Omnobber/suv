import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import MobileCartBar from '../components/MobileCartBar';
import WhatsAppButton from '../components/WhatsAppButton';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { api, assetUrl } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';

const RECENTLY_VIEWED_KEY = 'belimaa-recently-viewed';

function getProductNotifications(product, relatedProducts) {
  const notifications = [];

  if ((product.stock || 0) <= 3) {
    notifications.push({
      label: 'Low stock',
      text: `Only a few pieces of ${product.name} are left. Secure your order before stock runs low.`
    });
  } else if ((product.stock || 0) <= 8) {
    notifications.push({
      label: 'Limited stock',
      text: `${product.name} has limited availability right now. It is a strong time to order if this is your preferred pick.`
    });
  }

  if (product.featured) {
    notifications.push({
      label: 'Best seller',
      text: `${product.name} is one of our most-loved handcrafted picks for premium spaces and thoughtful gifting.`
    });
  }

  notifications.push({
    label: 'Premium note',
    text: 'Thoughtful gifting. Refined craftsmanship. Timeless presence.'
  });

  if (relatedProducts[0]) {
    notifications.push({
      label: 'Complete the space',
      text: `If you are choosing ${product.name}, you may also like ${relatedProducts[0].name} to create a more finished premium setup.`
    });
  }

  return notifications.slice(0, 4);
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState(fallbackProducts);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '5', title: '', comment: '' });
  const [reviewState, setReviewState] = useState({ loading: false, message: '', error: false });
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [{ data: productData }, { data: catalogData }, { data: reviewData }] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
          api.get(`/reviews/product/${id}`)
        ]);
        setProduct(productData.product);
        setCatalog(catalogData.products?.length ? catalogData.products : fallbackProducts);
        setReviews(reviewData.reviews || []);
        setReviewSummary(reviewData.summary || { averageRating: 0, reviewCount: 0 });
      } catch {
        const fallback = fallbackProducts.find((item) => item._id === id) || fallbackProducts[0];
        setProduct(fallback);
        setCatalog(fallbackProducts);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    const current = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const next = [product._id, ...current.filter((entry) => entry !== product._id)].slice(0, 8);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return catalog
      .filter((item) => item._id !== product._id && (item.category === product.category || item.subcategory === product.subcategory))
      .slice(0, 4);
  }, [catalog, product]);

  const productNotifications = useMemo(() => (
    product ? getProductNotifications(product, relatedProducts) : []
  ), [product, relatedProducts]);

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewState({ loading: true, message: '', error: false });

    try {
      const { data } = await api.post(`/reviews/product/${id}`, reviewForm);
      setReviewForm({ name: '', rating: '5', title: '', comment: '' });
      setReviewState({ loading: false, message: data.message || 'Review submitted for moderation.', error: false });
    } catch (error) {
      setReviewState({ loading: false, message: error.response?.data?.message || 'Could not submit review.', error: true });
    }
  };

  if (!product) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [assetUrl(product.image)],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    aggregateRating: reviewSummary.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: reviewSummary.averageRating,
      reviewCount: reviewSummary.reviewCount
    } : undefined
  };

  return (
    <div className="page-shell">
      <Seo title={`${product.name} | Belimaa`} description={product.description} image={assetUrl(product.image)} schema={schema} />
      <Navbar activeCategory="" onFilterChange={() => {}} />
      <main className="content details-stack">
        <section className="details-layout">
          <div className="details-image-card">
            <img src={assetUrl(product.image)} alt={product.name} className="details-image" />
          </div>
          <div className="details-copy">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <div className="details-price">?{product.price.toLocaleString('en-IN')}</div>
            <p>{product.description}</p>
            <div className="premium-message-box">
              <strong>Premium product note</strong>
              <p>Handcrafted detail that brings warmth, meaning, and beauty home.</p>
            </div>
            <div className="details-actions">
              <button className="primary-button" onClick={() => addItem(product)}>Add to Cart</button>
              <Link to="/checkout" className="secondary-button">Go to Checkout</Link>
            </div>
            <div className="details-info-grid">
              <div>
                <span>Stock</span>
                <strong>{product.stock}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{product.price >= 999 ? 'Free' : '?149'}</strong>
              </div>
              <div>
                <span>Reviews</span>
                <strong>{reviewSummary.reviewCount || 0}</strong>
              </div>
              <div>
                <span>Average rating</span>
                <strong>{reviewSummary.averageRating || 'New'}</strong>
              </div>
            </div>
            <div className="support-faq-list details-notification-list">
              {productNotifications.map((item) => (
                <article className="support-faq-item" key={`${item.label}-${item.text}`}>
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="details-review-grid">
          <div className="admin-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Customer reviews</p>
                <h2>Trusted product feedback</h2>
              </div>
            </div>
            <div className="review-list">
              {reviews.map((review) => (
                <article className="review-card" key={review._id}>
                  <strong>{review.title}</strong>
                  <span>{review.name} · {review.rating}/5</span>
                  <p>{review.comment}</p>
                </article>
              ))}
              {!reviews.length && <p>No approved reviews yet.</p>}
            </div>
          </div>

          <form className="admin-card" onSubmit={submitReview}>
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Leave a review</p>
                <h2>Share your experience</h2>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>
                <input value={reviewForm.name} onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label className="form-field">
                <span>Rating</span>
                <select value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </label>
              <label className="form-field full-span">
                <span>Title</span>
                <input value={reviewForm.title} onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))} required />
              </label>
              <label className="form-field full-span">
                <span>Review</span>
                <textarea rows="5" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} required />
              </label>
            </div>
            {reviewState.message ? <div className={reviewState.error ? 'error-box' : 'success-box'}>{reviewState.message}</div> : null}
            <button className="primary-button full-width" disabled={reviewState.loading}>{reviewState.loading ? 'Submitting...' : 'Submit review'}</button>
          </form>
        </section>

        {relatedProducts.length ? (
          <section className="products-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Related products</p>
                <h2>You may also like</h2>
              </div>
            </div>
            <div className="product-grid">
              {relatedProducts.map((related) => <ProductCard key={related._id} product={related} onAdd={addItem} />)}
            </div>
          </section>
        ) : null}
      </main>
      <WhatsAppButton />
      <MobileCartBar />
    </div>
  );
}

