import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { assetUrl } from '../services/api';

export default function ProductCard({ product, onAdd }) {
  return (
    <motion.article className="product-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} whileHover={{ y: -8 }}>
      <Link to={`/product/${product._id}`} className="product-image-wrap">
        <img src={assetUrl(product.image)} alt={product.name} className="product-image" />
      </Link>
      <div className="product-meta">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="product-price">?{product.price.toLocaleString('en-IN')}</div>
        <button className="primary-button" onClick={() => onAdd(product)}>Add to Cart</button>
      </div>
    </motion.article>
  );
}
