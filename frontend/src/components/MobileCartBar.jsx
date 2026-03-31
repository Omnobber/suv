import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function MobileCartBar() {
  const { count, total } = useCart();
  if (!count) return null;

  return (
    <Link to="/checkout" className="mobile-cart-bar">
      <span>{count} items</span>
      <strong>View Cart • ?{total.toLocaleString('en-IN')}</strong>
    </Link>
  );
}
