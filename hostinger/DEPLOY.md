# Hostinger Deployment

This repo is set up to run smoothly on a Hostinger VPS with:

- Root storefront served by the Express backend
- API served from the same domain under `/api`
- Images and uploads served by the same Node app
- MongoDB connected by `MONGODB_URI`

## Recommended setup

Use a Hostinger VPS or other Node-capable hosting plan. The simplest production shape is:

1. Domain points to your VPS
2. Nginx or OpenLiteSpeed reverse proxies to the Node app on port `5000`
3. PM2 keeps the backend process alive
4. MongoDB runs in Atlas or another managed cluster

## Server requirements

- Node.js 20+
- npm 10+
- PM2
- Nginx or OpenLiteSpeed

## Environment

Copy:

- `backend/.env.production.example` -> `backend/.env`

Set:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## First deploy

```bash
git clone <your-repo>
cd belimaa
npm install
cp backend/.env.production.example backend/.env
npm run seed --workspace backend
npm run start --workspace backend
```

For PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Nginx reverse proxy example

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After Nginx is live, add SSL:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Update deploys

```bash
git pull
npm install
pm2 restart belimaa
```

## Notes

- The production backend now serves:
  - `/`
  - `/index.html`
  - `/products.html`
  - `/product-detail.html`
  - `/category.html`
  - `/cart.html`
  - `/login.html`
  - `/admin.html`
  - `/css/*`
  - `/js/*`
  - `/images/*`
  - `/uploads/*`
  - `/api/*`
- If you want to deploy the React app instead of the root storefront, keep `frontend/` as a separate build target and point `VITE_API_URL` to the backend domain.
