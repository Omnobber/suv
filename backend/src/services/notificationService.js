const CHANNELS = [
  { type: 'email', env: 'NOTIFY_EMAIL_WEBHOOK_URL' },
  { type: 'whatsapp', env: 'NOTIFY_WHATSAPP_WEBHOOK_URL' },
  { type: 'push', env: 'NOTIFY_PUSH_WEBHOOK_URL' },
  { type: 'sms', env: 'NOTIFY_SMS_WEBHOOK_URL' }
];

async function postWebhook(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Webhook failed (${response.status}): ${text}`);
  }
}

async function notifyChannels(event, payload) {
  const tasks = CHANNELS.map(async ({ type, env }) => {
    const url = process.env[env];
    if (!url) {
      console.log(`[notifications:${type}]`, event, payload.subject || payload.message || payload.title || '');
      return;
    }

    await postWebhook(url, { channel: type, event, ...payload });
  });

  await Promise.allSettled(tasks);
}

export async function notifyOrderCreated(order, lowStockProducts = []) {
  await notifyChannels('order.created', {
    subject: `New order ${order.invoiceNumber || order._id}`,
    title: `New order from ${order.customer?.name || 'customer'}`,
    message: `Order total INR ${order.total}. Tracking: ${order.trackingNumber || 'pending'}.`,
    orderId: String(order._id),
    invoiceNumber: order.invoiceNumber,
    trackingNumber: order.trackingNumber,
    customer: order.customer,
    total: order.total,
    lowStockProducts
  });
}

export async function notifyEnquiryCreated(enquiry) {
  await notifyChannels('support.enquiry', {
    subject: `New support enquiry from ${enquiry.name || 'visitor'}`,
    title: `Support request: ${enquiry.name || 'visitor'}`,
    message: enquiry.message,
    enquiryId: String(enquiry._id),
    email: enquiry.email,
    phone: enquiry.phone
  });
}

export async function notifyAbandonedCart(cart) {
  await notifyChannels('cart.abandoned', {
    subject: `Abandoned cart from ${cart.name || cart.email}`,
    title: 'Abandoned cart lead',
    message: `Cart value INR ${cart.total}.`,
    cartId: String(cart._id),
    email: cart.email,
    total: cart.total
  });
}
