import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { notifyOrderCreated } from '../services/notificationService.js';
import { parseOrderPayload, serializeOrder } from '../utils/serializers.js';

const usingPlaceholderKeys = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder') || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('placeholder');

const razorpay = usingPlaceholderKeys ? null : new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function getOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ orders: orders.map(serializeOrder) });
}

export async function createOrder(req, res) {
  const payload = parseOrderPayload(req.body);
  const orderedItems = payload.items;
  const productIds = orderedItems.map((item) => item.id);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  for (const item of orderedItems) {
    const product = productMap.get(String(item.id));
    if (!product) {
      return res.status(400).json({ message: `Product not found for item ${item.name || item.id}.` });
    }
    if (product.stock < item.qty) {
      return res.status(400).json({ message: `${product.name} only has ${product.stock} left in stock.` });
    }
  }

  for (const item of orderedItems) {
    const product = productMap.get(String(item.id));
    product.stock -= item.qty;
    await product.save();
  }

  const razorpayOrder = razorpay
    ? await razorpay.orders.create({ amount: Number(payload.total) * 100, currency: 'INR', receipt: `belimaa_${Date.now()}` })
    : { id: `mock_order_${Date.now()}`, amount: Number(payload.total) * 100, currency: 'INR' };

  const order = await Order.create({
    ...payload,
    invoiceNumber: `INV-${Date.now()}`,
    trackingNumber: `BLM-${String(Date.now()).slice(-8)}`,
    razorpayOrderId: razorpayOrder.id
  });

  const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD || 5);
  const lowStockProducts = products
    .filter((product) => product.stock <= lowStockThreshold)
    .map((product) => ({ id: String(product._id), name: product.name, stock: product.stock }));

  await notifyOrderCreated(order, lowStockProducts);

  res.status(201).json({ order: serializeOrder(order), razorpayOrder, mockMode: usingPlaceholderKeys });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!usingPlaceholderKeys) {
    const digest = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }
  }

  const order = await Order.findByIdAndUpdate(req.params.id, {
    paymentStatus: 'paid',
    status: 'confirmed',
    razorpayPaymentId: razorpay_payment_id || 'mock_payment',
    razorpaySignature: razorpay_signature || 'mock_signature'
  }, { new: true });

  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order: serializeOrder(order) });
}

export async function trackOrder(req, res) {
  const identifier = String(req.query.identifier || '').trim();
  const email = String(req.query.email || '').trim().toLowerCase();

  if (!identifier || !email) {
    return res.status(400).json({ message: 'Order identifier and email are required.' });
  }

  const orderLookup = [
    { invoiceNumber: identifier },
    { trackingNumber: identifier },
    { razorpayOrderId: identifier }
  ];

  if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
    orderLookup.push({ _id: identifier });
  }

  const order = await Order.findOne({
    $and: [
      { $or: orderLookup },
      { 'customer.email': email }
    ]
  });

  if (!order) return res.status(404).json({ message: 'Order not found for those details.' });

  res.json({ order: serializeOrder(order) });
}

export async function getInvoice(req, res) {
  const order = await Order.findById(req.params.id);
  const email = String(req.query.email || '').trim().toLowerCase();

  if (!order) return res.status(404).send('Order not found.');
  if (!email || email !== String(order.customer?.email || '').trim().toLowerCase()) {
    return res.status(403).send('Invoice access denied.');
  }

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${order.invoiceNumber || order._id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #142033; }
        .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .card { border: 1px solid #dfe6ef; border-radius: 16px; padding: 20px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #e8edf4; }
      </style>
    </head>
    <body>
      <h1>Belimaa Invoice</h1>
      <div class="row"><strong>Invoice</strong><span>${order.invoiceNumber || order._id}</span></div>
      <div class="row"><strong>Tracking</strong><span>${order.trackingNumber || 'Pending'}</span></div>
      <div class="row"><strong>Customer</strong><span>${order.customer?.name || ''}</span></div>
      <div class="row"><strong>Email</strong><span>${order.customer?.email || ''}</span></div>
      <div class="card">
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          </thead>
          <tbody>
            ${order.items.map((item) => `<tr><td>${item.name}</td><td>${item.qty}</td><td>INR ${item.price}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="row"><strong>Subtotal</strong><span>INR ${order.subtotal}</span></div>
        <div class="row"><strong>Shipping</strong><span>INR ${order.shipping}</span></div>
        <div class="row"><strong>Total</strong><span>INR ${order.total}</span></div>
      </div>
    </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
