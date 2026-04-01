import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

export default function Navbar({ activeCategory, onFilterChange }) {
  const { count } = useCart();

  return (
    <>
      <div className="shipping-banner">Free shipping on orders above ?999+</div>
      <header className="navbar">
        <Link to="/" className="logo-link"><Logo /></Link>
        <div className="nav-main">
          <div className="header-links-row">
            <a href="#support" className="support-link">Help & Support</a>
            <Link to="/track-order" className="support-link">Track Order</Link>
          </div>
          <nav className="nav-pills">
            <button className={!activeCategory ? 'active' : ''} onClick={() => onFilterChange('')}>All Products</button>
            {categories.map((category) => (
              <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => onFilterChange(category)}>{category}</button>
            ))}
          </nav>
        </div>
        <Link to="/checkout" className="cart-indicator">
          <span>Cart</span>
          <strong>{count}</strong>
        </Link>
      </header>
    </>
  );
}
