const FALLBACK_IMAGE = 'https://placehold.co/900x1000/f5f7fb/1b3050?text=Belimaa';

function toPlain(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === 'function') {
    return doc.toObject({ virtuals: true });
  }
  return { ...doc };
}

export function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

export function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return normalizeStringArray(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }
    return trimmed.split(',').map((entry) => entry.trim()).filter(Boolean);
  }

  return [];
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function serializeProduct(doc) {
  const raw = toPlain(doc) || {};
  const id = String(raw._id || raw.id || '');
  const image = cleanString(raw.image || raw.image_url, FALLBACK_IMAGE) || FALLBACK_IMAGE;
  const price = numberOr(raw.price);
  const originalPrice = numberOr(raw.original_price ?? raw.originalPrice, price);

  return {
    ...raw,
    id,
    _id: id,
    name: cleanString(raw.name),
    category: cleanString(raw.category),
    subcategory: cleanString(raw.subcategory),
    description: cleanString(raw.description),
    price,
    original_price: originalPrice,
    stock: numberOr(raw.stock),
    image,
    image_url: image,
    featured: normalizeBoolean(raw.featured),
    active: normalizeBoolean(raw.active, true),
    tags: normalizeStringArray(raw.tags),
    created_at: raw.createdAt || raw.created_at || null,
    updated_at: raw.updatedAt || raw.updated_at || null
  };
}

export function parseProductPayload(body = {}, uploadedFileName = '') {
  const price = numberOr(body.price);
  const originalPrice = numberOr(body.original_price ?? body.originalPrice, price);
  const image = uploadedFileName
    ? `/uploads/${uploadedFileName}`
    : cleanString(body.image_url || body.image, FALLBACK_IMAGE) || FALLBACK_IMAGE;

  return {
    name: cleanString(body.name),
    category: cleanString(body.category),
    subcategory: cleanString(body.subcategory),
    description: cleanString(body.description),
    price,
    original_price: originalPrice,
    stock: numberOr(body.stock),
    image,
    featured: normalizeBoolean(body.featured),
    active: normalizeBoolean(body.active, true),
    tags: normalizeStringArray(body.tags)
  };
}

function normalizeOrderItems(value) {
  let items = value;

  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const id = String(item.id || item._id || item.productId || index + 1);
    const image = cleanString(item.image_url || item.image);
    const qty = numberOr(item.qty ?? item.quantity, 1);

    return {
      id,
      _id: id,
      name: cleanString(item.name),
      category: cleanString(item.category),
      price: numberOr(item.price),
      qty,
      quantity: qty,
      image,
      image_url: image
    };
  });
}

export function parseOrderPayload(body = {}) {
  const customer = body.customer && typeof body.customer === 'object'
    ? {
        name: cleanString(body.customer.name),
        email: cleanString(body.customer.email),
        phone: cleanString(body.customer.phone),
        address: cleanString(body.customer.address),
        city: cleanString(body.customer.city),
        state: cleanString(body.customer.state),
        pincode: cleanString(body.customer.pincode)
      }
    : {
        name: cleanString(body.customer_name || body.customerName || body.name),
        email: cleanString(body.customer_email || body.customerEmail || body.email),
        phone: cleanString(body.customer_phone || body.customerPhone || body.phone),
        address: cleanString(body.customer_address || body.customerAddress || body.address),
        city: cleanString(body.city),
        state: cleanString(body.state),
        pincode: cleanString(body.pincode)
      };

  const items = normalizeOrderItems(body.items);
  const subtotal = numberOr(body.subtotal, items.reduce((sum, item) => sum + item.price * item.qty, 0));
  const shipping = numberOr(body.shipping, subtotal >= 999 ? 0 : 79);
  const total = numberOr(body.total, subtotal + shipping);

  return {
    customer,
    items,
    subtotal,
    shipping,
    total,
    paymentMethod: cleanString(body.payment_method || body.paymentMethod, 'cod') || 'cod',
    paymentStatus: cleanString(body.payment_status || body.paymentStatus, 'created') || 'created',
    status: cleanString(body.status, 'pending') || 'pending',
    notes: cleanString(body.notes)
  };
}

