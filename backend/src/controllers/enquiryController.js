import Enquiry from '../models/Enquiry.js';
import { notifyEnquiryCreated } from '../services/notificationService.js';
import { parseEnquiryPayload, serializeEnquiry } from '../utils/serializers.js';

export async function createEnquiry(req, res) {
  const enquiry = await Enquiry.create(parseEnquiryPayload(req.body));
  await notifyEnquiryCreated(enquiry);
  res.status(201).json({ enquiry: serializeEnquiry(enquiry) });
}

export async function getEnquiries(req, res) {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json({ enquiries: enquiries.map(serializeEnquiry) });
}
