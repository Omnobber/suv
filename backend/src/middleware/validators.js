function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanString(value).toLowerCase());
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function fail(res, message) {
  return res.status(400).json({ message });
}

export function validateAuth(req, res, next) {
  const email = cleanString(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  if (!isEmail(email)) return fail(res, 'Enter a valid email address.');
  if (password.length < 6) return fail(res, 'Password must be at least 6 characters.');
  req.body.email = email;
  next();
}

export function validateOrder(req, res, next) {
  const customer = req.body.customer || {};
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!cleanString(customer.name)) return fail(res, 'Customer name is required.');
  if (!isEmail(customer.email)) return fail(res, 'A valid customer email is required.');
  if (cleanString(customer.phone).replace(/\D/g, '').length < 10) return fail(res, 'A valid customer phone is required.');
  if (!cleanString(customer.address) || !cleanString(customer.city) || !cleanString(customer.state) || !cleanString(customer.pincode)) {
    return fail(res, 'Complete delivery address is required.');
  }
  if (!items.length) return fail(res, 'Order must contain at least one item.');

  for (const item of items) {
    if (!cleanString(item._id || item.id)) return fail(res, 'Each order item must include a product id.');
    if (numeric(item.quantity ?? item.qty) <= 0) return fail(res, 'Each order item must have a valid quantity.');
  }

  next();
}

export function validateEnquiry(req, res, next) {
  const name = cleanString(req.body.name);
  const email = cleanString(req.body.email).toLowerCase();
  const message = cleanString(req.body.message);

  if (name.length < 2) return fail(res, 'Please enter your name.');
  if (!isEmail(email)) return fail(res, 'Please enter a valid email.');
  if (message.length < 10) return fail(res, 'Please share a little more detail so we can help.');
  req.body.email = email;
  next();
}

export function validateProduct(req, res, next) {
  const name = cleanString(req.body.name);
  const category = cleanString(req.body.category);
  const price = numeric(req.body.price);
  const stock = numeric(req.body.stock);

  if (!name) return fail(res, 'Product name is required.');
  if (!category) return fail(res, 'Product category is required.');
  if (!Number.isFinite(price) || price < 0) return fail(res, 'Product price must be a valid number.');
  if (!Number.isFinite(stock) || stock < 0) return fail(res, 'Product stock must be a valid number.');
  next();
}

export function validateReview(req, res, next) {
  const name = cleanString(req.body.name);
  const title = cleanString(req.body.title);
  const comment = cleanString(req.body.comment);
  const rating = numeric(req.body.rating);

  if (name.length < 2) return fail(res, 'Reviewer name is required.');
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return fail(res, 'Rating must be between 1 and 5.');
  if (title.length < 3) return fail(res, 'Review title is required.');
  if (comment.length < 10) return fail(res, 'Review comment must be at least 10 characters.');
  next();
}

export function validateAbandonedCart(req, res, next) {
  const email = cleanString(req.body.email).toLowerCase();
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!isEmail(email)) return fail(res, 'A valid email is required to save your cart.');
  if (!items.length) return fail(res, 'Cart is empty.');
  req.body.email = email;
  next();
}