export function serializeOrder(doc) {
  const raw = toPlain(doc) || {};
  const id = String(raw._id || raw.id || '');
  const items = normalizeOrderItems(raw.items);

  return {
    ...raw,
    id,
    _id: id,
    customer_name: cleanString(raw.customer?.name || raw.customer_name),
    customer_email: cleanString(raw.customer?.email || raw.customer_email),
    customer_phone: cleanString(raw.customer?.phone || raw.customer_phone),
    customer_address: cleanString(raw.customer?.address || raw.customer_address),
    customer_city: cleanString(raw.customer?.city || raw.customer_city),
    customer_state: cleanString(raw.customer?.state || raw.customer_state),
    customer_pincode: cleanString(raw.customer?.pincode || raw.customer_pincode),
    items: JSON.stringify(items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      qty: item.qty,
      image_url: item.image_url
    }))),
    subtotal: numberOr(raw.subtotal),
    shipping: numberOr(raw.shipping),
    total: numberOr(raw.total),
    payment_method: cleanString(raw.paymentMethod || raw.payment_method, 'cod') || 'cod',
    payment_status: cleanString(raw.paymentStatus || raw.payment_status, 'created') || 'created',
    status: cleanString(raw.status, 'pending') || 'pending',
    invoiceNumber: cleanString(raw.invoiceNumber || raw.invoice_number),
    invoice_number: cleanString(raw.invoiceNumber || raw.invoice_number),
    trackingNumber: cleanString(raw.trackingNumber || raw.tracking_number),
    tracking_number: cleanString(raw.trackingNumber || raw.tracking_number),
    notes: cleanString(raw.notes),
    razorpay_order_id: cleanString(raw.razorpayOrderId || raw.razorpay_order_id),
    razorpay_payment_id: cleanString(raw.razorpayPaymentId || raw.razorpay_payment_id),
    created_at: raw.createdAt || raw.created_at || null,
    updated_at: raw.updatedAt || raw.updated_at || null
  };
}

export function parseEnquiryPayload(body = {}) {
  return {
    name: cleanString(body.name),
    email: cleanString(body.email),
    phone: cleanString(body.phone),
    message: cleanString(body.message),
    status: cleanString(body.status, 'new') || 'new'
  };
}

export function serializeEnquiry(doc) {
  const raw = toPlain(doc) || {};
  const id = String(raw._id || raw.id || '');

  return {
    ...raw,
    id,
    _id: id,
    name: cleanString(raw.name),
    email: cleanString(raw.email),
    phone: cleanString(raw.phone),
    message: cleanString(raw.message),
    status: cleanString(raw.status, 'new') || 'new',
    created_at: raw.createdAt || raw.created_at || null,
    updated_at: raw.updatedAt || raw.updated_at || null
  };
}

export function parseSettingsPayload(body = {}) {
  const payload = { ...body };
  delete payload.id;
  delete payload._id;
  delete payload.created_at;
  delete payload.updated_at;
  return payload;
}

export function serializeSettings(doc) {
  const raw = toPlain(doc) || {};
  const id = String(raw._id || raw.id || '');

  return {
    ...raw,
    id,
    _id: id,
    created_at: raw.createdAt || raw.created_at || null,
    updated_at: raw.updatedAt || raw.updated_at || null
  };
}

export function parseFlexiblePayload(body = {}) {
  const payload = { ...body };
  delete payload.id;
  delete payload._id;
  delete payload.created_at;
  delete payload.updated_at;
  return payload;
}

export function serializeFlexibleRecord(doc) {
  const raw = toPlain(doc) || {};
  const id = String(raw._id || raw.id || '');

  return {
    ...raw,
    id,
    _id: id,
    created_at: raw.createdAt || raw.created_at || null,
    updated_at: raw.updatedAt || raw.updated_at || null
  };
}
