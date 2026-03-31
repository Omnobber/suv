import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileCartBar from '../components/MobileCartBar';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { api, assetUrl } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch {
        setProduct(fallbackProducts.find((item) => item._id === id) || fallbackProducts[0]);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) return null;

  return (
    <div className="page-shell">
      <Navbar activeCategory="" onFilterChange={() => {}} />
      <main className="content details-layout">
        <div className="details-image-card">
          <img src={assetUrl(product.image)} alt={product.name} className="details-image" />
        </div>
        <div className="details-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="details-price">?{product.price.toLocaleString('en-IN')}</div>
          <p>{product.description}</p>
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
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <MobileCartBar />
    </div>
  );
}
