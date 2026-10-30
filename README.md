# mani.co – Full‑stack E‑commerce (React + Node/Express + MongoDB)

Features: product catalogue (search/filter/sort), product page, cart, wishlist (saved per user in MongoDB),
checkout + orders, JWT register/login, user dashboard (orders, wishlist, profile), admin dashboard
(stats, product CRUD, order status, users). Admin routes are protected on the server.

## Run locally
1. Install Node 18+ and MongoDB (or use a free MongoDB Atlas URI).
2. `cd server && cp .env.example .env` (edit MONGO_URI / JWT_SECRET) then `npm install && npm run seed`
   (creates admin **admin@mani.co / Admin@123** + 8 sample products).
3. Terminal A: `cd server && npm run dev`   Terminal B: `cd client && npm install && npm run dev`
4. Open http://localhost:5173

## REST API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET/PUT | /api/auth/me | user |
| GET | /api/products, /api/products/:id | public |
| POST / PUT / DELETE | /api/products, /api/products/:id | **admin** |
| GET / POST / DELETE | /api/wishlist, /api/wishlist/:id | user |
| POST | /api/orders | user |
| GET | /api/orders/mine | user |
| PUT | /api/orders/:id/cancel | user |
| GET | /api/admin/stats, /orders, /users | **admin** |
| PUT | /api/admin/orders/:id | **admin** |
| DELETE | /api/admin/users/:id | **admin** |

## Deploy (free, one public URL)
1. **MongoDB Atlas**: create a free M0 cluster → Database Access user → Network Access allow `0.0.0.0/0` → copy the connection string.
2. Push this folder to a GitHub repo.
3. **Render.com** → New → Blueprint (uses `render.yaml`) or New Web Service:
   Build command `npm run build`, Start command `npm start`.
   Env vars: `MONGO_URI` (Atlas string), `JWT_SECRET` (long random text).
4. After first deploy open Render **Shell** and run `npm run seed` (or run it locally with the Atlas URI in `server/.env`).
5. Your live URL will be `https://<service-name>.onrender.com` (the Express server serves the React build and the API together).
   A custom domain like mani.co can be added under Render → Settings → Custom Domains.
