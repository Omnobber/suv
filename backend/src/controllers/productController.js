import Product from '../models/Product.js';
import { parseProductPayload, serializeProduct } from '../utils/serializers.js';

function buildProductQuery(params = {}) {
  const search = String(params.search || '').trim();
  if (!search) return {};

  return {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subcategory: { $regex: search, $options: 'i' } }
    ]
  };
}

function getSort(sort) {
  switch (sort) {
    case 'price-asc':
      return { price: 1, createdAt: -1 };
    case 'price-desc':
      return { price: -1, createdAt: -1 };
    case 'name-asc':
      return { name: 1 };
    default:
      return { featured: -1, createdAt: -1 };
  }
}

export async function getProducts(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);
  const products = await Product.find(buildProductQuery(req.query)).sort(getSort(req.query.sort)).limit(limit);
  res.json({ products: products.map(serializeProduct) });
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ product: serializeProduct(product) });
}

export async function createProduct(req, res) {
  const product = await Product.create(parseProductPayload(req.body, req.file?.filename));
  res.status(201).json({ product: serializeProduct(product) });
}

export async function updateProduct(req, res) {
  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Product not found.' });

  const payload = parseProductPayload(req.body, req.file?.filename);
  if (!req.file && !req.body.image && !req.body.image_url) {
    payload.image = existing.image;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json({ product: serializeProduct(product) });
}

export async function deleteProduct(req, res) {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).end();
}