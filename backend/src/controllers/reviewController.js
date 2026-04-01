import Product from '../models/Product.js';
import Review from '../models/Review.js';

function serializeReview(review) {
  return {
    id: String(review._id),
    _id: String(review._id),
    product: String(review.product),
    name: review.name,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    status: review.status,
    created_at: review.createdAt,
    updated_at: review.updatedAt
  };
}

export async function listProductReviews(req, res) {
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' }).sort({ createdAt: -1 });
  const reviewCount = reviews.length;
  const averageRating = reviewCount ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;

  res.json({
    reviews: reviews.map(serializeReview),
    summary: {
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount
    }
  });
}

export async function createReview(req, res) {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });

  const review = await Review.create({
    product: product._id,
    name: req.body.name?.trim(),
    rating: Number(req.body.rating),
    title: req.body.title?.trim(),
    comment: req.body.comment?.trim(),
    status: 'pending'
  });

  res.status(201).json({
    review: serializeReview(review),
    message: 'Review submitted and awaiting approval.'
  });
}

export async function listAdminReviews(_req, res) {
  const reviews = await Review.find().populate('product', 'name').sort({ createdAt: -1 });
  res.json({
    reviews: reviews.map((review) => ({
      ...serializeReview(review),
      productName: review.product?.name || 'Unknown product'
    }))
  });
}

export async function updateReviewStatus(req, res) {
  const nextStatus = String(req.body.status || '').trim();
  if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Unsupported review status.' });
  }

  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { status: nextStatus },
    { new: true, runValidators: true }
  ).populate('product', 'name');

  if (!review) return res.status(404).json({ message: 'Review not found.' });

  res.json({
    review: {
      ...serializeReview(review),
      productName: review.product?.name || 'Unknown product'
    }
  });
}
