import AdminActivity from '../models/AdminActivity.js';
import Coupon from '../models/Coupon.js';
import Enquiry from '../models/Enquiry.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import StaffAccess from '../models/StaffAccess.js';
import {
  parseFlexiblePayload,
  parseEnquiryPayload,
  parseOrderPayload,
  parseProductPayload,
  parseSettingsPayload,
  serializeFlexibleRecord,
  serializeEnquiry,
  serializeOrder,
  serializeProduct,
  serializeSettings
} from '../utils/serializers.js';

const TABLE = {
  products: 'belimaa_products',
  orders: 'belimaa_orders',
  enquiries: 'belimaa_enquiries',
  settings: 'belimaa_settings',
  coupons: 'belimaa_coupons',
  staff: 'belimaa_staff',
  activity: 'belimaa_admin_activity'
};

const WRITE_ALLOWED = new Set([TABLE.products, TABLE.enquiries, TABLE.settings, TABLE.coupons, TABLE.staff, TABLE.activity]);
const PATCH_ALLOWED = new Set([TABLE.orders, TABLE.enquiries, TABLE.settings, TABLE.coupons, TABLE.staff, TABLE.activity]);
const DELETE_ALLOWED = new Set([TABLE.products, TABLE.enquiries, TABLE.coupons, TABLE.staff, TABLE.activity]);

function getLimit(value, fallback = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 500);
}

function getProductSort(sort) {
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

export async function listTable(req, res) {
  const { table } = req.params;
  const limit = getLimit(req.query.limit);

  if (table === TABLE.products) {
    const search = String(req.query.search || '').trim();
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { subcategory: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const products = await Product.find(query).sort(getProductSort(req.query.sort)).limit(limit);
    return res.json({ data: products.map(serializeProduct) });
  }

  if (table === TABLE.orders) {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(limit);
    return res.json({ data: orders.map(serializeOrder) });
  }

  if (table === TABLE.enquiries) {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(limit);
    return res.json({ data: enquiries.map(serializeEnquiry) });
  }

  if (table === TABLE.settings) {
    const settings = await Setting.find().sort({ updatedAt: -1 }).limit(limit);
    return res.json({ data: settings.map(serializeSettings) });
  }

  if (table === TABLE.coupons) {
    const coupons = await Coupon.find().sort({ updatedAt: -1 }).limit(limit);
    return res.json({ data: coupons.map(serializeFlexibleRecord) });
  }

  if (table === TABLE.staff) {
    const staff = await StaffAccess.find().sort({ updatedAt: -1 }).limit(limit);
    return res.json({ data: staff.map(serializeFlexibleRecord) });
  }

  if (table === TABLE.activity) {
    const activity = await AdminActivity.find().sort({ at: -1, createdAt: -1 }).limit(limit);
    return res.json({ data: activity.map(serializeFlexibleRecord) });
  }

  return res.status(404).json({ message: 'Unknown table.' });
}

export async function getTableRecord(req, res) {
  const { table, id } = req.params;

  if (table === TABLE.products) {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ data: serializeProduct(product) });
  }

  if (table === TABLE.orders) {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json({ data: serializeOrder(order) });
  }

  if (table === TABLE.enquiries) {
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    return res.json({ data: serializeEnquiry(enquiry) });
  }

  if (table === TABLE.settings) {
    const settings = await Setting.findById(id);
    if (!settings) return res.status(404).json({ message: 'Settings not found.' });
    return res.json({ data: serializeSettings(settings) });
  }

  if (table === TABLE.coupons) {
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    return res.json({ data: serializeFlexibleRecord(coupon) });
  }

  if (table === TABLE.staff) {
    const staff = await StaffAccess.findById(id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
    return res.json({ data: serializeFlexibleRecord(staff) });
  }

  if (table === TABLE.activity) {
    const activity = await AdminActivity.findById(id);
    if (!activity) return res.status(404).json({ message: 'Activity record not found.' });
    return res.json({ data: serializeFlexibleRecord(activity) });
  }

  return res.status(404).json({ message: 'Unknown table.' });
}

export async function createTableRecord(req, res) {
  const { table } = req.params;
  if (!WRITE_ALLOWED.has(table)) return res.status(403).json({ message: 'Create is disabled for this table.' });

  if (table === TABLE.products) {
    const product = await Product.create(parseProductPayload(req.body, req.file?.filename));
    return res.status(201).json({ data: serializeProduct(product) });
  }

  if (table === TABLE.enquiries) {
    const enquiry = await Enquiry.create(parseEnquiryPayload(req.body));
    return res.status(201).json({ data: serializeEnquiry(enquiry) });
  }

  if (table === TABLE.settings) {
    const settings = await Setting.create(parseSettingsPayload(req.body));
    return res.status(201).json({ data: serializeSettings(settings) });
  }

  if (table === TABLE.coupons) {
    const coupon = await Coupon.create(parseFlexiblePayload(req.body));
    return res.status(201).json({ data: serializeFlexibleRecord(coupon) });
  }

  if (table === TABLE.staff) {
    const staff = await StaffAccess.create(parseFlexiblePayload(req.body));
    return res.status(201).json({ data: serializeFlexibleRecord(staff) });
  }

  if (table === TABLE.activity) {
    const activity = await AdminActivity.create(parseFlexiblePayload(req.body));
    return res.status(201).json({ data: serializeFlexibleRecord(activity) });
  }

  return res.status(404).json({ message: 'Unknown table.' });
}

export async function updateTableRecord(req, res) {
  const { table, id } = req.params;
  if (!WRITE_ALLOWED.has(table)) return res.status(403).json({ message: 'Update is disabled for this table.' });

  if (table === TABLE.products) {
    const current = await Product.findById(id);
    if (!current) return res.status(404).json({ message: 'Product not found.' });

    const nextPayload = {
      ...parseProductPayload(req.body, req.file?.filename),
      image: req.file?.filename
        ? `/uploads/${req.file.filename}`
        : (req.body.image_url || req.body.image || current.image)
    };

    const product = await Product.findByIdAndUpdate(id, nextPayload, { new: true, runValidators: true });
    return res.json({ data: serializeProduct(product) });
  }

  if (table === TABLE.settings) {
    const settings = await Setting.findByIdAndUpdate(id, parseSettingsPayload(req.body), { new: true, runValidators: true });
    if (!settings) return res.status(404).json({ message: 'Settings not found.' });
    return res.json({ data: serializeSettings(settings) });
  }

  if (table === TABLE.enquiries) {
    const enquiry = await Enquiry.findByIdAndUpdate(id, parseEnquiryPayload(req.body), { new: true, runValidators: true });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    return res.json({ data: serializeEnquiry(enquiry) });
  }

  if (table === TABLE.coupons) {
    const coupon = await Coupon.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    return res.json({ data: serializeFlexibleRecord(coupon) });
  }

  if (table === TABLE.staff) {
    const staff = await StaffAccess.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
    return res.json({ data: serializeFlexibleRecord(staff) });
  }

  if (table === TABLE.activity) {
    const activity = await AdminActivity.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ message: 'Activity record not found.' });
    return res.json({ data: serializeFlexibleRecord(activity) });
  }

  return res.status(404).json({ message: 'Unknown table.' });
}

