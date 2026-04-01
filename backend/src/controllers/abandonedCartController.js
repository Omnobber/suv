import AbandonedCart from '../models/AbandonedCart.js';
import { notifyAbandonedCart } from '../services/notificationService.js';

function serializeCart(cart) {
  return {
    id: String(cart._id),
    _id: String(cart._id),
    name: cart.name,
    email: cart.email,
    phone: cart.phone,
    items: cart.items,
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    status: cart.status,
    reminderSentAt: cart.reminderSentAt,
    created_at: cart.createdAt,
    updated_at: cart.updatedAt
  };
}

export async function upsertAbandonedCart(req, res) {
  const payload = {
    name: req.body.name?.trim() || '',
    email: req.body.email?.trim().toLowerCase(),
    phone: req.body.phone?.trim() || '',
    items: (req.body.items || []).map((item) => ({
      id: String(item._id || item.id || ''),
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || item.qty || 1)
    })),
    subtotal: Number(req.body.subtotal || 0),
    shipping: Number(req.body.shipping || 0),
    total: Number(req.body.total || 0),
    status: 'active'
  };

  const cart = await AbandonedCart.findOneAndUpdate(
    { email: payload.email, status: 'active' },
    payload,
    { new: true, upsert: true, runValidators: true }
  );

  const createdRecently = Date.now() - new Date(cart.createdAt).getTime() < 5000;
  if (createdRecently) {
    await notifyAbandonedCart(cart);
  }

  res.status(201).json({ cart: serializeCart(cart) });
}

export async function listAbandonedCarts(_req, res) {
  const carts = await AbandonedCart.find().sort({ updatedAt: -1 }).limit(100);
  res.json({ carts: carts.map(serializeCart) });
}

export async function recoverAbandonedCart(req, res) {
  const cart = await AbandonedCart.findByIdAndUpdate(
    req.params.cartId,
    { status: 'recovered', reminderSentAt: new Date() },
    { new: true }
  );

  if (!cart) return res.status(404).json({ message: 'Abandoned cart not found.' });
  res.json({ cart: serializeCart(cart) });
}
