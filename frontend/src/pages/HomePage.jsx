import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import MobileCartBar from '../components/MobileCartBar';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';

export default function HomePage() {
  const [products, setProducts] = useState(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="page-shell">
      <Navbar activeCategory={activeCategory} onFilterChange={setActiveCategory} />
      <main className="content">
        <section className="shop-header">
          <div>
            <p className="eyebrow">Belimaa handcrafted collections</p>
            <h1>Premium essentials for sacred spaces and refined homes.</h1>
          </div>
          <div className="shop-header-copy">
            The homepage begins directly with shopping, featuring a quiet white palette, spacious product grid,
            and category-led browsing for your premium handcrafted brand.
          </div>
        </section>

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
      </main>
      <WhatsAppButton />
      <MobileCartBar />
    </div>
  );
}