export async function patchTableRecord(req, res) {
  const { table, id } = req.params;
  if (!PATCH_ALLOWED.has(table)) return res.status(403).json({ message: 'Patch is disabled for this table.' });

  if (table === TABLE.orders) {
    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...(req.body.status ? { status: req.body.status } : {}),
        ...(req.body.payment_status ? { paymentStatus: req.body.payment_status } : {}),
        ...(req.body.payment_method ? { paymentMethod: req.body.payment_method } : {})
      },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json({ data: serializeOrder(order) });
  }

  if (table === TABLE.enquiries) {
    const enquiry = await Enquiry.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    return res.json({ data: serializeEnquiry(enquiry) });
  }

  if (table === TABLE.settings) {
    const settings = await Setting.findByIdAndUpdate(id, parseSettingsPayload(req.body), { new: true, runValidators: true });
    if (!settings) return res.status(404).json({ message: 'Settings not found.' });
    return res.json({ data: serializeSettings(settings) });
  }

  if (table === TABLE.coupons) {
    const coupon = await Coupon.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    return res.json({ data: serializeFlexibleRecord(coupon) });
  }

  if (table === TABLE.staff) {
    const staff = await StaffAccess.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
    return res.json({ data: serializeFlexibleRecord(staff) });
  }

  if (table === TABLE.activity) {
    const activity = await AdminActivity.findByIdAndUpdate(id, parseFlexiblePayload(req.body), { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ message: 'Activity record not found.' });
    return res.json({ data: serializeFlexibleRecord(activity) });
  }

  return res.status(404).json({ message: 'Unsupported patch route.' });
}

export async function deleteTableRecord(req, res) {
  const { table, id } = req.params;
  if (!DELETE_ALLOWED.has(table)) return res.status(403).json({ message: 'Delete is disabled for this table.' });

  if (table === TABLE.products) {
    await Product.findByIdAndDelete(id);
    return res.status(204).end();
  }

  if (table === TABLE.enquiries) {
    await Enquiry.findByIdAndDelete(id);
    return res.status(204).end();
  }

  if (table === TABLE.coupons) {
    await Coupon.findByIdAndDelete(id);
    return res.status(204).end();
  }

  if (table === TABLE.staff) {
    await StaffAccess.findByIdAndDelete(id);
    return res.status(204).end();
  }

  if (table === TABLE.activity) {
    await AdminActivity.findByIdAndDelete(id);
    return res.status(204).end();
  }

  return res.status(404).json({ message: 'Unsupported delete route.' });
}
