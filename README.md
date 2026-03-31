# Belimaa Premium Commerce

Full-stack premium eCommerce setup for Belimaa with a white luxury storefront, admin panel, Express API, MongoDB models, Multer image uploads, JWT auth, and Razorpay-ready checkout.

## Structure

- `frontend/` React + Vite storefront and admin UI
- `backend/` Express + MongoDB API for products, auth, uploads, and orders
- `vercel.json` frontend SPA rewrite config
- `railway.json` backend deployment config

## Frontend highlights

- Shop-first homepage with no hero banner
- White minimal UI with soft shadows and hover/fade motion
- Gradient Belimaa wordmark plus slogan `????????? ??????`
- Category filters and 4-column desktop / 2-column mobile product grid
- Cart system with mobile sticky cart bar
- Checkout flow wired for Razorpay script usage
- Admin login and dashboard for products and orders
- Floating WhatsApp button

## Backend highlights

- Product CRUD API
- JWT auth for admin routes
- User register/login endpoints
- Multer local image upload support
- Orders API with Razorpay order creation and payment verification
- MongoDB seed script with default admin account

## Default admin credentials

- Email: `admin@belimaa.in`
- Password: `Admin@123`

## Environment variables

Copy these examples before running:

- `frontend/.env.example`
- `backend/.env.example`

## Local run

1. `npm install`
2. `npm run seed --workspace backend`
3. `npm run dev:backend`
4. `npm run dev:frontend`

If real Razorpay keys are not configured, the backend falls back to a mock order mode so frontend testing can continue.
